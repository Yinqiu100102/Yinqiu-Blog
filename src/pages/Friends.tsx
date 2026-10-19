import { useSiteNav } from '../context/SiteNav';
import { useT } from '../context/Prefs';
import { En, TranslateNote, Zh } from '../components/LangVariant';
import { Panel } from '../components/Panel';
import { useSearch } from '../hooks/useSearch';

interface Friend {
  name: string;
  url: string;
  urlText: string;
  avatar: string;
  alt: string;
  descZh: string;
  descEn: string;
}

const FRIENDS: Friend[] = [
  {
    name: '咡如夏 · ERX399',
    url: 'https://blog.520pro.top/',
    urlText: 'blog.520pro.top',
    avatar: 'https://avatars.githubusercontent.com/u/201088719?s=256&v=4',
    alt: '咡如夏的头像',
    descZh: 'Protect What You Love.',
    descEn: 'Protect What You Love.'
  },
  {
    name: 'Thinkreally · ThinkReally114',
    url: 'https://thinkreally114.github.io/website/',
    urlText: 'thinkreally114.github.io/website',
    avatar: 'https://avatars.githubusercontent.com/u/237739976?s=256&v=4',
    alt: 'Thinkreally 的头像',
    descZh: '探索与爱。',
    descEn: '探索与爱。'
  },
  {
    name: 'Xiaobocm',
    url: 'https://blog.xiaobocm.com',
    urlText: 'blog.xiaobocm.com',
    avatar: 'https://avatars.githubusercontent.com/u/262091240?s=256&v=4',
    alt: 'Xiaobocm 的头像',
    descZh: '我们都爱着地球',
    descEn: '我们都爱着地球'
  },
  {
    name: '执着yoyo',
    url: 'https://yoyo-coding.github.io/me/',
    urlText: 'yoyo-coding.github.io/me',
    avatar: 'https://github.com/yoyo-coding.png',
    alt: '执着yoyo 的头像',
    descZh: '',
    descEn: ''
  }
];

/* 搜索文本：名称 + 两版简介 + 网址，与旧站读 textContent 的行为一致 */
function friendSearchText(f: Friend): string {
  return [f.name, f.descZh, f.descEn, f.urlText, f.url].join(' ');
}

export default function Friends() {
  const t = useT();
  const { go } = useSiteNav();
  const search = useSearch(FRIENDS, friendSearchText);

  return (
    <main className="post-main container">
      <Panel className="panel-title" label={t('友情链接')}>
        <h1>{t('友情链接')}</h1>
        <div className="post-meta">
          <span className="tags">
            <span className="tag">{'#'}{t('友链')}</span>
          </span>
        </div>
      </Panel>

      <Panel title={t('关于友链')}>
        <Zh className="article-body">
          <p>
            这里是一些我常逛、也值得推荐的站点。想交换友链的话，可以通过
            <a
              href="#/posts/about"
              onClick={(e) => {
                e.preventDefault();
                go('/posts/about');
              }}
            >
              关于我
            </a>
            页面的邮箱联系我。
          </p>
        </Zh>
        <TranslateNote />
        <En className="article-body">
          <p>
            Here are some sites I visit often and would recommend. If you'd like to swap links, you
            can reach me at the email address on my{' '}
            <a
              href="#/posts/about"
              onClick={(e) => {
                e.preventDefault();
                go('/posts/about');
              }}
            >
              About me
            </a>{' '}
            page.
          </p>
        </En>
      </Panel>

      <Panel title={t('友链列表')}>
        <input
          type="search"
          className="search-input"
          placeholder={t('搜索友链名称、简介或网址…')}
          autoComplete="off"
          aria-label={t('搜索友链')}
          value={search.value}
          onChange={search.onChange}
          onCompositionStart={search.onCompositionStart}
          onCompositionEnd={search.onCompositionEnd}
        />

        <div className="friend-list panel-list-inner">
          <p className="no-result" hidden={search.hasResults}>
            {t('没有找到匹配的友链，换个关键词试试？')}
          </p>
          {search.results.map((f) => (
            <a key={f.url} className="friend-item" href={f.url} target="_blank" rel="noopener">
              <div className="friend-info">
                <div className="friend-name">{f.name.split(' · ')[0]}</div>
                <div className="friend-desc" data-lang-variant="zh">
                  {f.descZh}
                </div>
                <div className="friend-desc" data-lang-variant="en" lang="en">
                  {f.descEn}
                </div>
                <div className="friend-url">{f.urlText}</div>
              </div>
              <img
                className="friend-avatar"
                src={f.avatar}
                alt={t(f.alt)}
                loading="lazy"
                width={48}
                height={48}
              />
            </a>
          ))}
        </div>
      </Panel>
    </main>
  );
}