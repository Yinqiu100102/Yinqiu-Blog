import { useT } from '../context/Prefs';
import { En, TranslateNote, Zh } from '../components/LangVariant';
import { Panel } from '../components/Panel';

interface Entry {
  date: string;
  text: string;
}

const ENTRIES_ZH: Entry[] = [
  { date: '2026-10-13', text: '文章页顶部新增「返回文章列表」按钮，看完文章可一键回到列表；圆角风格下导航栏头像也改为胶囊形，与一级按钮保持一致' },
  { date: '2026-10-12', text: '提示条底部新增进度条：与 3 秒自动消失同步，从满宽向左收缩直至滑出，颜色与提示条左侧强调条一致；拖拽时进度暂停，松手后重新计时。深色模式下提示条底色压暗，观感更沉稳' },
  { date: '2026-10-12', text: '圆角风格：板块与内部卡片的圆角拉开层级（外大内小），导航栏一级按钮改为胶囊形；导航栏两端边距收紧、深浅切换与菜单按钮间距缩小，页面滚动到头时不再触发浏览器的越界回弹与下拉刷新' },
  { date: '2026-10-12', text: '隐私政策补充文章浏览数说明（仅统计路径与次数、不涉及身份信息），Cookie 弹窗提示同步更新；修复首页「敬请期待」按钮与「阅读文章」按钮高度不一致' },
  { date: '2026-10-10', text: '首页「敬请期待」按钮改为可点击，点击后从右上角滑出提示条；提示条支持多条同时显示并向下堆叠到接近网页底部，停稳 3 秒后自动消失，也可用指针向右拖动划出' },
  { date: '2026-10-10', text: '提示条动画：从视口右外侧偏下斜向往左上滑入，纵向先到位再水平滑入，进出场与堆叠重排统一为 0.55 秒缓出曲线；材质沿用站内浮层的半透明底 + 遮罩模糊' },
  { date: '2026-10-09', text: '设置页新增「样式」选项：可在直角风格与圆角风格之间切换全站边角，圆角风格为小圆角 + 曲率连续（G2）的超椭圆转角' },
  { date: '2026-10-09', text: '圆角风格：高亮描边元素改用普通圆角保证四角描边粗细均匀，静态卡片与头像改用超椭圆连续曲率；圆角半径整体加大，主页大头像圆角略大于常规板块' },
  { date: '2026-10-09', text: '补齐全文翻译缺失的英文词条，覆盖关于我、归档、更新日志、友链、隐私、目录与图片预览浮窗等模块标题' },
  { date: '2026-10-09', text: '隐私政策页正文改为标准卡片板块，与全站风格统一' },
  { date: '2026-10-08', text: '修复首页滚动箭头跳转后「我的项目」标题被吸顶导航栏挡住的问题，页内锚点跳转时给顶栏预留高度' },
  { date: '2026-10-08', text: '设置页分段控件：选中项改为与首页「阅读文章」按钮同款（淡强调底色 + 加粗描边），悬停只保留细描边，加粗与高亮只属于选中项' },
  { date: '2026-10-08', text: '实心按钮（首页「阅读文章」、赞助按钮、侧栏赞助等）悬停改为加深底色，并同步加粗描边；深浅主题下的悬停对比度一并提高' },
  { date: '2026-10-08', text: '全站「可高亮」元素的高亮描边统一加粗到 2px 并统一亮度（浅色主题接近黑色），导航、侧边栏、卡片、归档、目录、搜索框、图片预览浮窗按钮全部对齐' },
  { date: '2026-10-08', text: '高亮方式改版：导航、侧边栏、文章与友链卡片、归档行、目录、搜索框等悬停/选中不再填整块底色，统一改为强调色描边高亮' },
  { date: '2026-10-07', text: '全站文字自适应：根字号改为随视口宽度平滑缩放，窄屏自动收小、宽屏维持原有大小，间距与顶栏高度随之等比联动' },
  { date: '2026-10-07', text: '首页首屏改为整体垂直居中：修正顶栏高度被重复计算导致一屏内容整体偏下的问题' },
  { date: '2026-10-07', text: '修复 giscus 评论登录后跳回站点落到 404 页的问题（评论容器带 id 会被拼进登录回跳地址）' },
  { date: '2026-10-07', text: '修复所有页面共用同一个评论讨论串的问题，改为按页面路由分别建立讨论' },
  { date: '2026-10-06', text: '首页与页脚社交按钮改为整行居中排列，哔哩哔哩按钮并入按钮行并排在第二位' },
  { date: '2026-10-06', text: '缩小首页与页脚社交按钮之间的上下间距' },
  { date: '2026-10-06', text: '移除导航抽屉底部无样式的关闭按钮；小屏整体缩放进一步调小' },
  { date: '2026-10-06', text: '修复中文输入法在搜索框无法输入文字的问题' },
  { date: '2026-10-06', text: '页脚社交按钮与首页同步（新增 QQ、B 站粉主题按钮）' },
  { date: '2026-10-06', text: '浅色主题下技术栈与友链卡片底色改为与搜索框一致' },
  { date: '2026-10-06', text: '赞助页按钮样式与首页「阅读文章」按钮统一' },
  { date: '2026-10-06', text: '社交入口新增 QQ，哔哩哔哩按钮置顶并改用 B 站粉主题色（粉描边 + 浅粉底 + 粉字）' },
  { date: '2026-10-06', text: '首页新增「关于我」板块，简要介绍并附「了解更多」链接' },
  { date: '2026-10-06', text: '首页标题回到「Hangou」并新增直角头像；副标题字距精确对齐标题宽度，首屏底部新增向下滚动提示箭头' },
  { date: '2026-10-05', text: '文章页新增右侧目录卡片：自动提取页面板块标题生成锚点，点击平滑跳转并高亮当前板块；宽屏常驻右侧，窄屏收进右下角悬浮按钮' },
  { date: '2026-10-05', text: '文章正文图片限制为不超过版心宽度，修复大图撑破排版的问题' },
  { date: '2026-10-05', text: '关于页日期移至标题下方并加时钟图标，标签居日期下一行' },
  { date: '2026-10-05', text: '全站整体缩放 10%：根字号调整，并让顶栏高度、内容避让等随字号等比变化' },
  { date: '2026-10-05', text: '顶栏与正文左右留白对齐，导航两端控件贴合网页边缘；全站左右边距整体加宽' },
  { date: '2026-10-05', text: '手机端文章卡片修正为单列居中，去掉右侧留空；导航抽屉与目录卡片收窄' },
  { date: '2026-10-05', text: '首页问候语字号加大，并在其下新增「阅读文章」按钮，与设置页分段控件同色' },
  { date: '2026-10-05', text: '更新日志改为按月份自动分组，修复十月条目被并入九月板块的问题' },
  { date: '2026-10-05', text: '全站内容板块化：各页面内容拆成独立卡片板块，标题保留在页面背景上' },
  { date: '2026-10-05', text: '首页新增「我的项目 · Ci OS」板块，介绍创游世界伪系统作品的版本与停更历程' },
  { date: '2026-10-05', text: '首页问候语下新增 B站 / GitHub / 爱发电 社交入口，主页页脚不再重复展示' },
  { date: '2026-10-05', text: '文章卡片整卡可点击跳转，不再局限于标题与预览图' },
  { date: '2026-10-05', text: '搜索框改为浅底加描边，与板块背景拉开对比；评论框样式同步对齐站点风格' },
  { date: '2026-10-05', text: '关于页联系方式精简为三个常用邮箱' },
  { date: '2026-09-26', text: '外观新增「跟随系统」选项：设置页「主题」下可选深色 / 浅色 / 跟随系统，选择跟随系统后随系统外观自动切换' },
  { date: '2026-09-26', text: '全文翻译扩大到全站：设置页「语言」下可开启，界面语言为 English 时站内各处的文字都显示英文版本（AI 辅助翻译，可能出现偏差）' },
  { date: '2026-09-26', text: '新增设置页：界面语言可选中文 / English，外观可选深色 / 浅色，Cookie 提示可选每次询问或不再提示，偏好保存在本机浏览器' },
  { date: '2026-09-26', text: '隐私政策更新：补充界面语言偏好（hcl-lang）的说明，并标注各项本地偏好的调整入口' },
  { date: '2026-09-25', text: '顶栏左右留白对齐：修正右侧主题图标因按钮点击区留白导致的视觉内缩，让图标边缘与左侧头像落在同一条留白线上' },
  { date: '2026-09-25', text: '导航栏改版：品牌贴左边、入口居中，右侧只留主题切换按钮，左右留白随窗口拉伸始终贴住两侧' },
  { date: '2026-09-25', text: '文章页接入 giscus 评论，用 GitHub Discussions 存评论，登录 GitHub 后可发言' },
  { date: '2026-09-25', text: '首页精简：去掉入口卡片与按钮，只留一句介绍和最近文章，其余入口收到导航栏' },
  { date: '2026-09-21', text: '新增「更新日志」页面' },
  { date: '2026-09-21', text: '站点视觉改版：全站改为直角风格，取消圆角与渐变色' },
  { date: '2026-09-19', text: '更新 GitHub 友链信息，保留各友链原有跳转地址' },
  { date: '2026-09-06', text: '首页改为欢迎主页，文章列表拆分为独立页面' },
  { date: '2026-09-06', text: '关于页新增邮箱，优化日期展示' },
  { date: '2026-09-05', text: '新增独立赞助页与赞助列表' },
  { date: '2026-09-05', text: '友链页新增模糊搜索' },
  { date: '2026-09-05', text: '新增侧栏导航与归档页' },
  { date: '2026-09-05', text: '主题切换改为整页过渡，新增加载中遮罩' },
  { date: '2026-09-04', text: '首页新增模糊搜索' },
  { date: '2026-09-04', text: '文章图片支持浮窗预览（毛玻璃、缩放动画、下载）' },
  { date: '2026-09-04', text: '新增「关于我」页面，文章列表卡片增加预览图' },
  { date: '2026-09-04', text: '新增深浅主题切换按钮，导航改为全屏通栏' },
  { date: '2026-09-04', text: '页脚新增 B站 / GitHub / 爱发电 入口' },
  { date: '2026-09-03', text: '文章改为目录式 URL，站内链接去掉 .html 后缀' },
  { date: '2026-09-03', text: '使用头像作为站点 logo 与 favicon' },
  { date: '2026-09-03', text: '更换自定义域名为 blog.hangou.top' }
];

