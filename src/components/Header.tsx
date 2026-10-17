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
  const brandRef = useRef<HTMLAnchorElement>(null);
  const [showBrand, setShowBrand] = useState(path !== '/');
  const [brandInstant, setBrandInstant] = useState(false);

  /* 首页滚动到大头像贴住导航栏时，头像与名字飞入品牌位；
     回滚时反向飞回原位，飞行途中可被反向滚动打断并掉头。其他页面始终显示品牌。 */
  useEffect(() => {
    if (path !== '/') {
      setShowBrand(true);
      return;
    }
    setShowBrand(false);
    type Phase = 'hidden' | 'toBrand' | 'shown' | 'toHero';
    type Snap = {
      imgRect: DOMRect;
      textRect: DOMRect;
      h1Rect: DOMRect;
      imgStyle: CSSStyleDeclaration;
      h1Style: CSSStyleDeclaration;
    };
    let phase: Phase = 'hidden';
    let raf = 0;
    let anims: Animation[] = [];
    let fadeTimer = 0;
    let startImgKf: Keyframe | null = null;
    let startNameKf: Keyframe | null = null;
    const clones: HTMLElement[] = [];

    const reduced = () =>
      typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealHero = () => document.documentElement.classList.remove('brand-flying');
    const hideHero = () => document.documentElement.classList.add('brand-flying');

    /* 克隆体落位瞬间：真实元素无过渡直接满透明度复现（被不透明克隆体盖住），
       instant 状态保持到克隆体移除，避免「真实元素渐显 + 克隆体渐隐」双层半透明下陷闪烁 */
    const revealHeroInstant = () => {
      const root = document.documentElement;
      root.classList.add('hero-instant');
      root.classList.remove('brand-flying');
    };

    const showBrandInstant = () => {
      setBrandInstant(true);
      setShowBrand(true);
    };

    /* 半径钳到半宽后取 px，与尺寸同一时长同步插值：
       全程四角曲率一致，落位值与真实元素零偏差 */
    const radiusPx = (style: CSSStyleDeclaration, size: number) => {
      const val = parseFloat(style.borderRadius);
      if (Number.isNaN(val)) {
        return '0px';
      }
      return `${Math.min(val, size / 2)}px`;
    };

    const captureHero = (): Snap | null => {
      const heroImg = document.querySelector<HTMLElement>('.hero-avatar');
      const heroName = document.querySelector<HTMLElement>('.home-hero h1');
      if (!heroImg || !heroName) {
        return null;
      }
      const imgRect = heroImg.getBoundingClientRect();
      const h1Rect = heroName.getBoundingClientRect();
      const textRange = document.createRange();
      textRange.selectNodeContents(heroName);
      const textRect = textRange.getBoundingClientRect();
      if (!imgRect.width || !h1Rect.width || !textRect.width) {
        return null;
      }
      return {
        imgRect,
        h1Rect,
        textRect,
        imgStyle: getComputedStyle(heroImg),
        h1Style: getComputedStyle(heroName)
      };
    };

    const captureBrand = (): Snap | null => {
      const logo = brandRef.current?.querySelector<HTMLElement>('.brand-logo');
      const name = brandRef.current?.querySelector<HTMLElement>('.brand-name');
      if (!logo || !name) {
        return null;
      }
      const logoRect = logo.getBoundingClientRect();
      const nameRect = name.getBoundingClientRect();
      if (!logoRect.width || !nameRect.width) {
        return null;
      }
      return {
        imgRect: logoRect,
        h1Rect: nameRect,
        textRect: nameRect,
        imgStyle: getComputedStyle(logo),
        h1Style: getComputedStyle(name)
      };
    };

    const destroyClones = () => {
      if (fadeTimer) {
        window.clearTimeout(fadeTimer);
        fadeTimer = 0;
      }
      anims.forEach((a) => a.cancel());
      anims = [];
      clones.splice(0).forEach((el) => el.remove());
      startImgKf = null;
      startNameKf = null;
    };

    /* 落位后停留 0.1s 再渐隐；移除克隆体时一并撤销 instant 状态 */
    const fadeOutClones = () => {
      clones.forEach((el) => {
        el.style.transition = 'opacity 0.3s var(--ease) 0.1s';
        el.style.opacity = '0';
      });
      fadeTimer = window.setTimeout(() => {
        fadeTimer = 0;
        clones.splice(0).forEach((el) => el.remove());
        anims = [];
        startImgKf = null;
        startNameKf = null;
        document.documentElement.classList.remove('hero-instant');
        setBrandInstant(false);
      }, 460);
    };

    const finishInstant = (dir: 'toBrand' | 'toHero') => {
      destroyClones();
      if (dir === 'toBrand') {
        phase = 'shown';
        hideHero();
        showBrandInstant();
      } else {
        phase = 'hidden';
        revealHeroInstant();
        setShowBrand(false);
      }
    };

    /* 打断：把克隆体当前动画值冻结成内联样式，作为掉头飞行的新起点；
       渐隐中被打断时透明度用 0.12s 短过渡拉回 1，避免跳变 */
    const freezeClones = () => {
      const avatar = clones[0] as HTMLImageElement;
      const flyName = clones[1] as HTMLSpanElement;
      const cs = getComputedStyle(avatar);
      const csn = getComputedStyle(flyName);
      anims.forEach((a) => a.cancel());
      anims = [];
      avatar.style.transition = 'none';
      avatar.style.left = cs.left;
      avatar.style.top = cs.top;
      avatar.style.width = cs.width;
      avatar.style.height = cs.height;
      avatar.style.borderRadius = cs.borderRadius;
      avatar.style.borderColor = cs.borderTopColor;
      avatar.style.transition = 'opacity 0.12s var(--ease)';
      avatar.style.opacity = '1';
      flyName.style.transition = 'none';
      flyName.style.left = csn.left;
      flyName.style.top = csn.top;
      flyName.style.fontSize = csn.fontSize;
      flyName.style.lineHeight = csn.lineHeight;
      flyName.style.letterSpacing = csn.letterSpacing;
      flyName.style.transition = 'opacity 0.12s var(--ease)';
      flyName.style.opacity = '1';
    };

    /* 统一飞行：dir 为飞行方向；克隆体已存在时从当前位置冻结起飞（打断掉头） */
    const startFlight = (dir: 'toBrand' | 'toHero') => {
      const target = dir === 'toBrand' ? captureBrand() : captureHero();
      if (!target || reduced()) {
        finishInstant(dir);
        return;
      }
      /* 新飞行开始前撤销落位 instant 状态，让飞行期间的真实元素过渡恢复正常 */
      document.documentElement.classList.remove('hero-instant');
      setBrandInstant(false);
      if (clones.length === 2) {
        if (fadeTimer) {
          window.clearTimeout(fadeTimer);
          fadeTimer = 0;
        }
        freezeClones();
      } else {
        const start = dir === 'toBrand' ? captureHero() : captureBrand();
        if (!start) {
          finishInstant(dir);
          return;
        }
        const avatar = document.createElement('img');
        avatar.src = import.meta.env.BASE_URL + 'images/avatar.png';
        avatar.alt = '';
        avatar.decoding = 'async';
        avatar.ariaHidden = 'true';
        avatar.style.cssText = `position:fixed;margin:0;z-index:45;pointer-events:none;object-fit:cover;left:${start.imgRect.left}px;top:${start.imgRect.top}px;width:${start.imgRect.width}px;height:${start.imgRect.height}px;border:${start.imgStyle.border};border-radius:${radiusPx(start.imgStyle, start.imgRect.width)};`;
        avatar.style.setProperty('corner-shape', start.imgStyle.getPropertyValue('corner-shape') || 'round');
        const flyName = document.createElement('span');
        flyName.textContent = document.querySelector<HTMLElement>('.home-hero h1')?.textContent ?? '';
        flyName.ariaHidden = 'true';
        flyName.style.cssText = `position:fixed;margin:0;z-index:45;pointer-events:none;white-space:nowrap;left:${start.textRect.left}px;top:${start.h1Rect.top}px;font-family:${start.h1Style.fontFamily};font-weight:${start.h1Style.fontWeight};color:${start.h1Style.color};font-size:${start.h1Style.fontSize};line-height:${start.h1Rect.height}px;letter-spacing:${start.h1Style.letterSpacing};`;
        document.body.append(avatar, flyName);
        clones.push(avatar, flyName);
      }
      /* 打断接管路径也必须隐藏 hero 原位：快速来回滚动时 hero 可能刚被显示 */
      hideHero();
      const avatar = clones[0] as HTMLImageElement;
      const flyName = clones[1] as HTMLSpanElement;
      const endImg: Keyframe = {
        left: `${target.imgRect.left}px`,
        top: `${target.imgRect.top}px`,
        width: `${target.imgRect.width}px`,
        height: `${target.imgRect.height}px`,
        borderRadius: radiusPx(target.imgStyle, target.imgRect.width),
        borderColor: target.imgStyle.borderTopColor,
        cornerShape: target.imgStyle.getPropertyValue('corner-shape') || 'round'
      };
      const endName: Keyframe = {
        left: `${target.textRect.left}px`,
        top: `${target.h1Rect.top}px`,
        fontSize: target.h1Style.fontSize,
        lineHeight: `${target.h1Rect.height}px`,
        letterSpacing: target.h1Style.letterSpacing
      };
      startImgKf = {
        left: avatar.style.left,
        top: avatar.style.top,
        width: avatar.style.width,
        height: avatar.style.height,
        borderRadius: avatar.style.borderRadius,
        borderColor: avatar.style.borderTopColor,
        cornerShape: avatar.style.getPropertyValue('corner-shape') || 'round'
      };
      startNameKf = {
        left: flyName.style.left,
        top: flyName.style.top,
        fontSize: flyName.style.fontSize,
        lineHeight: flyName.style.lineHeight,
        letterSpacing: flyName.style.letterSpacing
      };
      phase = dir;
      if (dir === 'toHero') {
        setShowBrand(false);
      }
      const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
      const dur = 500;
      /* 半径、描边色、corner-shape 与位置尺寸同一关键帧同步插值，
         corner-shape 为离散插值在中点切换，两端与真实元素完全一致 */
      const a1 = avatar.animate([startImgKf, endImg], { duration: dur, easing: ease, fill: 'forwards' });
      const a2 = flyName.animate([startNameKf, endName], { duration: dur, easing: ease, fill: 'forwards' });
      anims = [a1, a2];
      Promise.all([a1.finished, a2.finished])
        .then(() => {
          if (phase !== dir) {
            return;
          }
          anims = [];
          startImgKf = null;
          startNameKf = null;
          if (dir === 'toBrand') {
            phase = 'shown';
            showBrandInstant();
          } else {
            phase = 'hidden';
            revealHeroInstant();
            setShowBrand(false);
          }
          fadeOutClones();
        })
        .catch(() => {});
    };

    /* toHero 飞行途中继续滚动时，实时把终点更新为大头像当前位置（起点关键帧不变，进度保留） */
    const retarget = () => {
      if (phase !== 'toHero' || anims.length !== 2 || !startImgKf || !startNameKf) {
        return;
      }
      const target = captureHero();
      if (!target) {
        return;
      }
      const eff1 = anims[0].effect as KeyframeEffect | null;
      const eff2 = anims[1].effect as KeyframeEffect | null;
      if (!eff1 || !eff2) {
        return;
      }
      eff1.setKeyframes([
        startImgKf,
        {
          left: `${target.imgRect.left}px`,
          top: `${target.imgRect.top}px`,
          width: `${target.imgRect.width}px`,
          height: `${target.imgRect.height}px`,
          borderRadius: radiusPx(target.imgStyle, target.imgRect.width),
          borderColor: target.imgStyle.borderTopColor,
          cornerShape: target.imgStyle.getPropertyValue('corner-shape') || 'round'
        }
      ]);
      eff2.setKeyframes([
        startNameKf,
        {
          left: `${target.textRect.left}px`,
          top: `${target.h1Rect.top}px`,
          fontSize: target.h1Style.fontSize,
          lineHeight: `${target.h1Rect.height}px`,
          letterSpacing: target.h1Style.letterSpacing
        }
      ]);
    };

    const check = (instant: boolean) => {
      const heroImg = document.querySelector<HTMLElement>('.hero-avatar');
      if (!heroImg) {
        return;
      }
      const header = document.querySelector('.site-header');
      const navBottom = header ? header.getBoundingClientRect().bottom : 64;
      const needBrand = heroImg.getBoundingClientRect().top < navBottom;
      if (needBrand) {
        if (phase === 'shown' || phase === 'toBrand') {
          return;
        }
        if (instant) {
          finishInstant('toBrand');
        } else {
          startFlight('toBrand');
        }
      } else {
        if (phase === 'hidden') {
          return;
        }
        if (phase === 'toHero') {
          retarget();
          return;
        }
        if (instant) {
          finishInstant('toHero');
        } else {
          startFlight('toHero');
        }
      }
    };

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          check(false);
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    check(true);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
      destroyClones();
      revealHero();
      document.documentElement.classList.remove('hero-instant');
    };
  }, [path]);

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
        {(path === '/' || showBrand) && (
          <a
            ref={brandRef}
            className={`brand${path === '/' && !showBrand ? ' brand-hidden' : ''}${brandInstant ? ' brand-instant' : ''}`}
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
            <span className="brand-name">白吟秋</span>
          </a>
        )}
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
