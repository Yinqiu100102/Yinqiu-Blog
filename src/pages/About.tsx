import { useT } from '../context/Prefs';
import { useSiteNav } from '../context/SiteNav';
import { En, TranslateNote, Zh } from '../components/LangVariant';
import { Panel } from '../components/Panel';
import { Giscus } from '../components/Giscus';
import { IconArrowLeft, IconClockSmall, IconEye, IconPin } from '../components/icons';
import { useViewCount } from '../hooks/useViews';

/* 联系方式：常用邮箱带「常用」标记 */
const MAILS_ZH = [
  { mail: '2644624556@qq.com', pin: true },
  { mail: 'jinhui100102@163.com', pin: true },
  { mail: 'hangou100102@gmail.com', pin: false }
];

export default function About() {
  const t = useT();
  const { go } = useSiteNav();
  /* 进入文章时记一次浏览，返回展示用的最新值 */
  const views = useViewCount('/posts/about');
  const projectLink = 'https://s.hortorinteractive.com/K4ZK47';
  const cover = import.meta.env.BASE_URL + 'images/Image_1764458904822.jpg';

  const mails = (pinLabel: string) => (
    <ul className="mail-list">
      {MAILS_ZH.map((m) => (
        <li key={m.mail} className="mail-item">
          {m.pin && <span className="tag tag-pin">{pinLabel}</span>}
          <a href={'mailto:' + m.mail}>{m.mail}</a>
        </li>
      ))}
    </ul>
  );

  return (
    <main className="post-main container">
      <a className="post-back" href="#/posts" onClick={(e) => { e.preventDefault(); go('/posts'); }}>
        <IconArrowLeft />
        {t('返回文章列表')}
      </a>

      <Panel className="panel-title" label={t('关于我')}>
        <h1>{t('关于我')}</h1>
        <div className="post-meta post-meta-dates">
          <Zh>
            <span className="date">
              <IconClockSmall />
              发布 2026-09-04 · 修改 2026-09-06
            </span>
          </Zh>
          <En>
            <span className="date">
              <IconClockSmall />
              Published 2026-09-04 · Updated 2026-09-06
            </span>
          </En>
          <span className="post-views" aria-label={`${views ?? 0} ${t('浏览')}`}>
            <IconEye />
            <span data-lang-variant="zh">{views ?? '-'} 次浏览</span>
            <span data-lang-variant="en" lang="en">
              {views ?? '-'} {views === 1 ? 'view' : 'views'}
            </span>
          </span>
          <span className="tags">
            <span className="tag tag-pin"><IconPin />{t('置顶')}</span>
            <span className="tag">{'#'}{t('关于')}</span>
          </span>
        </div>
      </Panel>

      <TranslateNote />

      <Panel title={t('我是谁')}>
        <Zh className="article-body">
          <p>
            大家好，我是<strong>白吟秋</strong>，也可以叫我{' '}
            <strong>Yinqiu</strong>。欢迎来到我的博客。
          </p>

          <img className="article-cover" src={cover} alt="关于我的配图" loading="lazy" />

          <blockquote>一个在方块世界里搭东西、也在屏幕前琢磨动效的普通玩家。</blockquote>
        </Zh>

        <En className="article-body">
          <p>
            Hi, I'm <strong>Yinqiu</strong> (also written <strong>白吟秋</strong> in Chinese).
            Welcome to my blog.
          </p>

          <img className="article-cover" src={cover} alt="A photo of me" loading="lazy" />

          <blockquote>
            An ordinary player who builds things in a blocky world and tinkers with motion design in
            front of a screen.
          </blockquote>
        </En>
      </Panel>

      <Panel title={t('我在做什么')}>
        <Zh className="article-body">
          <p>
            我在哔哩哔哩上是一名 UP 主，主要做<strong>《我的世界》</strong>（Minecraft）相关的视频。
          </p>
          <p>
            同时，我也是一位资深的<strong>创游世界</strong>
            玩家——不过现在有些淡游了，更多是在慢慢沉淀和整理以前做过的内容。
          </p>
        </Zh>

        <En className="article-body">
          <p>
            I'm a creator on Bilibili, where I mainly make videos about <strong>Minecraft</strong>.
          </p>
          <p>
            I'm also a long-time player of <strong>Chuangyou Shijie</strong> (创游世界) — though I'm
            less active there now, and spend more time slowly going back over and organising the
            things I made before.
          </p>
        </En>
      </Panel>

      <Panel title={t('关于 Ci OS')}>
        <Zh className="article-body">
          <p>
            之前，我出过一系列「创游世界」的开发进度视频，作品名叫 <strong>Ci OS</strong>。
          </p>
          <p>
            Ci OS 主要还原了<strong>小米澎湃 OS</strong>（HyperOS）和 <strong>iOS</strong>
            的桌面动画，以及其他系统动效，算是我花了挺多心思的一个作品。
          </p>
          <p>
            作品链接：
            <a href={projectLink} target="_blank" rel="noopener">
              {projectLink}
            </a>
          </p>
        </Zh>

        <En className="article-body">
          <p>
            Earlier I released a series of development-progress videos for Chuangyou Shijie, for a
            project called <strong>Ci OS</strong>.
          </p>
          <p>
            Ci OS mostly recreates the launcher animations of <strong>Xiaomi HyperOS</strong> and{' '}
            <strong>iOS</strong>, along with some other system motion effects. It's one of the
            projects I put the most effort into.
          </p>
          <p>
            Project link:{' '}
            <a href={projectLink} target="_blank" rel="noopener">
              {projectLink}
            </a>
          </p>
        </En>
      </Panel>

      <Panel title={t('联系方式')}>
        <Zh className="article-body">
          <p>想找我聊聊天、合作或者只是打个招呼，都可以通过这些邮箱联系我：</p>
          {mails('常用')}
        </Zh>

        <En className="article-body">
          <p>
            If you'd like to chat, work together, or just say hi, you can reach me at any of these
            addresses:
          </p>
          {mails('Primary')}
        </En>
      </Panel>

      <Panel title={t('写在最后')}>
        <Zh className="article-body">
          <p>谢谢你来认识我。这里会继续记录我读过的、写下的、正在琢磨的事，希望下次再见。</p>
        </Zh>

        <En className="article-body">
          <p>
            Thank you for taking the time to get to know me. This is where I'll keep noting down what
            I read, what I write, and what I'm still mulling over. See you next time.
          </p>
        </En>
      </Panel>

      <section className="post-comments" aria-label={t('评论')}>
        <Zh>
          <h2 className="comments-title">评论</h2>
          <p className="comments-note">
            评论由 GitHub Discussions 提供，需登录 GitHub 账号才能发言。
          </p>
        </Zh>
        <En>
          <h2 className="comments-title">Comments</h2>
          <p className="comments-note">
            Comments are powered by GitHub Discussions. You'll need to sign in with a GitHub account
            to post.
          </p>
        </En>
        <Giscus />
      </section>
    </main>
  );
}
