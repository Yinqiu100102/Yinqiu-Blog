<?php
/**
 * 白吟秋博客 · 后端安装向导
 *
 * 单文件安装程序：环境检查 → 填写信息 → 建库建表 → 创建管理员 → 写入 config.php → 生成 install.lock。
 *
 * 使用方式：
 *   1. 把整个 api/ 目录上传到服务器；
 *   2. 浏览器访问 https://你的域名/api/install.php；
 *   3. 按提示填写并提交；
 *   4. 安装完成后删除本文件（保留 install.lock 也可以，重复访问会被拒绝）。
 *
 * 本文件与 api/views.php 共用同一份 config.php（返回数组的约定），
 * 因此安装向导写入的 'table' / 'allow_origins' 会被浏览数接口直接读取，无需改动 views.php。
 */

declare(strict_types=1);

date_default_timezone_set('Asia/Shanghai');

const MIN_PHP_VERSION = '7.4.0';
const MAX_TRIES       = 10;   // 同一会话内允许的提交次数
const TRY_WINDOW      = 600;  // 计数窗口（秒）
const SESSION_NAME    = 'hcl_install';

$configFile = __DIR__ . '/config.php';
$lockFile   = __DIR__ . '/install.lock';

/* ============ 会话：仅用 Cookie 保存 CSRF Token 与尝试计数 ============ */
$isHttps   = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && $_SERVER['HTTPS'] !== 'off';
$scriptDir = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => $scriptDir === '' ? '/' : $scriptDir . '/',
    'httponly' => true,
    'secure'   => $isHttps,
    'samesite' => 'Lax'
]);
session_name(SESSION_NAME);
session_start();

/* ============ 工具函数 ============ */
function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function post_trim(string $key): string
{
    return trim((string) ($_POST[$key] ?? ''));
}

function post_raw(string $key): string
{
    return (string) ($_POST[$key] ?? '');
}

/* ---------- CSRF ---------- */
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return (string) $_SESSION['csrf'];
}

function csrf_valid(): bool
{
    $sent = (string) ($_POST['csrf'] ?? '');
    $kept = (string) ($_SESSION['csrf'] ?? '');
    return $kept !== '' && $sent !== '' && hash_equals($kept, $sent);
}

/* ---------- 基础频率限制：同一会话窗口内最多提交 MAX_TRIES 次 ---------- */
function tries_over_limit(): bool
{
    $now  = time();
    $hits = $_SESSION['tries'] ?? [];
    if (!is_array($hits)) {
        $hits = [];
    }
    $hits = array_values(array_filter($hits, static function ($t) use ($now): bool {
        return is_int($t) && ($now - $t) < TRY_WINDOW;
    }));
    $_SESSION['tries'] = $hits;

    return count($hits) >= MAX_TRIES;
}

function record_try(): void
{
    $hits = $_SESSION['tries'] ?? [];
    if (!is_array($hits)) {
        $hits = [];
    }
    $hits[] = time();
    $_SESSION['tries'] = $hits;
}

/* ---------- 环境检查 ---------- */
function env_checks(): array
{
    $writable = is_writable(__DIR__);

    return [
        [
            'label' => 'PHP 版本不低于 ' . MIN_PHP_VERSION,
            'ok'    => version_compare(PHP_VERSION, MIN_PHP_VERSION, '>='),
            'note'  => '当前版本 ' . PHP_VERSION
        ],
        [
            'label' => 'PDO 扩展',
            'ok'    => extension_loaded('pdo'),
            'note'  => extension_loaded('pdo') ? '已启用' : '未启用'
        ],
        [
            'label' => 'PDO MySQL 驱动',
            'ok'    => extension_loaded('pdo_mysql'),
            'note'  => extension_loaded('pdo_mysql') ? '已启用' : '未启用'
        ],
        [
            'label' => '安装目录可写（用于生成 config.php 与 install.lock）',
            'ok'    => $writable,
            'note'  => $writable ? '可写' : '不可写'
        ]
    ];
}

