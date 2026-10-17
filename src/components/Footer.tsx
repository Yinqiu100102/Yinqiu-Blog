import { useT } from '../context/Prefs';
import { IconAifadian, IconBilibili, IconGithub, IconQq } from './icons';

/* 站点页脚：社交入口 + 版权。主页顶部已有社交入口，可用 showSocial={false} 隐藏 */
export function Footer({ showSocial = true }: { showSocial?: boolean }) {
  const t = useT();
  return (
    <footer className="site-footer">
      <div className="container">
        {showSocial && (
          <>
            <div className="footer-label">{t('欢迎在这些地方找到我：')}</div>
            <div className="hero-social">
              <a
                className="social-btn"
                href="https://github.com/Yinqiu100102"
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
          </>
        )}
        <p>{t('© 2026 白吟秋 · 保留所有权利')}</p>
      </div>
    </footer>
  );
}
