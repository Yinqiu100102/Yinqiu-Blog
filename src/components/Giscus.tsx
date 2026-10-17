import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsLight } from '../context/Prefs';

/* giscus 配置来自 https://giscus.app：
   repo 和 repoId 跟着仓库走，CATEGORY / CATEGORY_ID 是评论落在哪个 Discussion 分类。 */
const REPO = 'Yinqiu100102/Yinqiu-Blog';
const REPO_ID = 'R_kgDOULrVTw';
const CATEGORY = 'Announcements';
const CATEGORY_ID = 'DIC_kwDOULrVT84DGYVe';

/* 自定义主题：giscus 的 data-theme 只认内置主题名或一个线上 CSS URL，
   iframe 跨域没法直接注入样式，所以把站点风格写成两份主题文件放在 public/giscus/，
   按当前主题把绝对 URL 传给 giscus。
   但 giscus 是从它自己服务器去拉这份 CSS，localhost 对它是不可达的 ——
   本地 dev 下自定义主题必然加载失败、评论框会退成默认外观。
   所以本地改用内置的 dark / light 主题做兜底对比，只有构建产物才走自定义主题。 */
const USE_CUSTOM_THEME = import.meta.env.PROD;

const BUILTIN_DARK = 'dark';
const BUILTIN_LIGHT = 'light';

function themeUrl(isLight: boolean): string {
  if (!USE_CUSTOM_THEME) {
    return isLight ? BUILTIN_LIGHT : BUILTIN_DARK;
  }
  return new URL(isLight ? 'giscus/light.css' : 'giscus/dark.css', window.location.href).href;
}

/* 挂载 giscus 评论：用 GitHub Discussions 存评论，静态站点无需后端 */
export function Giscus() {
  const isLight = useIsLight();
  const { pathname } = useLocation();

  /* 站点用 HashRouter，真实路由都在 # 后面，所以 location.pathname 恒为 "/"。
     giscus 客户端在 pathname 映射下会把这种路径当成固定的 "index"，url 映射又会先剥掉 hash，
     两种都会让所有页面共用一个 Discussion。改用 specific 映射，把路由路径显式作为 term。 */
  const term = pathname;

  /* 挂载点用 ref 拿，不给容器加 id。
     giscus 的 client.js 会把挂载点的 id 拼进 OAuth 的 redirect_uri
     （c.origin = location + "#" + id），登录后跳回来就带上 "#giscusHost"，
     而这个 hash 不是站内路由，会落到 404 页。所以容器不留 id。 */
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    /* 路由变化（term 变化）时会重建 iframe，先清掉上一份 */
    host.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    const config: Record<string, string> = {
      'data-repo': REPO,
      'data-repo-id': REPO_ID,
      'data-category': CATEGORY,
      'data-category-id': CATEGORY_ID,
      'data-mapping': 'specific',
      'data-term': term,
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-theme': themeUrl(isLight),
      'data-lang': 'zh-CN'
    };
    Object.keys(config).forEach((key) => script.setAttribute(key, config[key]));
    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
    // term 变化时重建 iframe；主题变化交给下面的 effect 处理，不重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  /* 主题切换时把新主题发给 giscus iframe */
  useEffect(() => {
    const frame = document.querySelector('iframe.giscus-frame') as HTMLIFrameElement | null;
    if (!frame || !frame.contentWindow) {
      return;
    }
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: themeUrl(isLight) } } },
      'https://giscus.app'
    );
  }, [isLight]);

  /* className="giscus" 必须保留：giscus 的 client.js 靠这个类名找挂载点 */
  return <div className="giscus" ref={hostRef} />;
}
