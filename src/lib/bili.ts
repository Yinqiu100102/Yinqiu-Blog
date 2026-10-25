export interface BiliVideo {
  bvid: string;
  title: string;
  pic: string;
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

/** 发布日期：秒级时间戳 → YYYY-MM-DD */
export function formatDate(seconds: number): string {
  const d = new Date(seconds * 1000);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
