import { useT } from '../context/Prefs';
import { formatDate, videoUrl, type BiliVideo } from '../lib/bili';
import { IconClockSmall } from './icons';

/* 视频卡片：视频页与首页共用；整卡可点（内层链接自行接管，避免重复打开） */
export function VideoItem({
  video,
  blur = false,
  onMore
}: {
  video: BiliVideo;
  /** 首页"显示更多"用：整卡盖模糊浮层，点击走 onMore 跳转视频列表 */
  blur?: boolean;
  onMore?: () => void;
}) {
  const t = useT();
  const url = videoUrl(video.bvid);

  const nav = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (blur && onMore) {
      onMore();
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  return (
    <article
      className={`post-item video-item${blur ? ' video-more' : ''}`}
      onClick={nav}
    >
      <a
        className="post-thumb-link video-thumb-link"
        href={url}
        target="_blank"
        rel="noopener"
        onClick={blur ? (e) => e.preventDefault() : undefined}
        tabIndex={blur ? -1 : undefined}
        aria-hidden={blur || undefined}
      >
        <img
          className={`post-thumb${blur ? ' video-more-thumb' : ''}`}
          src={video.pic}
          alt={video.title}
          loading="lazy"
          width={320}
          height={200}
          referrerPolicy="no-referrer"
        />
      </a>
      {blur && (
        <span className="video-more-cover">
          <span className="video-more-title">
            {t('显示更多')}
            <span className="video-more-arrow" aria-hidden="true">
              →
            </span>
          </span>
        </span>
      )}
      <div className="post-body">
        <div className="post-tags-row">
          <span className="date">
            <IconClockSmall />
            {formatDate(video.created)}
          </span>
        </div>
        <h2>
          <a href={url} target="_blank" rel="noopener">
            {video.title}
          </a>
        </h2>
        {video.desc && (
          <p className="post-excerpt" title={video.desc}>
            {video.desc}
          </p>
        )}
      </div>
    </article>
  );
}
