import { usePrefs, useT, type CornerStyle, type Lang, type ThemeMode } from '../context/Prefs';
import { Panel } from '../components/Panel';

/* 分段控件：与旧站一致，选中项加 is-active 并同步 aria-pressed */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`segment${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Settings() {
  const t = useT();
  const {
    lang,
    setLang,
    themeMode,
    setThemeMode,
    cornerStyle,
    setCornerStyle,
    articleTranslate,
    setArticleTranslate,
    cookieSkip,
    setCookieSkip
  } = usePrefs();

  /* 全文翻译状态说明：与旧站 article-lang.js 的 STATUS 文案一致 */
  let translateStatus: string;
  if (!articleTranslate) {
    translateStatus =
      lang === 'en'
        ? 'Off. The site keeps its original Chinese text.'
        : '未开启，站内文字保持中文原文。';
  } else if (lang !== 'en') {
    translateStatus =
      '已开启，但界面语言为中文，站内文字仍显示中文原文；把界面语言切到 English 即可看到英文版本。';
  } else {
    translateStatus =
      lang === 'en'
        ? 'On. The site shows AI-assisted English text, which may contain inaccuracies and is not guaranteed to be 100% correct.'
        : '已开启，站内各处的文字都显示英文版本；英文内容由 AI 辅助翻译，可能出现偏差，不保证 100% 正确。';
  }

  return (
    <main className="post-main container">
      <Panel className="panel-title" label={t('设置')}>
        <h1>{t('设置')}</h1>
        <div className="post-meta">
          <span className="tags">
            <span className="tag">{'#'}{t('设置')}</span>
          </span>
        </div>
      </Panel>

      <Panel title={t('语言')}>
        <p className="setting-hint">{t('切换界面语言。站内文字以中文撰写，可开启下方的全文翻译。')}</p>
        <Segmented<Lang>
          label={t('语言')}
          value={lang}
          onChange={setLang}
          options={[
            { value: 'zh', label: '简体中文' },
            { value: 'en', label: 'English' }
          ]}
        />

        <h3 className="setting-subtitle">{t('全文翻译')}</h3>
        <p className="setting-hint">
          {t(
            '开启后，界面语言为 English 时，站内各处的文字都会显示英文版本；英文内容由 AI 辅助翻译，可能出现偏差，不保证 100% 正确。'
          )}
        </p>
        <Segmented<'off' | 'on'>
          label={t('全文翻译')}
          value={articleTranslate ? 'on' : 'off'}
          onChange={(v) => setArticleTranslate(v === 'on')}
          options={[
            { value: 'off', label: t('关闭') },
            { value: 'on', label: t('开启') }
          ]}
        />
        <p className="setting-note">{translateStatus}</p>
      </Panel>

      <Panel title={t('主题')}>
        <p className="setting-hint">{t('选择深色、浅色或跟随系统外观，与顶栏的切换按钮保持一致。')}</p>
        <Segmented<ThemeMode>
          label={t('主题')}
          value={themeMode}
          onChange={setThemeMode}
          options={[
            { value: 'dark', label: t('深色') },
            { value: 'light', label: t('浅色') },
            { value: 'system', label: t('跟随系统') }
          ]}
        />
      </Panel>

      <Panel title={t('样式')}>
        <p className="setting-hint">
          {t(
            '选择全站的边角样式：直角风格保持现在的利落感；圆角风格把直角换为小圆角，并让转角曲线更顺滑（曲率连续）。'
          )}
        </p>
        <Segmented<CornerStyle>
          label={t('样式')}
          value={cornerStyle}
          onChange={setCornerStyle}
          options={[
            { value: 'rounded', label: t('圆角风格') },
            { value: 'right', label: t('直角风格') }
          ]}
        />
      </Panel>

      <Panel title={t('Cookie 提示')}>
        <p className="setting-hint">{t('本站不设追踪型 Cookie，只在本机记住你的选择。')}</p>
        <Segmented<'ask' | 'skip'>
          label={t('Cookie 提示')}
          value={cookieSkip ? 'skip' : 'ask'}
          onChange={(v) => setCookieSkip(v === 'skip')}
          options={[
            { value: 'ask', label: t('每次询问') },
            { value: 'skip', label: t('不再提示') }
          ]}
        />
      </Panel>

      <p className="setting-note">{t('设置保存在本机浏览器，不会上传。')}</p>
    </main>
  );
}