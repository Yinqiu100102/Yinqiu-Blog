/* B站视频数据层
 *
 * 数据由 GitHub Actions（.github/workflows/bili-videos.yml）定时抓取，
 * 静态 JSON 提交到 public/data/bili-videos.json，前端直接 fetch，无运行时接口。
 * 抓取实现见 scripts/fetch-bili-videos.mjs（wbi 签名 + 游客 Cookie）。
 */

import type { Lang } from '../context/Prefs';

export interface BiliVideo {
  bvid: string;
  title: string;
  pic: string;
  /** 时长，B站原始的 "mm:ss" 文本 */
  length: string;
  play: number;
  danmaku: number;
  /** 发布时间（秒级时间戳） */
  created: number;
  desc: string;
}

export function videoUrl(bvid: string): string {
  return `https://www.bilibili.com/video/${bvid}`;
}

export async function fetchBiliVideos(): Promise<BiliVideo[]> {
  const url = import.meta.env.BASE_URL + 'data/bili-videos.json';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`读取视频数据失败：HTTP ${res.status}`);
  }
  const data = (await res.json()) as { ok?: boolean; videos?: BiliVideo[] };
  if (!data.ok || !Array.isArray(data.videos)) {
    throw new Error('读取视频数据失败：返回格式不正确');
  }
  return data.videos;
}

/** 播放/弹幕计数：中文用「3.9万」贴B站习惯，英文用 k，其余原样 */
export function formatCount(n: number, lang: Lang): string {
  if (lang === 'en') {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  }
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);
}

/** 发布日期：秒级时间戳 → YYYY-MM-DD */
export function formatDate(seconds: number): string {
  const d = new Date(seconds * 1000);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
