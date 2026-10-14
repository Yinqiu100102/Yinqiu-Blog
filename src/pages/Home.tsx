import { useT } from '../context/Prefs';
import { useSiteNav } from '../context/SiteNav';
import { En, Zh } from '../components/LangVariant';
import {
  IconAifadian,
  IconBilibili,
  IconBook,
  IconChevron,
  IconGithub,
  IconHome,
  IconQq,
  IconSliders,
} from '../components/icons';

const CIOS_LINK = 'https://s.hortorinteractive.com/K4ZK47';

const STACK = [
  { name: 'React 18', desc: '界面框架' },
  { name: 'TypeScript', desc: '类型安全' },
  { name: 'Vite 5', desc: '构建工具' },
  { name: 'CSS', desc: '手写样式' },
  { name: 'GitHub Actions', desc: '自动部署' },
  { name: 'GitHub Pages', desc: '静态托管' },
  { name: 'Cloudflare', desc: '域名解析' },
];

export default function Home() {
  const t = useT();
  const { go } = useSiteNav();

  return (
    <main className="home-main container">
      <section className="panel home-hero">
        <div className="panel-body">
          <img
            className="hero-avatar"
            src="/images/avatar.png"
            alt="Hangou"
            width="120"
            height="120"
          />
          <h1>Hangou</h1>
          <p>{t('在这里能看到我的想法')}</p>
          <ul className="hero-tags">
            <li>
              <IconHome />
              {t('个人博客')}
            </li>
            <li>
              <IconBook />
              {t('技术分享')}
            </li>
            <li>
              <IconSliders />
              {t('创意作品')}
            </li>
          </ul>
          <div className="hero-actions">
            <button
              type="button"
              className="hero-cta"
              onClick={() => go('/posts')}
            >
              <IconBook />
              {t('阅读文章')}
            </button>
            <button
              type="button"
              className="social-btn hero-cta-secondary"
              onClick={() => go('/videos')}
            >
              <IconBilibili />
              {t('观看视频')}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="scroll-hint"
          aria-label={t('向下滚动')}
          title={t('向下滚动')}
          onClick={() =>
            document
              .getElementById('projects')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <IconChevron />
        </button>
      </section>

      <h2 id="projects" className="home-panel-title">{t('我的项目')}</h2>
      <p className="home-panel-sub">{t('我做过的一些项目。')}</p>
      <section className="panel" aria-label={t('我的项目')}>
        <h3 className="panel-inner-title">Ci OS</h3>
        <div className="panel-body">
          <Zh>
            <p>
              <strong>Ci OS</strong> 是我在<strong>创游世界</strong>
              上做的一个「伪系统」项目，也是我目前唯一一个出圈的作品。
            </p>
            <p>
              它出过很多版本：有海外创游世界的 1 代国际版，也有国内的 1 代与 2 代。最早的版本始于
              <strong>2024 年 7 月 10 日</strong>的 1 代国际版，当时主要还原了 iOS
              的桌面动效与其他细节；后来转向了<strong>小米澎湃 OS</strong>
              的动效和风格，同时保留了一些 iOS 的优秀元素。
            </p>
            <p>
              直到 <strong>2026 年 5 月 15 日</strong>
              ，最后一个 2 代版本宣布停更。不过这个社区的玩家们现在还在不断地创新技术，让「创游伪
              OS」做得越来越好。
            </p>
            <p>
              作品链接：
              <a href={CIOS_LINK} target="_blank" rel="noopener">
                {CIOS_LINK}
              </a>
            </p>
          </Zh>

          <En>
            <p>
              <strong>Ci OS</strong> is a "fake system" project I built in{' '}
              <strong>Chuangyou Shijie</strong> (创游世界), and so far it's the one work of mine that
              really caught on.
            </p>
            <p>
              It went through many versions: a first-generation international release on the overseas
              Chuangyou Shijie, plus the first and second generations in China. The earliest version
              dates back to <strong>10 July 2024</strong>, when it mainly recreated iOS home-screen
              animations and other details. It later shifted towards the animations and style of{' '}
              <strong>Xiaomi HyperOS</strong> while keeping some of the best iOS elements.
            </p>
            <p>
              The last second-generation version was discontinued on <strong>15 May 2026</strong>.
              Even so, players in this community keep innovating and pushing the "Chuangyou fake OS"
              further.
            </p>
            <p>
              Project link:{' '}
              <a href={CIOS_LINK} target="_blank" rel="noopener">
                {CIOS_LINK}
              </a>
            </p>
          </En>
        </div>
      </section>

      <h2 className="home-panel-title">{t('关于我')}</h2>
      <p className="home-panel-sub">{t('关于我的一些介绍。')}</p>
      <section className="panel" aria-label={t('关于我')}>
        <div className="panel-body">
          <Zh>
            <p>
              大家好，我是<strong>憨狗哈</strong>，也可以叫我<strong>憨狗</strong>，或者{' '}
              <strong>hangou</strong>。
            </p>
            <p>一个在方块世界里搭东西、也在屏幕前琢磨动效的普通玩家。</p>
          </Zh>
          <En>
            <p>
              Hi, I'm <strong>Hangou</strong> (also written <strong>憨狗</strong> in Chinese).
            </p>
            <p>
              An ordinary player who builds things in a blocky world and tinkers with motion design
              in front of a screen.
            </p>
          </En>
          <p className="home-about-more">
            <a
              href="/posts/about"
              onClick={(e) => {
                e.preventDefault();
                go('/posts/about');
              }}
            >
              {t('了解更多')}
            </a>
          </p>
        </div>
      </section>

      <h2 className="home-panel-title">{t('技术栈')}</h2>
      <p className="home-panel-sub">{t('这个站点用到的技术。')}</p>
      <section className="panel" aria-label={t('技术栈')}>
        <div className="panel-body">
          <ul className="stack-list">
            {STACK.map((item) => (
              <li className="stack-item" key={item.name}>
                <span className="stack-name">{item.name}</span>
                <span className="stack-desc">{t(item.desc)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-contact" aria-label={t('社交 & 联系')}>
        <h2>{t('社交 & 联系')}</h2>
        <p>{t('欢迎在这些地方找到我：')}</p>
        <div className="hero-social">
          <a
            className="social-btn"
            href="https://github.com/hangou100102-lgtm"
            target="_blank"
            rel="noopener"
            aria-label={t('GitHub主页')}
            title={t('GitHub主页')}
          >
            <IconGithub />
            <span>GitHub</span>
          </a>
          <a
            className="social-btn bili-primary"
            href="https://space.bilibili.com/1937945301"
            target="_blank"
            rel="noopener"
            aria-label={t('B站主页')}
            title={t('B站主页')}
          >
            <IconBilibili />
            <span>{t('哔哩哔哩')}</span>
          </a>
          <a
            className="social-btn"
            href="https://ifdian.net/a/hangou100102"
            target="_blank"
            rel="noopener"
            aria-label={t('爱发电主页')}
            title={t('爱发电主页')}
          >
            <IconAifadian />
            <span>{t('爱发电')}</span>
          </a>
          <a
            className="social-btn"
            href="https://qm.qq.com/q/QmmnhKKnKK"
            target="_blank"
            rel="noopener"
            aria-label="QQ"
            title="QQ"
          >
            <IconQq />
            <span>QQ</span>
          </a>
        </div>
      </section>
    </main>
  );
}
