/* 界面语言短语映射：中文原文 → 英文译文。
   与旧 js/i18n.js 的 ZH_TO_EN 完全一致，改为 React 侧按语言选择文案。 */
export const ZH_TO_EN: Record<string, string> = {
  /* 顶栏与无障碍标签 */
  '主导航': 'Main navigation',
  '首页': 'Home',
  '文章': 'Articles',
  '归档': 'Archive',
  '友链': 'Links',
  '更多': 'More',
  '关于我': 'About',
  '更新日志': 'Changelog',
  '赞助': 'Sponsor',
  '设置': 'Settings',
  '切换主题': 'Toggle theme',
  '打开菜单': 'Open menu',
  '回到顶部': 'Back to top',
  /* 抽屉 */
  '移动端菜单': 'Mobile menu',
  'Hangou 头像': 'Hangou avatar',
  '博客': 'Blog',
  '友链列表': 'Friends',
  '爱发电': 'Aifadian',
  '爱发电赞助': 'Support on Aifadian',
  /* 页脚 */
  '欢迎在这些地方找到我：': 'Find me here:',
  '哔哩哔哩': 'Bilibili',
  'B站主页': 'Bilibili profile',
  'GitHub主页': 'GitHub profile',
  '爱发电主页': 'Aifadian profile',
  '© 2026 Hangou · 保留所有权利': '© 2026 Hangou · All rights reserved',
  /* Cookie 提示 */
  'Cookie 与本地存储确认': 'Cookie and local storage notice',
  '本站如何使用 Cookie': 'How this site uses cookies',
  '本站不设追踪型 Cookie，仅用浏览器本地存储记住偏好设置；打开文章时会向自建接口发送文章路径以统计浏览次数，不涉及任何身份信息。详见': 'This site sets no tracking cookies. It only uses browser local storage to remember your preferences; when you open an article, the article path is sent to a self-hosted endpoint to count views, with no identity information involved. See ',
  '隐私政策': 'Privacy Policy',
  '取消': 'Cancel',
  '知道了': 'Got it',
  /* 首页 */
  '你好，这里是 Hangou': 'Hi, this is Hangou',
  '在这里能看到我的想法': 'This is where you can see my thoughts',
  '个人博客': 'Personal blog',
  '技术分享': 'Tech sharing',
  '创意作品': 'Creative works',
  '阅读文章': 'Read posts',
  '敬请期待': 'Stay tuned',
  '功能正在开发中，敬请期待～': 'This feature is still in development. Stay tuned!',
  '向下滚动': 'Scroll down',
  '找到我': 'Find me',
  '社交 & 联系': 'Social & Contact',
  '我的项目': 'My projects',
  '我做过的一些项目。': "Some projects I've made.",
  '关于我的一些介绍。': 'A little about me.',
  '了解更多': 'Learn more',
  '技术栈': 'Tech stack',
  '这个站点用到的技术。': 'Technologies behind this site.',
  '界面框架': 'UI framework',
  '类型安全': 'Type safety',
  '构建工具': 'Build tool',
  '手写样式': 'Hand-written styles',
  '自动部署': 'Automated deployment',
  '静态托管': 'Static hosting',
  '域名解析': 'DNS',
  '最近写的东西': 'Recent writing',
  '全部文章': 'All posts',
  /* 文章列表 */
  '这里收录站内全部文章，支持标题、标签与摘要关键词搜索。': 'Every post on this site. Search by title, tag or excerpt keyword.',
  '搜索文章标题、标签或摘要…': 'Search titles, tags or excerpts…',
  '搜索文章': 'Search posts',
  '没有找到相关文章，换个关键词试试？': 'No matching posts. Try another keyword.',
  '文章列表': 'Articles',
  '最近文章': 'Recent posts',
  /* 浏览数 */
  '浏览': 'views',
  /* 标签 */
  '置顶': 'Pinned',
  '关于': 'About',
  /* 评论区 */
  '评论': 'Comments',
  /* 友链 */
  '友情链接': 'Friend Links',
  '搜索友链名称、简介或网址…': 'Search friend name, intro or URL…',
  '搜索友链': 'Search friends',
  '没有找到匹配的友链，换个关键词试试？': 'No matching friends. Try another keyword.',
  '咡如夏的头像': 'Avatar of 咡如夏',
  'Thinkreally 的头像': 'Avatar of Thinkreally',
  'Xiaobocm 的头像': 'Avatar of Xiaobocm',
  /* 赞助 */
  '支持 Hangou': 'Support Hangou',
  '支持创作': 'Support my work',
  '赞助支持': 'Support on Aifadian',
  '点击下面的按钮前往爱发电完成赞助。': 'Click the button below to sponsor me on Aifadian.',
  '前往爱发电赞助': 'Sponsor on Aifadian',
  '如果我的文章、项目或分享对你有帮助，欢迎通过爱发电支持我。每一份支持都会成为继续创作的动力。': 'If my posts, projects or sharing have been helpful, you are welcome to support me on Aifadian. Every bit of support keeps me creating.',
  '赞助列表': 'Sponsors',
  '赞助名单整理中，感谢每一位支持者～': 'The sponsor list is being put together. Thanks to everyone who supports.',
  /* 设置页 */
  '语言': 'Language',
  '切换界面语言。站内文字以中文撰写，可开启下方的全文翻译。': 'Switch the interface language. The site is written in Chinese; full-text translation can be turned on below.',
  '全文翻译': 'Full-text translation',
  '开启后，界面语言为 English 时，站内各处的文字都会显示英文版本；英文内容由 AI 辅助翻译，可能出现偏差，不保证 100% 正确。': 'When on, the text across the site is shown in an English version once the interface language is English. The English text is translated with AI assistance, so it may contain inaccuracies and is not guaranteed to be 100% correct.',
  '关闭': 'Off',
  '开启': 'On',
  '主题': 'Theme',
  '选择深色、浅色或跟随系统外观，与顶栏的切换按钮保持一致。': 'Pick a dark, light or system appearance. Kept in sync with the header toggle.',
  '深色': 'Dark',
  '浅色': 'Light',
  '跟随系统': 'System',
  '样式': 'Corners',
  '选择全站的边角样式：直角风格保持现在的利落感；圆角风格把直角换为小圆角，并让转角曲线更顺滑（曲率连续）。': 'Choose the site-wide corner style: Right angle keeps the current crisp look; Rounded swaps the right angles for small radii and a smoother, curvature-continuous curve.',
  '直角风格': 'Right angle',
  '圆角风格': 'Rounded',
  'Cookie 提示': 'Cookie notice',
  '本站不设追踪型 Cookie，只在本机记住你的选择。': 'This site sets no tracking cookies and only remembers your choice on this device.',
  '每次询问': 'Ask every time',
  '不再提示': 'Do not ask again',
  '设置保存在本机浏览器，不会上传。': 'These settings are stored in this browser and never uploaded.',
  /* 关于页 */
  '我是谁': 'Who I am',
  '我在做什么': 'What I do',
  '关于 Ci OS': 'About Ci OS',
  '联系方式': 'Contact',
  '写在最后': 'Wrapping up',
  /* 归档 */
  '全部内容': 'All content',
  /* 更新日志 */
  '更新记录': 'Changelog',
  /* 友链 */
  '关于友链': 'About friend links',
  /* 隐私政策 */
  '隐私说明': 'Privacy notes',
  /* 目录 */
  '目录': 'Contents',
  /* 图片预览浮窗 */
  '图片预览': 'Image preview',
  '关闭预览': 'Close preview',
  '下载图片': 'Download image'
};

/* 各页面英文标题 */
export const TITLE_EN: Record<string, string> = {
  '/': 'Hangou',
  '/archive': 'Archive · Hangou',
  '/posts': 'Articles · Hangou',
  '/friends': 'Friend Links · Hangou',
  '/posts/about': 'About · Hangou',
  '/sponsor': 'Sponsor · Hangou',
  '/changelog': 'Changelog · Hangou',
  '/privacy': 'Privacy Policy · Hangou',
  '/settings': 'Settings · Hangou'
};

/* 中文页面标题 */
export const TITLE_ZH: Record<string, string> = {
  '/': 'Hangou',
  '/archive': '归档 · Hangou',
  '/posts': '文章 · Hangou',
  '/friends': '友情链接 · Hangou',
  '/posts/about': '关于我 · Hangou',
  '/sponsor': '赞助 · Hangou',
  '/changelog': '更新日志 · Hangou',
  '/privacy': '隐私政策 · Hangou',
  '/settings': '设置 · Hangou'
};

/* 全文翻译免责提示（英文） */
export const TRANSLATE_NOTE =
  'The English text on this page was produced with AI assistance. It may contain inaccuracies and is for reference only.';
