import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* 站点的页面顺序，决定「左右」：序号越大越靠右。加新页面时记得同步这里。 */
export const ORDER = [
  '/',
  '/posts',
  '/videos',
  '/archive',
  '/friends',
  '/posts/about',
  '/changelog',
  '/sponsor',
  '/privacy',
  '/settings'
];

const LEAVE_MS = 200;
const DIR_KEY = 'hcl-nav-dir';
const SEEN_KEY = 'hcl-nav-seen';

function orderOf(pathname: string): number {
  const i = ORDER.indexOf(pathname);
  return i < 0 ? 1 : i;
}

/* 站点内所有页面的路径前缀（去掉尾部斜杠，根为 '/'） */
export function normalizePath(pathname: string): string {
  const p = pathname.replace(/index\.html$/, '');
  const trimmed = p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
  return trimmed === '' ? '/' : trimmed;
}

export interface SiteNav {
  /** 站内跳转，带方向过渡 */
  go: (to: string) => void;
  /** 当前页路径（归一化后） */
  path: string;
}

const SiteNavContext = createContext<SiteNav | null>(null);

const reduced =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export function SiteNavProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const leaving = useRef(false);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  /* 从 bfcache 返回时清掉 is-leaving，避免整页停在滑出状态 */
  useEffect(() => {
    const onShow = () => document.documentElement.classList.remove('is-leaving');
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  /* 浏览器前进/后退：没有 forward 标记就按后退方向的进场动画 */
  useEffect(() => {
    const onPop = () => {
      let dir: string | null = null;
      try {
        dir = sessionStorage.getItem(DIR_KEY);
        sessionStorage.removeItem(DIR_KEY);
      } catch {
        /* 忽略 */
      }
      const root = document.documentElement;
      root.classList.toggle('nav-back', dir !== 'forward');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback(
    (to: string) => {
      const from = pathRef.current;
      /* 点到当前页自己：不翻页，直接回到顶端 */
      if (to === from) {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      /* 系统开了「减弱动态效果」就不做过渡，直接跳 */
      if (reduced) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }
      if (leaving.current) {
        return;
      }
      leaving.current = true;

      const root = document.documentElement;
      const backward = orderOf(to) < orderOf(from);
      root.classList.toggle('nav-back', backward);

      try {
        sessionStorage.setItem(DIR_KEY, backward ? 'backward' : 'forward');
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* 隐私模式下 sessionStorage 可能不可用 */
      }

      root.classList.add('is-leaving');
      window.setTimeout(() => {
        navigate(to);
        window.scrollTo(0, 0);
        root.classList.remove('is-leaving');
        leaving.current = false;
      }, LEAVE_MS);
    },
    [navigate]
  );

  return (
    <SiteNavContext.Provider value={{ go, path: normalizePath(location.pathname) }}>
      {children}
    </SiteNavContext.Provider>
  );
}

export function useSiteNav(): SiteNav {
  const ctx = useContext(SiteNavContext);
  if (!ctx) {
    throw new Error('useSiteNav 必须在 SiteNavProvider 内使用');
  }
  return ctx;
}