const ENTRIES_EN: Entry[] = [
  { date: '2026-10-13', text: 'Added a "Back to articles" button at the top of post pages so you can return to the list in one click; in the rounded style, the navbar avatar is now pill-shaped too, matching the other navbar buttons' },
  { date: '2026-10-12', text: 'Toasts now show a progress bar along the bottom, synchronized with the 3-second auto-dismiss: it shrinks from full width until the toast slides out, colored like the accent bar on the left; the progress pauses while dragging and restarts after release. In dark mode the toast background is darkened for a calmer look' },
  { date: '2026-10-12', text: 'Rounded style: nested cards inside a panel now use a smaller radius than the panel itself, and top-level navbar buttons became pill-shaped; the navbar edge margins were tightened, the theme and menu buttons sit closer together, and hard overscroll no longer triggers the browser bounce or pull-to-refresh' },
  { date: '2026-10-12', text: 'The privacy policy now explains article view counting (paths and counts only, never identity), with the cookie notice updated to match; fixed a height mismatch between the "Read posts" and "Stay tuned" buttons on the home page' },
  { date: '2026-10-10', text: 'The home "Coming soon" button is now clickable and slides a toast in from the top-right corner; toasts can be shown together and stack downwards until they almost reach the bottom of the page, dismiss themselves after 3 seconds, and can also be dragged away to the right with the pointer' },
  { date: '2026-10-10', text: 'Toast motion: they enter diagonally from below the right edge of the viewport, settling vertically first and then sliding in horizontally, with the enter, exit and stack-reflow animations all on one 0.55s ease-out curve; the material reuses the site overlay look of a translucent fill plus backdrop blur' },
  { date: '2026-10-09', text: 'Added a "Corners" option to Settings: switch the site-wide corner style between right-angle and rounded, where rounded uses a small radius with a curvature-continuous (G2) squircle' },
  { date: '2026-10-09', text: 'Rounded style: stroke-highlighted elements now use plain circular corners so the 2px highlight stays uniform, while static cards and avatars use a continuous-curvature squircle; overall radii were enlarged and the home avatar is slightly rounder than regular panels' },
  { date: '2026-10-09', text: 'Filled in the missing English phrases for full-text translation, covering headings on About, Archive, Changelog, Friends, Privacy, the table of contents and the image lightbox' },
  { date: '2026-10-09', text: 'The Privacy Policy body now uses a standard card panel to match the site-wide style' },
  { date: '2026-10-08', text: 'Fixed the "My project" heading being hidden behind the sticky header after tapping the home scroll arrow; in-page anchors now reserve the header height' },
  { date: '2026-10-08', text: 'Settings segmented control: the selected option now matches the home "Read posts" button (soft accent fill + thick border), while hover keeps only a thin border — the thicker, brighter treatment belongs to the selection alone' },
  { date: '2026-10-08', text: 'Solid buttons (the home "Read posts" button, sponsor buttons, the sidebar sponsor button) now deepen their background on hover with a matching thicker border, and the hover contrast is higher in both themes' },
  { date: '2026-10-08', text: 'Unified every highlight border on the site to 2px and to one brightness (near-black in light theme), covering the nav, sidebar, cards, archive, table of contents, search box and the image lightbox buttons' },
  { date: '2026-10-08', text: 'Reworked highlighting: the nav, sidebar, post and friend cards, archive rows, table of contents and search box no longer fill a background on hover/selection and now highlight with an accent-coloured border instead' },
  { date: '2026-10-07', text: 'Site-wide responsive typography: the root font size now scales smoothly with viewport width — smaller on narrow screens, unchanged on wide ones — with spacing and header height following proportionally' },
  { date: '2026-10-07', text: 'Centred the home first screen vertically: fixed the content sitting too low because the header height was counted twice' },
  { date: '2026-10-07', text: 'Fixed the giscus sign-in redirect landing on the 404 page (the comment container id was being appended to the OAuth redirect URI)' },
  { date: '2026-10-07', text: 'Fixed every page sharing a single comment thread; each route now gets its own discussion' },
  { date: '2026-10-06', text: 'The social buttons on the home page and footer are now centred in a single row, with the Bilibili button joined into that row in second position' },
  { date: '2026-10-06', text: 'Reduced the vertical spacing between the social buttons on the home page and footer' },
  { date: '2026-10-06', text: 'Removed the unstyled close button at the bottom of the nav drawer, and further reduced the overall zoom on small screens' },
  { date: '2026-10-06', text: 'Fixed the search box not accepting typed text when using a Chinese input method' },
  { date: '2026-10-06', text: 'Synced the footer social buttons with the home page (added QQ and the pink Bilibili button)' },
  { date: '2026-10-06', text: 'In light theme, changed the tech-stack and friend-link card backgrounds to match the search box' },
  { date: '2026-10-06', text: 'Unified the sponsor-page button style with the home "Read posts" button' },
  { date: '2026-10-06', text: 'Added QQ to the social links, moved Bilibili to the top and switched it to the Bilibili pink theme (pink border + light pink background + pink text)' },
  { date: '2026-10-06', text: 'Added an "About me" panel to the home page with a brief intro and a "Learn more" link' },
  { date: '2026-10-06', text: 'Restored the home title to "Hangou" and added a square avatar; tuned the subtitle letter-spacing to exactly match the title width, and added a downward scroll-hint arrow at the bottom of the first screen' },
  { date: '2026-10-05', text: 'Added a table-of-contents card to post pages: it extracts the panel headings to build anchors, scrolls smoothly on click and highlights the current panel — pinned on the right on wide screens and tucked into a floating button on narrow ones' },
  { date: '2026-10-05', text: 'Constrained images in post bodies to the content width, fixing large images that broke the layout' },
  { date: '2026-10-05', text: 'Moved the date on the About page below the title with a clock icon, and placed the tag on the line under the date' },
  { date: '2026-10-05', text: 'Scaled the whole site down by 10%: the root font size changed, with the header height and content offsets following proportionally' },
  { date: '2026-10-05', text: 'Aligned the header padding with the content so the nav controls sit flush with the page edges; widened the global left/right margins' },
  { date: '2026-10-05', text: 'Fixed the mobile post cards to a centred single column without the gap on the right; narrowed the nav drawer and TOC card' },
  { date: '2026-10-05', text: 'Enlarged the home greeting and added a "Read posts" button below it, coloured to match the selected segmented control on the Settings page' },
  { date: '2026-10-05', text: 'The changelog now groups entries by month automatically, fixing October entries that were merged into the September section' },
  { date: '2026-10-05', text: 'Site-wide content panels: each page\'s content is split into separate card panels, while page titles stay on the page background' },
  { date: '2026-10-05', text: 'Added a "My project · Ci OS" panel to the home page, covering the versions and discontinuation of the fake-OS project on Chuangyou Shijie' },
  { date: '2026-10-05', text: 'Added Bilibili / GitHub / Afdian social links under the home intro; the home footer no longer repeats them' },
  { date: '2026-10-05', text: 'Post cards are now clickable as a whole, not just the title and thumbnail' },
  { date: '2026-10-05', text: 'The search box gained a soft background and border for contrast against the panels; the comment box style was aligned with the site too' },
  { date: '2026-10-05', text: 'Trimmed the contact addresses on the About page down to three primary emails' },
  { date: '2026-09-26', text: 'Added a "System" appearance option: the Theme group on the Settings page now offers dark / light / system, and the system option follows your OS appearance automatically' },
  { date: '2026-09-26', text: 'Full-text translation now covers the whole site: enable it under "Language" on the Settings page, and when the interface language is English the text across the site is shown in an English version (AI-assisted; may contain inaccuracies)' },
  { date: '2026-09-26', text: 'Added a Settings page: interface language in Chinese / English, appearance in dark / light, cookie notice either every visit or skipped, with preferences saved in your local browser' },
  { date: '2026-09-26', text: 'Privacy policy update: added notes on the interface-language preference (hcl-lang) and pointed out where each local preference can be changed' },
  { date: '2026-09-25', text: 'Header padding alignment: fixed the visual inset of the theme icon on the right caused by its button hit-area padding, so the icon edge lines up with the avatar on the left' },
  { date: '2026-09-25', text: 'Navigation redesign: brand pinned left, entries centred, only the theme toggle on the right, with the outer margins staying flush to both sides as the window resizes' },
  { date: '2026-09-25', text: 'Added giscus comments to post pages, storing comments in GitHub Discussions — sign in with GitHub to post' },
  { date: '2026-09-25', text: 'Streamlined the home page: removed the entry cards and buttons, leaving just a one-line intro and recent posts, with the other entries moved into the nav bar' },
  { date: '2026-09-21', text: 'Added a "Changelog" page' },
  { date: '2026-09-21', text: 'Site visual refresh: the whole site switched to square corners, dropping rounded corners and gradients' },
  { date: '2026-09-19', text: 'Updated GitHub friend-link details, keeping each friend\'s original destination URL' },
  { date: '2026-09-06', text: 'The home page became a welcome page, and the post list moved to its own page' },
  { date: '2026-09-06', text: 'Added email addresses to the About page and improved how dates are displayed' },
  { date: '2026-09-05', text: 'Added a standalone sponsor page and sponsor list' },
  { date: '2026-09-05', text: 'Added fuzzy search to the friends page' },
  { date: '2026-09-05', text: 'Added side-drawer navigation and an archive page' },
  { date: '2026-09-05', text: 'Theme switching became a full-page transition, with a new loading overlay' },
  { date: '2026-09-04', text: 'Added fuzzy search to the home page' },
  { date: '2026-09-04', text: 'Post images support a floating preview (frosted glass, zoom animation, download)' },
  { date: '2026-09-04', text: 'Added an "About me" page, and post-list cards gained preview images' },
  { date: '2026-09-04', text: 'Added a dark/light theme toggle button, and the nav became a full-width bar' },
  { date: '2026-09-04', text: 'Added Bilibili / GitHub / Afdian links to the footer' },
  { date: '2026-09-03', text: 'Posts moved to directory-style URLs, and internal links dropped the .html suffix' },
  { date: '2026-09-03', text: 'Used the avatar as the site logo and favicon' },
  { date: '2026-09-03', text: 'Switched the custom domain to blog.hangou.top' }
];

