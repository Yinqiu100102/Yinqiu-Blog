import { useEffect, useRef, useState } from 'react';
import { usePrefs, useT } from '../context/Prefs';
import { useSiteNav } from '../context/SiteNav';

/* Cookie 确认弹窗：没确认过就弹出居中对话框并锁定页面滚动。
   「知道了」写入记录，之后不再出现；「取消」只关闭本次弹窗。 */
export function CookieModal() {
  const t = useT();
  const { cookieSkip, setCookieSkip } = usePrefs();
  const { go } = useSiteNav();
  const [open, setOpen] = useState(() => !cookieSkip);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.classList.add('cookie-open');
      btnRef.current?.focus({ preventScroll: true });
    } else {
      root.classList.remove('cookie-open');
    }
  }, [open]);

  /* 设置页切到「不再提示」时同步关闭；切回「每次询问」不影响当前弹窗 */
  useEffect(() => {
    if (cookieSkip) {
      setOpen(false);
    }
  }, [cookieSkip]);

  return (
    <div
      className="cookie-modal"
      id="cookieTip"
      role="dialog"
      aria-modal="true"
      aria-label={t('Cookie 与本地存储确认')}
      hidden={!open}
    >
      <div className="cookie-modal-card">
        <h2>{t('本站如何使用 Cookie')}</h2>
        <p>
          {t('本站不设追踪型 Cookie，仅用浏览器本地存储记住偏好设置；打开文章时会向自建接口发送文章路径以统计浏览次数，不涉及任何身份信息。详见')}
          <a
            href="#/privacy"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              go('/privacy');
            }}
          >
            {t('隐私政策')}
          </a>
          。
        </p>
        <div className="cookie-modal-actions">
          <button type="button" className="cookie-tip-btn cookie-tip-cancel" onClick={() => setOpen(false)}>
            {t('取消')}
          </button>
          <button
            type="button"
            className="cookie-tip-btn"
            ref={btnRef}
            onClick={() => {
              setCookieSkip(true);
              setOpen(false);
            }}
          >
            {t('知道了')}
          </button>
        </div>
      </div>
    </div>
  );
}
