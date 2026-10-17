import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { TITLE_EN, TITLE_ZH, ZH_TO_EN } from '../i18n/phrases';

export type Lang = 'zh' | 'en';
export type ThemeMode = 'dark' | 'light' | 'system';
/* 边角样式：直角（默认，现站样式）与圆角（小圆角 + G2 连续曲率） */
export type CornerStyle = 'right' | 'rounded';

const LANG_KEY = 'hcl-lang';
const THEME_KEY = 'hcl-theme';
const CORNER_KEY = 'hcl-corner';
const TRANSLATE_KEY = 'hcl-article-translate';
const COOKIE_KEY = 'hcl-cookie-ok';

export interface Prefs {
  lang: Lang;
  setLang: (lang: Lang) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  cornerStyle: CornerStyle;
  setCornerStyle: (style: CornerStyle) => void;
  articleTranslate: boolean;
  setArticleTranslate: (on: boolean) => void;
  cookieSkip: boolean;
  setCookieSkip: (skip: boolean) => void;
}

const PrefsContext = createContext<Prefs | null>(null);

function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

function readThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'system' ? v : 'dark';
  } catch {
    return 'dark';
  }
}

function readCorner(): CornerStyle {
  try {
    return localStorage.getItem(CORNER_KEY) === 'rounded' ? 'rounded' : 'right';
  } catch {
    return 'right';
  }
}

function readTranslated(): boolean {
  try {
    return localStorage.getItem(TRANSLATE_KEY) === '1';
  } catch {
    return false;
  }
}

function readCookieSkip(): boolean {
  try {
    return localStorage.getItem(COOKIE_KEY) === '1';
  } catch {
    return false;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    /* 隐私模式下忽略写入失败 */
  }
}

function mediaLight() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches;
}

const MODE_ORDER: ThemeMode[] = ['dark', 'light', 'system'];

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readThemeMode);
  const [cornerStyle, setCornerStyleState] = useState<CornerStyle>(readCorner);
  const [articleTranslate, setTranslateState] = useState<boolean>(readTranslated);
  const [cookieSkip, setCookieSkipState] = useState<boolean>(readCookieSkip);

  /* 界面语言：同步 <html lang / data-lang> 与页面标题 */
  useEffect(() => {
    const root = document.documentElement;
    if (lang === 'en') {
      root.setAttribute('data-lang', 'en');
      root.setAttribute('lang', 'en');
    } else {
      root.removeAttribute('data-lang');
      root.setAttribute('lang', 'zh-CN');
    }
  }, [lang]);

  /* 主题：切换 data-theme 与 theme-color。切换动画由外部负责。 */
  useEffect(() => {
    const root = document.documentElement;
    const light = themeMode === 'system' ? mediaLight() : themeMode === 'light';
    if (light) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', light ? '#f5f5f5' : '#0e0e0e');
    }
  }, [themeMode]);

  /* 跟随系统：系统外观变化时重新判定 */
  useEffect(() => {
    if (themeMode !== 'system' || typeof window.matchMedia !== 'function') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      const light = media.matches;
      const root = document.documentElement;
      if (light) {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', light ? '#f5f5f5' : '#0e0e0e');
      }
    };
    if (media.addEventListener) {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    return undefined;
  }, [themeMode]);

  /* 边角样式：直角（默认）不加属性，圆角时挂上 html[data-corner="rounded"] */
  useEffect(() => {
    const root = document.documentElement;
    if (cornerStyle === 'rounded') {
      root.setAttribute('data-corner', 'rounded');
    } else {
      root.removeAttribute('data-corner');
    }
  }, [cornerStyle]);

  /* 全文翻译：切换 html[data-article-lang] */
  useEffect(() => {
    const root = document.documentElement;
    if (articleTranslate && lang === 'en') {
      root.setAttribute('data-article-lang', 'en');
    } else {
      root.removeAttribute('data-article-lang');
    }
  }, [articleTranslate, lang]);

  const value: Prefs = {
    lang,
    setLang: (next) => {
      setLangState(next);
      write(LANG_KEY, next);
    },
    themeMode,
    setThemeMode: (next) => {
      if (!MODE_ORDER.includes(next) || next === themeMode) {
        return;
      }
      write(THEME_KEY, next);

      /* 外观实际没变（例如浅色 → 跟随系统且系统就是浅色）就不播遮罩过渡 */
      const nextLight = next === 'system' ? mediaLight() : next === 'light';
      const curLight = themeMode === 'system' ? mediaLight() : themeMode === 'light';
      if (nextLight === curLight) {
        setThemeModeState(next);
        return;
      }

      /* 整页遮罩过渡：先用当前背景色盖住页面，再切换主题并让遮罩淡出 */
      const layer = document.createElement('div');
      layer.className = 'theme-fade-layer';
      layer.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
      layer.style.transition = 'none';
      layer.style.opacity = '1';
      document.body.appendChild(layer);
      layer.getBoundingClientRect();

      document.documentElement.classList.add('theme-switching');
      setThemeModeState(next);
      layer.style.transition = '';
      layer.style.opacity = '0';

      window.setTimeout(() => {
        document.documentElement.classList.remove('theme-switching');
        layer.remove();
      }, 320);
    },
    articleTranslate,
    setArticleTranslate: (on) => {
      setTranslateState(on);
      write(TRANSLATE_KEY, on ? '1' : '0');
    },
    cornerStyle,
    setCornerStyle: (next) => {
      setCornerStyleState(next);
      write(CORNER_KEY, next);
    },
    cookieSkip,
    setCookieSkip: (skip) => {
      setCookieSkipState(skip);
      write(COOKIE_KEY, skip ? '1' : null);
    }
  };

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) {
    throw new Error('usePrefs 必须在 PrefsProvider 内使用');
  }
  return ctx;
}

/* 文案翻译：中文原文作为 key，英文时查表 */
export function useT() {
  const { lang } = usePrefs();
  return (zh: string): string => (lang === 'en' ? ZH_TO_EN[zh] ?? zh : zh);
}

/* 当前实际生效的外观（跟随系统时取系统偏好） */
export function useIsLight(): boolean {
  const { themeMode } = usePrefs();
  const [light, setLight] = useState(() => (themeMode === 'system' ? mediaLight() : themeMode === 'light'));
  useEffect(() => {
    setLight(themeMode === 'system' ? mediaLight() : themeMode === 'light');
  }, [themeMode]);
  return light;
}

export function useDocumentTitle() {
  const { lang } = usePrefs();
  return (path: string) => {
    document.title = lang === 'en' ? TITLE_EN[path] ?? TITLE_ZH[path] ?? 'Yinqiu' : TITLE_ZH[path] ?? '白吟秋';
  };
}
