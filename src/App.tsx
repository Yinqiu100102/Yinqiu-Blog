import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PrefsProvider, usePrefs } from './context/Prefs';
import { SiteNavProvider } from './context/SiteNav';
import { Layout } from './components/Layout';
import { normalizePath } from './context/SiteNav';
import { TITLE_EN, TITLE_ZH } from './i18n/phrases';
import Home from './pages/Home';
import Posts from './pages/Posts';
import Videos from './pages/Videos';
import Archive from './pages/Archive';
import Friends from './pages/Friends';
import About from './pages/About';
import Changelog from './pages/Changelog';
import Sponsor from './pages/Sponsor';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/* 按当前路由与语言同步页面标题 */
function TitleSync() {
  const { lang } = usePrefs();
  const location = useLocation();
  useEffect(() => {
    const path = normalizePath(location.pathname);
    document.title = (lang === 'en' ? TITLE_EN[path] : TITLE_ZH[path]) ?? 'Hangou';
  }, [lang, location.pathname]);
  return null;
}

export default function App() {
  return (
    <PrefsProvider>
      <SiteNavProvider>
        <TitleSync />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/posts/about" element={<About />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SiteNavProvider>
    </PrefsProvider>
  );
}