function Group({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div className="archive-group">
      <h2>{title}</h2>
      <ul className="archive-list">
        {entries.map((e, i) => (
          <li key={e.date + i}>
            <span className="date">{e.date}</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 按「年-月」把条目分组，保持原有先后顺序（同日多条的相对次序不变） */
function groupByMonth(entries: Entry[]): { month: string; entries: Entry[] }[] {
  const groups: { month: string; entries: Entry[] }[] = [];
  for (const entry of entries) {
    const month = entry.date.slice(0, 7); // YYYY-MM
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.entries.push(entry);
    } else {
      groups.push({ month, entries: [entry] });
    }
  }
  return groups;
}

/* YYYY-MM → 2026 年 9 月 */
function formatMonthZh(month: string): string {
  const [year, m] = month.split('-');
  return `${year} 年 ${Number(m)} 月`;
}

/* YYYY-MM → September 2026 */
function formatMonthEn(month: string): string {
  const [year, m] = month.split('-');
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${names[Number(m) - 1]} ${year}`;
}

export default function Changelog() {
  const t = useT();

  return (
    <main className="post-main container">
      <Panel className="panel-title" label={t('更新日志')}>
        <h1>{t('更新日志')}</h1>
        <div className="post-meta">
          <span className="tags">
            <span className="tag">{'#'}{t('更新日志')}</span>
          </span>
        </div>
      </Panel>

      <TranslateNote />

      <Panel title={t('更新记录')}>
        <Zh>
          {groupByMonth(ENTRIES_ZH).map((g) => (
            <Group key={g.month} title={formatMonthZh(g.month)} entries={g.entries} />
          ))}
        </Zh>

        <En>
          {groupByMonth(ENTRIES_EN).map((g) => (
            <Group key={g.month} title={formatMonthEn(g.month)} entries={g.entries} />
          ))}
        </En>
      </Panel>
    </main>
  );
}