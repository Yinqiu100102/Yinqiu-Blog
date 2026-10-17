<?php
/* 数据库配置模板
 *
 * 推荐做法：直接访问 api/install.php，安装向导会按填写内容自动生成 config.php。
 * 手动做法：复制本文件为同目录下的 config.php，再填入自己的数据库信息。
 *
 * config.php 已加入 .gitignore，不会被提交到仓库。
 */

return [
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'database' => 'your_database',
    'username' => 'your_username',
    'password' => 'your_password',

    /* 浏览数所在的表名，与 schema.sql 保持一致（若设置了表前缀，这里要写完整表名） */
    'table'    => 'post_views',

    /* 管理员账号表名，由 api/install.php 写入管理员时使用 */
    'admin_table' => 'admins',

    /* 站点名称，供后端脚本读取（前端文案在前端项目里维护） */
    'site_name' => '白吟秋',

    /* 允许调用浏览数接口的前端来源（CORS 白名单）。
     * 站点部署在 GitHub Pages 上，域名与后端不同，因此必须放行。
     * 部署稳定后建议把 '*' 换成站点域名，例如 ['https://yinqiu100102.github.io']。 */
    'allow_origins' => ['*']
];
