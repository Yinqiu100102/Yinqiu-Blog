import { useT } from '../context/Prefs';
import { Panel } from '../components/Panel';

export default function Sponsor() {
  const t = useT();

  return (
    <main className="post-main container">
      <Panel className="panel-title" label={t('支持白吟秋')}>
        <h1>{t('支持白吟秋')}</h1>
        <div className="post-meta">
          <span className="tag">{'#'}{t('赞助')}</span>
        </div>
      </Panel>

      <Panel title={t('支持创作')}>
        <p className="panel-text">
          {t('如果我的文章、项目或分享对你有帮助，欢迎通过爱发电支持我。每一份支持都会成为继续创作的动力。')}
        </p>
        <p className="panel-text">{t('点击下面的按钮前往爱发电完成赞助。')}</p>
        <a
          className="sponsor-action"
          href="https://ifdian.net/order/create?plan_id=bf2213faa86511f1a6555254001e7c00&product_type=0&remark=&affiliate_code="
          target="_blank"
          rel="noopener"
        >
          {t('前往爱发电赞助')}
        </a>
      </Panel>

      <Panel title={t('赞助列表')}>
        <div className="sponsor-empty">{t('赞助名单整理中，感谢每一位支持者～')}</div>
      </Panel>
    </main>
  );
}