/* ---------- 数据库 ---------- */
function db_connect(string $host, int $port, string $database, string $user, string $pass): PDO
{
    $dsn = $database === ''
        ? "mysql:host={$host};port={$port};charset=utf8mb4"
        : "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    return new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 5
    ]);
}

/* 把底层异常翻译成人话：只回显通用原因，细节（含密码脱敏后）写进服务器错误日志 */
function db_error_hint(PDOException $ex, string $secret = ''): string
{
    $message = $ex->getMessage();
    if ($secret !== '') {
        $message = str_replace($secret, '******', $message);
    }
    error_log('[install] 数据库错误: ' . $message);

    switch ((int) ($ex->errorInfo[1] ?? 0)) {
        case 1045:
            return '数据库用户名或密码不正确。';
        case 2002:
        case 2003:
            return '无法连接数据库服务器，请检查主机与端口是否正确。';
        case 1044:
            return '该数据库账号没有访问或创建目标数据库的权限。';
        case 1049:
            return '指定的数据库不存在，且当前账号无法创建它。';
        default:
            return '数据库操作失败，详细原因已记录到服务器错误日志。';
    }
}

/* ---------- 页面渲染 ---------- */
function render_page(string $title, string $body): void
{
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store');

    $safeTitle = e($title);

    echo <<<HTML
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>{$safeTitle}</title>
<style>
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0; padding: 40px 16px;
  background: #f3f3f4; color: #1d1d1f;
  font: 15px/1.65 -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
}
.wrap { max-width: 720px; margin: 0 auto; }
h1 { font-size: 21px; margin: 0 0 6px; letter-spacing: -.3px; }
h2 { font-size: 15px; margin: 0 0 12px; }
p.lead { margin: 0 0 20px; color: #6b6b70; font-size: 14px; }
.card {
  background: #fff; border: 1px solid #e4e4e6;
  padding: 22px 24px; margin-bottom: 14px;
}
.card + .card { margin-top: 0; }
.notice { padding: 12px 16px; margin-bottom: 14px; font-size: 14px; border: 1px solid; border-left-width: 3px; }
.notice-ok   { background: #f2f8f3; border-color: #2f9e5f; color: #1f6b41; }
.notice-bad  { background: #fdf3f3; border-color: #d94a4a; color: #8f2626; }
.notice-warn { background: #fdf8ec; border-color: #d99a1f; color: #7a5606; }
.notice ul { margin: 6px 0 0; padding-left: 20px; }
.notice li { margin: 2px 0; }
ul.checks { list-style: none; margin: 0; padding: 0; }
ul.checks li { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid #f0f0f1; font-size: 14px; }
ul.checks li:last-child { border-bottom: 0; }
ul.checks .mark { flex: 0 0 auto; padding: 1px 8px; font-size: 12px; border: 1px solid; }
ul.checks .ok  .mark { color: #1f6b41; border-color: #2f9e5f; background: #f2f8f3; }
ul.checks .bad .mark { color: #8f2626; border-color: #d94a4a; background: #fdf3f3; }
ul.checks em { margin-left: auto; font-style: normal; color: #8a8a90; font-size: 13px; }
fieldset { border: 1px solid #e4e4e6; padding: 16px 18px; margin: 0 0 14px; }
legend { padding: 0 6px; font-size: 13px; color: #6b6b70; }
.field { display: block; margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field .label { display: block; margin-bottom: 5px; font-size: 13px; color: #3a3a3d; }
.field .label i { color: #d94a4a; font-style: normal; margin-left: 3px; }
.field input {
  width: 100%; padding: 9px 11px; font: inherit; color: inherit;
  background: #fbfbfc; border: 1px solid #d8d8db; border-radius: 0;
  outline: none; transition: border-color .15s;
}
.field input:focus { border-color: #1d1d1f; background: #fff; }
.field small { display: block; margin-top: 4px; color: #8a8a90; font-size: 12px; }
button {
  padding: 11px 26px; font: inherit; font-weight: 500; color: #fff;
  background: #1d1d1f; border: 1px solid #1d1d1f; border-radius: 0; cursor: pointer;
}
button:hover { background: #38383b; border-color: #38383b; }
button:disabled { background: #c9c9cc; border-color: #c9c9cc; cursor: not-allowed; }
.row { display: flex; gap: 12px; padding: 7px 0; border-bottom: 1px solid #f0f0f1; font-size: 14px; }
.row:last-child { border-bottom: 0; }
.row .k { flex: 0 0 96px; color: #6b6b70; }
.row .v { word-break: break-all; }
code { padding: 1px 5px; background: #f0f0f1; font-size: 13px; font-family: Consolas, Monaco, monospace; }
ol { margin: 0; padding-left: 20px; font-size: 14px; }
ol li { margin: 6px 0; }
</style>
</head>
<body>
<div class="wrap">
{$body}
</div>
</body>
</html>
HTML;
}

function field_row(string $name, string $label, string $value, string $type = 'text', string $hint = '', bool $required = false): string
{
    return '<label class="field">'
        . '<span class="label">' . e($label) . ($required ? '<i>*</i>' : '') . '</span>'
        . '<input type="' . e($type) . '" name="' . e($name) . '" value="' . e($value) . '"'
        . ($required ? ' required' : '') . ($type === 'password' ? ' autocomplete="new-password"' : '') . '>'
        . ($hint !== '' ? '<small>' . e($hint) . '</small>' : '')
        . '</label>';
}

/* ============================================================
 * 1. 已安装 → 拒绝重复安装
 * ============================================================ */
if (is_file($lockFile)) {
    render_page(
        '安装程序已锁定',
        '<h1>安装程序已锁定</h1>'
        . '<p class="lead">检测到 <code>install.lock</code>，本站已完成安装。</p>'
        . '<div class="notice notice-warn">如需重新安装，请先在服务器上删除 <code>api/install.lock</code>，'
        . '删除后再次访问本页面。重装会覆盖 <code>api/config.php</code> 中的数据库配置。</div>'
        . '<div class="notice notice-bad">无论是否需要重装，都建议直接删除 <code>api/install.php</code>。</div>'
    );
    exit;
}

/* ============================================================
 * 2. 环境检查
 * ============================================================ */
$checks = env_checks();
$envOk  = true;
foreach ($checks as $check) {
    if (!$check['ok']) {
        $envOk = false;
        break;
    }
}

/* 表单默认值；密码字段永远不会回填 */
$form = [
    'db_host'    => 'localhost',
    'db_port'    => '3306',
    'db_user'    => '',
    'db_name'    => '',
    'admin_user' => '',
    'prefix'     => '',
    'site_name'  => '白吟秋',
    'site_url'   => ''
];

$errors  = [];
$success = null;

/* ============================================================
 * 3. 处理提交
 * ============================================================ */
if ($envOk && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    if (tries_over_limit()) {
        $errors[] = '提交次数过多，请等待约 10 分钟后再试。';
    } else {
        record_try();

        if (!csrf_valid()) {
            $errors[] = '会话已过期或表单来源校验失败，请重新填写后提交。';
        } else {
            /* ---------- 读取字段（密码不做 trim，避免改动用户输入的密码） ---------- */
            $form['db_host']    = post_trim('db_host') !== '' ? post_trim('db_host') : 'localhost';
            $form['db_port']    = post_trim('db_port') !== '' ? post_trim('db_port') : '3306';
            $form['db_user']    = post_trim('db_user');
            $form['db_name']    = post_trim('db_name');
            $form['admin_user'] = post_trim('admin_user');
            $form['prefix']     = post_trim('prefix');
            $form['site_name']  = post_trim('site_name');
            $form['site_url']   = post_trim('site_url');

            $dbPass     = post_raw('db_pass');
            $adminPass  = post_raw('admin_pass');
            $adminPass2 = post_raw('admin_pass2');
            $port       = (int) $form['db_port'];

            /* ---------- 校验 ---------- */
            if (!preg_match('/^[A-Za-z0-9._\-]{1,128}$/', $form['db_host'])) {
                $errors[] = '数据库主机填写不合法，只能包含字母、数字、点、下划线与连字符。';
            }
            if ($port < 1 || $port > 65535) {
                $errors[] = '数据库端口应为 1 - 65535 之间的数字。';
            }
            if ($form['db_user'] === '') {
                $errors[] = '数据库用户名不能为空。';
            }
            if (!preg_match('/^[A-Za-z0-9_]{1,64}$/', $form['db_name'])) {
                $errors[] = '数据库名不能为空，且只能包含字母、数字与下划线。';
            }
            if ($form['prefix'] !== '' && !preg_match('/^[A-Za-z0-9_]{1,20}$/', $form['prefix'])) {
                $errors[] = '表前缀只能包含字母、数字与下划线，最长 20 个字符。';
            }
            if (!preg_match('/^[A-Za-z0-9_@.\-]{3,32}$/', $form['admin_user'])) {
                $errors[] = '管理员账号需为 3 - 32 位，只能包含字母、数字或 _ @ . - 。';
            }
            if (strlen($adminPass) < 8) {
                $errors[] = '管理员密码至少 8 位。';
            } elseif (!preg_match('/[A-Za-z]/', $adminPass) || !preg_match('/\d/', $adminPass)) {
                $errors[] = '管理员密码需同时包含字母和数字。';
            }
            if ($adminPass !== $adminPass2) {
                $errors[] = '两次输入的管理员密码不一致。';
            }
            if ($form['site_url'] !== '' && !filter_var($form['site_url'], FILTER_VALIDATE_URL)) {
                $errors[] = '站点 URL 格式不正确，需以 http:// 或 https:// 开头。';
            }

            $adminUser   = $form['admin_user'];
            $siteUrl     = rtrim($form['site_url'], '/');
            $adminsTable = $form['prefix'] . 'admins';
            $viewsTable  = $form['prefix'] . 'post_views';
            $pdo         = null;

            /* ---------- 连接数据库；库不存在且账号有权限时自动创建 ---------- */
            if ($errors === []) {
                try {
                    try {
                        $pdo = db_connect($form['db_host'], $port, $form['db_name'], $form['db_user'], $dbPass);
                    } catch (PDOException $first) {
                        /* 先不带库名连一次，尝试以 utf8mb4 建库后重连 */
                        $server = db_connect($form['db_host'], $port, '', $form['db_user'], $dbPass);
                        $server->exec(
                            'CREATE DATABASE IF NOT EXISTS `' . $form['db_name'] . '`
                             DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
                        );
                        $pdo = db_connect($form['db_host'], $port, $form['db_name'], $form['db_user'], $dbPass);
                    }
                } catch (PDOException $ex) {
                    $pdo    = null;
                    $errors[] = db_error_hint($ex, $dbPass);
                }
            }

            /* ---------- 建表 ---------- */
            if ($errors === [] && $pdo instanceof PDO) {
                try {
                    $pdo->exec(
                        "CREATE TABLE IF NOT EXISTS `{$adminsTable}` (
                            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                            `username` VARCHAR(64) NOT NULL COMMENT '登录名',
                            `password_hash` VARCHAR(255) NOT NULL COMMENT 'password_hash() 加密后的密码',
                            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `uniq_username` (`username`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员账号'"
                    );
                    $pdo->exec(
                        "CREATE TABLE IF NOT EXISTS `{$viewsTable}` (
                            `path` VARCHAR(191) NOT NULL COMMENT '站内路由，例如 /posts/about',
                            `views` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计浏览次数',
                            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
                            PRIMARY KEY (`path`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章浏览数'"
                    );
                } catch (PDOException $ex) {
                    $errors[] = db_error_hint($ex, $dbPass);
                }
            }

            /* ---------- 创建管理员（密码只以 password_hash() 结果入库） ---------- */
            if ($errors === [] && $pdo instanceof PDO) {
                try {
                    $hash = password_hash($adminPass, PASSWORD_DEFAULT);
                    if (!is_string($hash) || $hash === '') {
                        throw new RuntimeException('password_hash 返回了无效结果');
                    }

                    $find = $pdo->prepare("SELECT `id` FROM `{$adminsTable}` WHERE `username` = ? LIMIT 1");
                    $find->execute([$adminUser]);
                    $existing = $find->fetch();

                    if ($existing) {
                        $update = $pdo->prepare("UPDATE `{$adminsTable}` SET `password_hash` = ? WHERE `id` = ?");
                        $update->execute([$hash, (int) $existing['id']]);
                    } else {
                        $insert = $pdo->prepare(
                            "INSERT INTO `{$adminsTable}` (`username`, `password_hash`) VALUES (?, ?)"
                        );
                        $insert->execute([$adminUser, $hash]);
                    }
                } catch (Throwable $ex) {
                    error_log('[install] 写入管理员失败: ' . $ex->getMessage());
                    $errors[] = '管理员账号写入失败，详细原因已记录到服务器错误日志。';
                }
            }

            /* ---------- 写入 config.php ---------- */
            if ($errors === []) {
                $config = [
                    'host'          => $form['db_host'],
                    'port'          => $port,
                    'database'      => $form['db_name'],
                    'username'      => $form['db_user'],
                    'password'      => $dbPass,
                    'table'         => $viewsTable,
                    'admin_table'   => $adminsTable,
                    'site_name'     => $form['site_name'],
                    'allow_origins' => $siteUrl !== '' ? [$siteUrl] : ['*']
                ];

                $content = "<?php\n"
                    . "/* 由 api/install.php 于 " . date('Y-m-d H:i:s') . " 自动生成，请勿提交到公开仓库 */\n\n"
                    . "return " . var_export($config, true) . ";\n";

                /* 先写临时文件再改名，避免写入中断留下半个配置文件 */
                $tmp     = $configFile . '.tmp';
                $written = @file_put_contents($tmp, $content);

                if ($written === false) {
                    $errors[] = '配置文件写入失败，请确认安装目录可写后重试。';
                } else {
                    @chmod($tmp, 0600);
                    if (is_file($configFile)) {
                        @unlink($configFile);
                    }
                    if (@rename($tmp, $configFile)) {
                        @chmod($configFile, 0600);
                    } else {
                        @unlink($tmp);
                        $errors[] = '配置文件写入失败，请确认安装目录可写后重试。';
                    }
                }
            }

            /* ---------- 生成安装锁 ---------- */
            if ($errors === []) {
                @file_put_contents($lockFile, "安装完成于 " . date('c') . "\n");
                @chmod($lockFile, 0644);

                unset($_SESSION['csrf'], $_SESSION['tries']);

                $success = [
                    'database'   => $form['db_name'],
                    'admins'     => $adminsTable,
                    'views'      => $viewsTable,
                    'admin_user' => $adminUser
                ];
            }
        }
    }
}

/* ============================================================
 * 4. 渲染：安装成功页
 * ============================================================ */
if (is_array($success)) {
    $rows = '';
    foreach ([
        '数据库'     => $success['database'],
        '管理员表'   => $success['admins'],
        '浏览数表'   => $success['views'],
        '管理员账号' => $success['admin_user']
    ] as $label => $value) {
        $rows .= '<div class="row"><span class="k">' . e($label) . '</span><span class="v">' . e($value) . '</span></div>';
    }

    render_page(
        '安装完成',
        '<h1>安装完成</h1>'
        . '<p class="lead">数据库已初始化，管理员账号已创建，配置文件已生成。</p>'
        . '<div class="card">' . $rows . '</div>'
        . '<div class="notice notice-bad"><strong>请立即删除 <code>api/install.php</code>。</strong><br>'
        . '本次已生成 <code>api/install.lock</code>，在删除前再次访问也会被拒绝安装，但删除安装程序才是更彻底的做法。</div>'
        . '<div class="card"><h2>接下来要做的</h2><ol>'
        . '<li>把前端的 <code>VITE_VIEWS_API</code> 指向 <code>https://你的域名/api/views.php</code>。</li>'
        . '<li>确认服务器已禁止直接访问 <code>api/config.php</code>（见部署说明中的 Nginx 片段）。</li>'
        . '<li>如需修改站点名称、站点 URL 等配置，直接编辑 <code>api/config.php</code> 即可，无需重装。</li>'
        . '</ol></div>'
    );
    exit;
}

/* ============================================================
 * 5. 渲染：环境检查 + 安装表单
 * ============================================================ */
$envList = '';
foreach ($checks as $check) {
    $envList .= '<li class="' . ($check['ok'] ? 'ok' : 'bad') . '">'
        . '<span class="mark">' . ($check['ok'] ? '通过' : '不通过') . '</span>'
        . e($check['label'])
        . '<em>' . e($check['note']) . '</em>'
        . '</li>';
}

$body = '<h1>白吟秋博客 · 安装向导</h1>'
    . '<p class="lead">填写数据库与管理员信息，程序会自动建库建表、写入配置并锁定安装。</p>'
    . '<div class="card"><h2>环境检查</h2><ul class="checks">' . $envList . '</ul></div>';

if (!$envOk) {
    $body .= '<div class="notice notice-bad">环境检查未通过，请先解决上述问题再安装。'
        . '若「安装目录可写」不通过，请给 api/ 目录写入权限（例如 <code>chmod 755 api</code>，或把属主改为 PHP 运行用户）。</div>';
}

if (is_file($configFile)) {
    $body .= '<div class="notice notice-warn">检测到已存在 <code>api/config.php</code>。'
        . '继续安装会覆盖其中的数据库配置，请确认你了解这一点。</div>';
}

if ($errors !== []) {
    $items = '';
    foreach ($errors as $error) {
        $items .= '<li>' . e($error) . '</li>';
    }
    $body .= '<div class="notice notice-bad"><strong>请修正以下问题：</strong><ul>' . $items . '</ul></div>';
}

$formHtml = '<form method="post" autocomplete="off">'
    . '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">'
    . '<fieldset><legend>数据库连接</legend>'
    . field_row('db_host', '数据库主机', $form['db_host'], 'text', '一般为 localhost 或 127.0.0.1', true)
    . field_row('db_port', '数据库端口', $form['db_port'], 'text', '默认 3306', true)
    . field_row('db_user', '数据库用户名', $form['db_user'], 'text', '', true)
    . field_row('db_pass', '数据库密码', '', 'password', '按实际情况填写，部分本地环境可留空')
    . field_row('db_name', '数据库名', $form['db_name'], 'text', '不存在时程序会尝试自动创建（需账号有建库权限）', true)
    . '</fieldset>'
    . '<fieldset><legend>管理员账号</legend>'
    . field_row('admin_user', '管理员账号', $form['admin_user'], 'text', '3 - 32 位字母、数字或 _ @ . -', true)
    . field_row('admin_pass', '管理员密码', '', 'password', '至少 8 位，且同时包含字母和数字', true)
    . field_row('admin_pass2', '确认管理员密码', '', 'password', '再次输入以确认', true)
    . '</fieldset>'
    . '<fieldset><legend>可选设置</legend>'
    . field_row('prefix', '表前缀', $form['prefix'], 'text', '留空则使用 admins、post_views')
    . field_row('site_name', '站点名称', $form['site_name'], 'text', '', false)
    . field_row('site_url', '站点 URL', $form['site_url'], 'text', '例如 https://example.com，填写后将作为浏览数接口的跨域白名单')
    . '</fieldset>'
    . '<button type="submit"' . ($envOk ? '' : ' disabled') . '>开始安装</button>'
    . '</form>';

$body .= '<div class="card">' . $formHtml . '</div>';

render_page('白吟秋博客 · 安装向导', $body);
