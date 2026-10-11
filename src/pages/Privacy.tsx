import { useT } from '../context/Prefs';
import { useSiteNav } from '../context/SiteNav';
import { En, TranslateNote, Zh } from '../components/LangVariant';
import { Panel } from '../components/Panel';

export default function Privacy() {
  const t = useT();
  const { go } = useSiteNav();

  const nav = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    go(to);
  };

  return (
    <main className="post-main container">
      <Panel className="panel-title" label={t('隐私政策')}>
        <h1>{t('隐私政策')}</h1>
        <div className="post-meta">
          <span className="tags">
            <span className="tag">{'#'}{t('隐私政策')}</span>
          </span>
        </div>
      </Panel>

      <TranslateNote />

      <Panel title={t('隐私说明')}>
        <Zh className="article-body">
          <p>最后更新：2026-10-12</p>

          <h2>一句话版本</h2>
          <p>
            这是一个纯静态博客：没有账号系统、没有广告，也不收集任何个人信息。文章内置了自建的浏览计数器，只累计每篇文章被阅读的次数（仅记录文章路径和次数，不涉及访问者身份）。此外，站点只在你自己的浏览器里保存少量功能所必需的本地数据（作用等同于
            Cookie）。
          </p>

          <h2>我们保存了哪些数据</h2>
          <p>
            本站不会主动写入任何 HTTP Cookie。为了记住你的偏好并支持浏览计数等少量功能，以下数据通过浏览器的
            localStorage 和 sessionStorage（作用等同于 Cookie
            的本地存储）保存；其中偏好类的项都可以在
            <a href="#/settings" onClick={nav('/settings')}>
              设置页
            </a>
            随时调整：
          </p>
          <p>
            <strong>hcl-theme</strong>（localStorage，长期保存）——记住你选择的外观（深色、浅色或跟随系统）。
          </p>
          <p>
            <strong>hcl-lang</strong>（localStorage，长期保存）——记住你选择的界面语言（中文或 English）。
          </p>
          <p>
            <strong>hcl-article-translate</strong>（localStorage，长期保存）——记住你是否开启「全文翻译」。开启后，当界面语言为
            English 时，站内各处的文字会改用英文版本显示；英文内容由 AI 辅助翻译，可能出现偏差。
          </p>
          <p>
            <strong>hcl-cookie-ok</strong>
            （localStorage，长期保存）——记住你已确认过站点的 Cookie
            提示，避免每次访问都重复弹出；在设置页选择「每次询问」会清除它，下次打开页面时重新提示。
          </p>
          <p>
            <strong>hcl-nav-dir</strong>
            （sessionStorage，关闭标签页后清除）——记录一次跳转的方向，让翻页动画朝正确的方向滑动。
          </p>
          <p>
            <strong>hcl-nav-seen</strong>
            （sessionStorage，关闭标签页后清除）——配合上一项判断是否播放进场动画。
          </p>
          <p>
            <strong>hcl-views-reported</strong>
            （sessionStorage，关闭标签页后清除）——记录本次会话中已计入浏览数的文章，避免同一篇文章反复打开被重复计数。
          </p>
          <p>清除浏览器的站点数据即可删除以上全部内容，功能不受影响，只是偏好需要重新设置。</p>

          <h2>文章浏览数</h2>
          <p>
            文章页和文章列表会展示每篇文章的浏览次数。打开文章时，浏览器向站主自建的统计接口发送一次计数请求，请求里只有文章路径（例如
            /posts/about）；列表页则会一次性批量读取各文章的浏览数用于展示。
          </p>
          <p>
            服务器上只保存「文章路径 → 浏览次数」这一项对应关系，不保存 IP
            地址、浏览器信息或任何可识别身份的数据，统计接口也不使用
            Cookie。同一会话内重复打开同一篇文章不会被重复计数。
          </p>

          <h2>我们不做什么</h2>
          <p>
            不接入任何第三方访问统计或分析服务；不嵌入广告或跨站追踪脚本；不收集、不上传任何可识别个人身份的信息；也没有登录系统，因此不存在账号数据。文章浏览数由站主自建的极简接口统计，只累计次数、不涉及身份。
          </p>

          <h2>第三方服务</h2>
          <p>
            本站托管在 GitHub Pages 上，页面由 GitHub
            的服务器分发，GitHub
            可能按其自身政策记录访问日志。页脚和友链页提供的链接（哔哩哔哩、GitHub、爱发电等）会离开本站、跳转到第三方平台，跳转后的数据处理适用对方各自的隐私政策，与本站无关。
          </p>

          <h2>政策的更新</h2>
          <p>
            如果站点功能变化导致数据处理方式调整，会更新本页并修改顶部的「最后更新」日期，同时记录在
            <a href="#/changelog" onClick={nav('/changelog')}>
              更新日志
            </a>
            中。
          </p>

          <h2>联系我</h2>
          <p>
            对本页内容有疑问，可以通过
            <a href="#/posts/about" onClick={nav('/posts/about')}>
              关于页
            </a>
            中的邮箱联系我。
          </p>
        </Zh>

        <En className="article-body">
          <p>Last updated: 2026-10-12</p>

          <h2>In one sentence</h2>
          <p>
            This is a purely static blog: no accounts, no ads, and no collection of any personal
            information. Articles include a self-hosted view counter that simply tallies how often
            each article is read (it records only the article path and the count — never the
            visitor's identity). The site also stores a small amount of locally-required data (the
            equivalent of cookies) in your own browser.
          </p>

          <h2>What we store</h2>
          <p>
            This site never sets any HTTP cookies of its own accord. To remember your preferences and
            support a few features (such as view counting), the items below store data through your
            browser's localStorage and sessionStorage (local storage that works like cookies). You
            can adjust preference items at any time on the{' '}
            <a href="#/settings" onClick={nav('/settings')}>
              Settings
            </a>{' '}
            page:
          </p>
          <p>
            <strong>hcl-theme</strong> (localStorage, stored long-term) — remembers the appearance you
            picked (dark, light or system).
          </p>
          <p>
            <strong>hcl-lang</strong> (localStorage, stored long-term) — remembers the interface
            language you picked (Chinese or English).
          </p>
          <p>
            <strong>hcl-article-translate</strong> (localStorage, stored long-term) — remembers whether
            you enabled "full-text translation". When it is on and the interface language is English,
            the text across the site is shown in an English version; the English content is
            AI-assisted and may contain inaccuracies.
          </p>
          <p>
            <strong>hcl-cookie-ok</strong> (localStorage, stored long-term) — remembers that you have
            already acknowledged the site's cookie notice, so it does not pop up on every visit.
            Choosing "ask every time" on the Settings page clears it, so the notice appears again the
            next time you open a page.
          </p>
          <p>
            <strong>hcl-nav-dir</strong> (sessionStorage, cleared when the tab is closed) — records the
            direction of a single navigation so the page transition slides the right way.
          </p>
          <p>
            <strong>hcl-nav-seen</strong> (sessionStorage, cleared when the tab is closed) — works with
            the item above to decide whether the entrance animation plays.
          </p>
          <p>
            <strong>hcl-views-reported</strong> (sessionStorage, cleared when the tab is closed) —
            keeps track of which articles have already been counted in this session, so reopening the
            same article doesn't inflate its view count.
          </p>
          <p>
            Clearing your browser's site data deletes everything listed above. Nothing breaks — you
            will just need to set your preferences again.
          </p>

          <h2>Article view counts</h2>
          <p>
            Article pages and the article list show how many times each article has been read. When
            you open an article, your browser sends a single counting request to a self-hosted
            endpoint, and the request contains nothing but the article path (for example
            /posts/about); the list page fetches all articles' counts in one batch for display.
          </p>
          <p>
            On the server, only the mapping of article path to view count is stored. No IP addresses,
            browser details or any other identifying information are kept, and the counting endpoint
            sets no cookies. Reopening the same article within one session is not counted twice.
          </p>

          <h2>What we don't do</h2>
          <p>
            We do not use any third-party analytics or measurement services; we do not embed ads or
            cross-site tracking scripts; we do not collect or upload any personally identifiable
            information; and there is no login system, so no account data exists. Article view counts
            come from a minimal self-hosted counter that tallies reads per article and never involves
            visitor identity.
          </p>

          <h2>Third-party services</h2>
          <p>
            This site is hosted on GitHub Pages, and pages are served by GitHub's servers, which may
            keep access logs under their own policies. Links provided in the footer and on the friends
            page (Bilibili, GitHub, Afdian and others) take you away from this site to third-party
            platforms; once you follow them, their own privacy policies govern any data processing,
            independent of this site.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If a change in the site's features affects how data is handled, this page will be updated,
            the "Last updated" date at the top revised, and a note recorded in the{' '}
            <a href="#/changelog" onClick={nav('/changelog')}>
              changelog
            </a>
            .
          </p>

          <h2>Contact me</h2>
          <p>
            If you have questions about this page, you can reach me at the email address on my{' '}
            <a href="#/posts/about" onClick={nav('/posts/about')}>
              About page
            </a>
            .
          </p>
        </En>
      </Panel>
    </main>
  );
}