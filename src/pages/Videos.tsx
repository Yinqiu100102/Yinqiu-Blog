import { useEffect, useMemo, useState } from 'react';
import { usePrefs, useT } from '../context/Prefs';
import { useSearch } from '../hooks/useSearch';
import { fetchBiliVideos, type BiliVideo } from '../lib/bili';
import { VideoItem } from '../components/VideoCard';

/* 搜索范围：标题 + 简介 */
const videoSearchText = (v: BiliVideo) => `${v.title} ${v.desc}`;

type SortKey = 'date' | 'hot';

/* 前端分页：数据已全量下发，这里只做展示切片 */
const PAGE_SIZE = 12;

export default function Videos() {
  const t = useT();
  const { lang } = usePrefs();
  const [videos, setVideos] = useState<BiliVideo[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sort, setSort] = useState<SortKey>('date');
  const [page, setPage] = useState(1);
  const search = useSearch(videos ?? [], videoSearchText);

  /* 先搜索过滤，再按当前排序重排：时间为新→旧，热度为播放多→少 */
  const shown = useMemo(() => {
    const list = [...search.results];
    if (sort === 'hot') {
      list.sort((a, b) => b.play - a.play);
    } else {
      list.sort((a, b) => b.created - a.created);
    }
    return list;
  }, [search.results, sort]);

  /* 搜索或排序变化时回到第一页 */
  useEffect(() => {
    setPage(1);
  }, [search.value, sort]);

  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [shown, safePage]
  );

  const goto = (target: number) => {
    setPage(Math.min(Math.max(1, target), totalPages));
    document.querySelector('.video-toolbar')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let alive = true;
    fetchBiliVideos()
      .then((list) => {
        if (alive) {
          setVideos(list);
        }
      })
      .catch(() => {
        if (alive) {
          setFailed(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="page-main container">
      <section className="panel page-hero">
        <div className="panel-body">
          <h1>
            <span data-lang-variant="zh">
              视<span className="highlight">频</span>
            </span>
            <span data-lang-variant="en" lang="en">
              Vide<span className="highlight">os</span>
            </span>
          </h1>
          <p>{t('这里是我发布在B站的视频，数据每天同步一次。')}</p>
        </div>
      </section>

      <section className="panel" aria-label={t('B站视频列表')}>
        <div className="panel-body">
          {videos === null ? (
            <p className="no-result">
              {failed
                ? t('暂时取不到视频列表，稍后再来看看？')
                : t('正在加载视频…')}
            </p>
          ) : (
            <>
              <input
                type="search"
                className="search-input"
                placeholder={t('搜索视频标题或简介…')}
                autoComplete="off"
                aria-label={t('搜索视频')}
                value={search.value}
                onChange={search.onChange}
                onCompositionStart={search.onCompositionStart}
                onCompositionEnd={search.onCompositionEnd}
              />

              <div className="video-toolbar">
                <div className="segmented" role="group" aria-label={t('排序方式')}>
                  {(
                    [
                      ['date', lang === 'en' ? 'Latest' : '最新发布'],
                      ['hot', lang === 'en' ? 'Most viewed' : '最多播放']
                    ] as Array<[SortKey, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`segment${sort === key ? ' is-active' : ''}`}
                      aria-pressed={sort === key}
                      onClick={() => setSort(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-list-inner">
                <p className="no-result" hidden={search.hasResults}>
                  {t('没有找到相关视频，换个关键词试试？')}
                </p>
                {pageItems.map((video) => (
                  <VideoItem key={video.bvid} video={video} />
                ))}
              </div>

              <nav className="pager" aria-label={t('视频翻页')} hidden={totalPages <= 1}>
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => goto(safePage - 1)}
                >
                  {t('上一页')}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === safePage ? 'is-current' : ''}
                    aria-current={n === safePage ? 'page' : undefined}
                    onClick={() => goto(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => goto(safePage + 1)}
                >
                  {t('下一页')}
                </button>
              </nav>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
