import { useEffect, useRef, useState } from 'react';
import { usePrefs, useT } from '../context/Prefs';
import { useSiteNav } from '../context/SiteNav';
import { IconChevron, IconClose, IconMenu, IconMoon, IconSun } from './icons';

/* 站点顶栏：品牌 + 主导航 + 更多下拉 + 主题切换 + 移动端菜单按钮 */
export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const t = useT();
  const { go, path } = useSiteNav();
  const { themeMode, setThemeMode } = usePrefs();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  /* 点击「更多」外部时收起 */
  useEffect(() => {
    if (!moreOpen) {
      return;
    }
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [moreOpen]);

  const link = (to: string, label: string) => {
    const active = path === to;
    return (
      <a
        href={'#' + to}
        aria-current={active ? 'page' : undefined}
        onClick={(e) => {
          e.preventDefault();
          go(to);
        }}
      >
        {t(label)}
      </a>
    );
  };

  const moreItems: Array<[string, string]> = [
    ['/posts/about', '关于我'],
    ['/changelog', '更新日志'],
    ['/sponsor', '赞助'],
    ['/settings', '设置']
  ];

  const isLight = (themeMode === 'system'
    ? typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches
    : themeMode === 'light');

  return (
    <header className="site-header">
      <nav className="nav container" aria-label={t('主导航')}>
        <a
          className="brand"
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            go('/');
          }}
        >
          <img
            className="brand-logo"
            src={import.meta.env.BASE_URL + 'images/avatar.png'}
            alt={t('白吟秋头像')}
          />
          白吟秋
        </a>
        <div className="nav-right">
          <div className="nav-links">
            {link('/', '首页')}
            {link('/posts', '文章')}
            {link('/archive', '归档')}
            {link('/friends', '友链')}
            <div className="nav-more" ref={moreRef}>
              <button
                type="button"
                className="nav-more-toggle"
                aria-expanded={moreOpen}
                aria-haspopup="true"
                onClick={() => setMoreOpen((v) => !v)}
              >
                {t('更多')}
                <IconChevron />
              </button>
              <div className="nav-more-menu">
                {moreItems.map(([to, label]) => (
                  <a
                    key={to}
                    href={'#' + to}
                    onClick={(e) => {
                      e.preventDefault();
                      setMoreOpen(false);
                      go(to);
                    }}
                  >
                    {t(label)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="theme-toggle"
            aria-label={t('切换主题')}
            aria-pressed={isLight}
            title={t('切换主题')}
            onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
          >
            <IconSun />
            <IconMoon />
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-label={t('打开菜单')}
            aria-expanded={false}
            aria-controls="navDrawer"
            onClick={onOpenMenu}
          >
            <IconMenu />
            <IconClose />
          </button>
        </div>
      </nav>
    </header>
  );
}
