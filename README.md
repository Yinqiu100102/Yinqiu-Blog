# Hangou

Hangou 的个人博客，记录学习、代码与生活。

> 在线访问：**<https://blog.hangou.top>**

基于 **Vite 5 + React 18 + TypeScript** 的静态博客，使用 HashRouter 做路由，前端构建产物为纯静态文件部署在 GitHub Pages；文章浏览数由独立部署的 PHP + MySQL 后端提供（`api/` 目录，可选接入）。

## 特性

- 默认直角风格 + 深色主题，设置页可切换圆角风格（G2 连续曲率超椭圆），外观可选深色 / 浅色 / 跟随系统
- 设置页可切换界面语言（中文 / English）与 Cookie 提示偏好
- 视频页展示 B 站主页投稿：封面、时长、播放数、弹幕数与发布日期，支持标题与简介搜索、按「最新发布 / 最多播放」排序、每页 12 条分页；数据由 GitHub Actions 每天自动同步
- 文章浏览数展示（可选接入 PHP 接口，见 `api/`；本地开发用 localStorage 模拟）
- 支持全文翻译：界面语言为 English 时可显示站内文字英文版（AI 辅助）
- 桌面端直接显示完整导航，移动端使用带图标的侧边抽屉导航
- 侧边抽屉支持遮罩模糊、Esc 关闭、遮罩关闭、焦点管理和滚动锁定
- 主题切换使用统一的全屏遮罩过渡，避免导航栏、文章卡片和页脚按钮动画不同步
- 页面首屏显示“加载中”遮罩，资源加载完成后自动淡出移除
- 首页支持按标题、标签和摘要进行多关键词模糊搜索
- 首页文章摘要自动截断，搜索仍使用完整文章文本
- 文章页右侧目录卡片：自动提取板块标题生成锚点，点击平滑跳转并高亮当前板块；宽屏常驻，窄屏收进右下角悬浮按钮
- 文章页支持点击正文图片放大预览，并提供下载按钮
- 文章页接入 giscus 评论（基于 GitHub Discussions）
- 提供关于我、友链、归档、赞助和更新日志页面
- 右上角提示条：多条堆叠显示、可拖拽划出，进度条与自动消失倒计时同步
- Cookie 提示弹窗与返回顶部按钮
- 页脚直达 B 站、GitHub 和爱发电主页
- 响应式布局，适配桌面端和移动端

## 目录结构

```
Myblog/
├── index.html                 # Vite 入口（含主题防闪内联脚本）
├── src/
│   ├── main.tsx               # 挂载 React 应用（HashRouter）
│   ├── App.tsx                # 路由与全局 Provider 组装
│   ├── pages/                 # 页面组件（首页、文章列表、视频、关于、友链、归档、赞助、更新日志、隐私、设置）
│   ├── components/            # 顶栏、页脚、抽屉、目录、评论、灯箱、视频卡片、提示条等
│   ├── context/               # 主题/语言/边角风格偏好、导航方向过渡
│   ├── data/posts.ts          # 文章列表数据
│   ├── hooks/                 # useSearch（含中文输入法处理）、useViews（浏览数）
│   ├── lib/                   # bili.ts（B站视频数据层）、views.ts（浏览数接口层）
│   └── i18n/phrases.ts        # 中英短语映射
├── css/
│   └── style.css              # 全局样式、主题变量和响应式规则
├── api/                       # PHP + MySQL 后端：文章浏览数统计与管理员登录后台（部署说明见 api/README.md）
├── scripts/
│   └── fetch-bili-videos.mjs  # B站投稿抓取脚本（Playwright 无头 Chromium）
├── public/
│   ├── images/                # 头像、配图、占位资源（原样拷贝到产物根）
│   ├── data/                  # bili-videos.json：B站投稿视频数据（Actions 自动更新）
│   └── giscus/                # giscus 自定义主题（dark.css / light.css）
├── .github/workflows/
│   ├── deploy.yml             # 推送到 main 后自动构建并发布到 Pages
│   └── bili-videos.yml        # 每天定时抓取B站投稿并提交数据
├── .env.example               # 环境变量模板（浏览数接口地址）
├── CNAME                      # GitHub Pages 自定义域名
└── README.md
```

## 本地运行

需要 Node.js 20 及以上。

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器，默认 http://localhost:5173
npm run build    # 类型检查并构建到 dist/
npm run preview  # 本地预览构建产物
```

路由使用 HashRouter，页面地址形如 `http://localhost:5173/#/posts`。

需要接入浏览数时，把 `.env.example` 复制为 `.env.local` 并填写 `VITE_VIEWS_API`；留空则本地开发用 localStorage 模拟，生产构建不显示浏览数。

## 新增文章

1. 在 `src/data/posts.ts` 的文章数组中新增一条记录（标题、日期、标签、摘要、缩略图等）；
2. 若需要独立正文页，在 `src/pages/` 下新建组件，并在 `src/App.tsx` 中注册路由；
3. 在归档页 `src/pages/Archive.tsx` 同步补充归档记录。

## 修改主题颜色

全部主题变量定义在 `css/style.css` 顶部：

- `:root`：深色模式，默认主题
- `:root[data-theme="light"]`：浅色模式

修改 `--accent`、`--bg`、`--surface` 等变量即可调整整体配色。主题偏好保存在浏览器的 `localStorage` 中，键名为 `hcl-theme`，取值为 `dark` / `light` / `system`（`system` 表示跟随系统外观）。

## 部署

推送到 `main` 分支后，[.github/workflows/deploy.yml](.github/workflows/deploy.yml) 会自动安装依赖、构建并把 `dist/` 发布到 GitHub Pages。

首次启用需要在 GitHub 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

自定义域名写在根目录的 `CNAME` 文件（`blog.hangou.top`），并在 DNS 服务商处解析到 GitHub Pages 地址。

> giscus 评论的主题 CSS（`public/giscus/*.css`）需要线上可访问的完整 URL，因此本地 `npm run dev` 下会回退使用 giscus 内置主题，构建产物才启用站点风格主题。

## B站视频数据同步

[.github/workflows/bili-videos.yml](.github/workflows/bili-videos.yml) 每天北京时间 6:00（UTC 22:00）运行，用 Playwright 无头 Chromium 抓取 B 站主页的公开投稿（自动过滤仅自己可见的视频），写入 `public/data/bili-videos.json` 后提交；有新提交会自动触发 Pages 部署，数据无变化则跳过。也可在 Actions 页面手动触发（workflow_dispatch）。

抓取对风控敏感：B 站会拦截 Node 原生请求，必须走真实浏览器上下文。建议在仓库 **Settings → Secrets and variables → Actions → Variables** 配置变量 `BILI_COOKIE`（含 SESSDATA 的登录 Cookie），可显著降低被风控的概率。

文章浏览数后端为 `api/` 下的 PHP 接口，需自行部署到支持 PHP 的主机，配置步骤见 [api/README.md](api/README.md)。

## License

Copyright © 2026 Hangou. All rights reserved.
