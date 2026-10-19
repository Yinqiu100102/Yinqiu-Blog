# CHANGELOG — 服务器源码变更说明

> 规则：每次对服务器源码做改动后追加一节（不覆盖旧记录），部署时把本文件上传到服务器根目录。
> 记录内容：时间、改动文件清单、API 变动、影响范围、回滚方法。

---

## 2026-10-20 · 变更：友链页卡片改版

### 改动文件

- `src/pages/Friends.tsx`：卡片结构改为「左文字 + 右头像」横向布局，名字只取「 · 」前主名；三张旧卡片简介改为站点 slogan（咡如夏 Protect What You Love.、Thinkreally 探索与爱。、Xiaobocm 我们都爱着地球）；展示链接改为与实际跳转地址一致；新增友链「执着yoyo」（yoyo-coding.github.io/me/，头像 github.com/yoyo-coding.png）
- `css/style.css`：`.friend-item` 改为横向 flex，头像以 210px 尺寸绝对定位铺在卡片右侧作背景，左侧叠 `::before` 底色渐变（纯色至 50%、渐变尾巴延至 150%）保证文字可读；网格最小列宽 180px → 230px；删除旧的 48px 小头像与圆角模式圆形头像规则

### API 变动

无。

### 影响范围

- 友链页（#/friends）视觉与数据；其余页面零影响
- 搜索功能不受影响（搜索文本仍含完整名称与网址）

### 回滚方法

`git revert` 本次提交即可恢复旧版友链卡片（纵向布局 + 48px 头像）。

---

## 2026-10-08 13:35 · 变更：CORS 白名单加入自定义域名 blog.hangou.top

### 背景

博客前端启用自定义域名 `https://blog.hangou.top`（GitHub Pages CNAME），后端接口仍在 `https://xitide.top/api/`，属跨域。原白名单不含新域名，浏览数请求被浏览器 CORS 拦截。

### 改动文件

- `api/config.php`：`allow_origins` 由三项追加 `'https://blog.hangou.top'`（现为四项）

### API 变动

无。仅 CORS 头行为变化：带 `Origin: https://blog.hangou.top` 的请求现在回显 `Access-Control-Allow-Origin: https://blog.hangou.top`（已复验）。

### 影响范围

- 博客前端（blog.hangou.top）：浏览数接口可正常跨域
- PocketAgent、其余白名单域名：零影响

### 回滚方法

把 `api/config.php` 的 `allow_origins` 改回不含 `https://blog.hangou.top` 的三项。

### 关联事项（前端侧，未动服务器）

线上浏览数不显示的主因是构建时 `VITE_VIEWS_API` 未注入（仓库 Actions Variables 未配置），前端不会发起浏览数请求。需在仓库 Settings → Secrets and variables → Actions → Variables 添加 `VITE_VIEWS_API = https://xitide.top/api/views.php`，然后重跑 workflow。

---

## 2026-10-08 03:10 · 变更：config.php CORS 白名单加入本地开发地址

### 改动文件

- `api/config.php`：`allow_origins` 由 `['https://hangou100102-lgtm.github.io', 'https://xitide.top']` 追加 `'http://localhost:5173'`（本地 Vite 开发服务器调试用）

### API 变动

无。仅 CORS 头行为变化：本地开发请求现在会回显 `Access-Control-Allow-Origin: http://localhost:5173`。

### 影响范围

- 生产前端、PocketAgent：零影响
- 本地开发（npm run dev）：现在可以直连线上接口查看真实浏览数

### 回滚方法

把 `api/config.php` 的 `allow_origins` 改回不含 `http://localhost:5173` 的两项目白名单。

---

## 2026-10-08 02:17 · 部署：博客 api/ 上线（修复 404）

### 背景

- 服务器根目录运行的是 **PocketAgent**（api.php / admin.php / install.php / index.html / config.php / data.php / downloads/），404 的原因是博客 `api/` 目录此前不在服务器上
- 本次将博客后端部署到根目录下的 `api/` 子目录，与 PocketAgent 共存：文件名零冲突、数据库各用各的表（PocketAgent 用 mysqli 自建表，博客用 `post_views` / `admins`），互不影响

### 改动文件清单（全部为服务器新增，未动 PocketAgent 任何文件）

```
api/
├─ common/bootstrap.php   公共层：配置 / PDO / CORS / JSON 输出
├─ auth/common.php        Session 守卫、CSRF、文件限流
├─ auth/login.php         登录接口
├─ auth/logout.php        退出接口
├─ auth/me.php            登录状态接口
├─ admin/index.html       后台登录页（同源）
├─ admin/admin.css        后台页样式
├─ admin/admin.js         后台页逻辑
├─ views.php              浏览量接口
├─ install.php            安装向导（未运行，留作日后重装用）
├─ schema.sql             建表 SQL
├─ config.example.php     配置模板
├─ config.php             本次部署手写生成（数据库 web12015，表名 post_views/admins，CORS 暂为 *）
└─ README.md              后端说明
```

### API 变动

新增 4 个接口（浏览量接口本次为首次随包部署）：`/api/auth/login.php`、`/api/auth/me.php`、`/api/auth/logout.php`、`/api/admin/`（页面）。`/api/views.php` 行为与此前验证一致。

### 影响范围

- PocketAgent：零影响（未改其任何文件；唯一共用点是同一 MySQL 实例，表不重叠）
- 博客前端（GitHub Pages）：零改动
- 运行时依赖：`api/data/` 目录（限流记录）会自动创建

### 遗留事项

1. ~~`api/config.php` 的 `allow_origins` 暂为 `['*']`~~ → **已收紧**（同日 02:30）：正式域名为 `xitide.top`，白名单改为 `['https://hangou100102-lgtm.github.io', 'https://xitide.top']`，已上传并复验（白名单 Origin 回显、陌生 Origin 无 CORS 头）
2. ~~数据库表名待确认~~ → **已确认无前缀**：`post_views` / `admins` 均验证通过（views 200 / 错误密码登录 401）
3. FTP 与数据库凭据已在聊天中出现，验证完成后建议全部重置
4. 根目录已上传本文件（CHANGELOG.md），后续变更追加于此

### 回滚方法

```bash
# 删除整个 api/ 目录即可，PocketAgent 不受任何影响
rm -rf /网站根目录/api
```

---

## 2026-10-08 · 第一批：公共层 + 管理员登录（待部署验证）

### 改动文件清单

**新增**

| 文件 | 说明 |
|---|---|
| `api/common/bootstrap.php` | 公共层：配置读取、PDO 连接、CORS、JSON 输出、统一错误格式 |
| `api/auth/common.php` | 认证公共层：Session、登录守卫、CSRF、文件限流 |
| `api/auth/login.php` | 登录接口（POST） |
| `api/auth/logout.php` | 退出接口（POST，需 CSRF） |
| `api/auth/me.php` | 登录状态探测（GET） |
| `api/admin/index.html` | 后台登录页（同源静态页） |
| `api/admin/admin.css` | 后台页样式（直角灰阶，适配深色模式） |
| `api/admin/admin.js` | 后台页逻辑（登录/登出/状态探测） |
| `api/README.md` | 后端说明：目录、表、接口、整合注意事项 |

**修改**

| 文件 | 变化 | 对外行为 |
|---|---|---|
| `api/views.php` | 配置/PDO/CORS/fail 改为复用 `common/bootstrap.php`，删除文件内重复代码 | **完全不变**（URL、参数、JSON 格式、状态码均一致） |

### API 变动

| 接口 | 状态 | 访问方式 | 预期返回 |
|---|---|---|---|
| `/api/views.php?paths=/posts/about` | 不变 | GET | `{"ok":true,"views":{"/posts/about":0}}` |
| `/api/views.php` | 不变 | GET（无参） | `{"ok":true,"views":{}}` |
| `/api/views.php` | 不变 | POST `{"path":"/posts/about"}` | `{"ok":true,"path":"/posts/about","views":1}` |
| `/api/auth/me.php` | 新增 | GET | 未登录 `{"ok":true,"authed":false}`；已登录 `{"ok":true,"authed":true,"username":"...","csrf":"..."}` |
| `/api/auth/login.php` | 新增 | POST `{"username":"...","password":"..."}` | 成功 `{"ok":true,"username":"...","csrf":"..."}`；失败 401 `{"ok":false,"error":"用户名或密码不正确"}` |
| `/api/auth/logout.php` | 新增 | POST，头 `X-CSRF-Token` | `{"ok":true}` |
| `/api/admin/` | 新增 | 浏览器打开 | 后台登录页 |

### 影响范围

- 前端（GitHub Pages）：零改动、零影响
- 浏览数接口：逻辑与响应格式不变，仅内部改走公共层
- 新增运行时目录 `api/data/`（限流记录，自动创建，需可写）
- 数据库：无新表、无字段变更

### 回滚方法

```bash
# 在服务器上恢复本次改动前的 api/ 目录（假设备份包为 ~/api_backup_时间戳.tar.gz）
cd /www/wwwroot/你的站点目录
rm -rf api
tar -xzf ~/api_backup_时间戳.tar.gz   # 解出旧版 api/
```

不涉及数据库，无需回滚数据。
