/* 抓取B站主页视频列表，输出精简 JSON 到 public/data/bili-videos.json
 *
 * 流程：
 *   1. GET /x/web-interface/nav 取未登录 wbi_img 的 img_key / sub_key
 *   2. 按固定混淆表重排得到 mixin_key
 *   3. 对查询参数（含 wts）排序、编码后拼上 mixin_key 做 md5 得 w_rid
 *   4. 带 UA / Referer 请求 /x/space/wbi/arc/search 拿视频列表
 *
 * 环境变量（可选）：
 *   BILI_MID    用户 id，默认 1937945301
 *   BILI_COOKIE 完整 Cookie（含 buvid3 时可显著降低风控概率）
 *
 * 成功才覆盖 public/data/bili-videos.json，失败保留旧数据并以非 0 退出。
 */

import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'public', 'data', 'bili-videos.json');
const OUT_TMP = `${OUT_FILE}.tmp`;

const MID = (process.env.BILI_MID ?? '1937945301').trim();
const COOKIE = (process.env.BILI_COOKIE ?? '').trim();

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/* 每页 30 条；首响应带 total，可据此算总页数 */
const PAGE_SIZE = 30;

/* 相邻请求间的小间隔，降低风控概率 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slimVideo(item) {
  /* vlist 项是平铺结构：play 播放、video_review 弹幕；封面统一换成 https 避免混合内容 */
  return {
    bvid: item.bvid,
    title: item.title,
    pic: String(item.pic ?? '').replace(/^http:\/\//, 'https://'),
    length: item.length,
    play: item.play ?? 0,
    danmaku: item.video_review ?? 0,
    created: item.created,
    desc: item.description ?? ''
  };
}

async function fetchPage(page, mixin, cookie) {
  const params = {
    mid: MID,
    pn: page,
    ps: PAGE_SIZE,
    ...fingerprintParams(),
    wts: Math.floor(Date.now() / 1000)
  };
  const { query, wRid } = signQuery(params, mixin);

  const headers = {
    'User-Agent': UA,
    Referer: `https://space.bilibili.com/${MID}/`,
    Origin: 'https://space.bilibili.com',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9'
  };
  if (cookie) {
    headers.Cookie = cookie;
  }

  const data = await fetchJson(`https://api.bilibili.com/x/space/wbi/arc/search?${query}&w_rid=${wRid}`, headers);

  if (data.code !== 0) {
    throw new Error(`空间接口返回错误 code=${data.code} message=${data.message ?? ''}`);
  }
  const list = data?.data?.list?.vlist;
  if (!Array.isArray(list)) {
    throw new Error('空间接口返回结构缺少 data.list.vlist');
  }
  return { list, total: Number(data?.data?.page?.count) || list.length };
}

async function main() {
  const [mixin, cookie] = await Promise.all([getMixinKey(), getGuestCookies()]);

  /* 先取第一页拿 total，再抓剩余页；单页时只发一次请求 */
  const first = await fetchPage(1, mixin, cookie);
  const totalPages = Math.max(1, Math.ceil(first.total / PAGE_SIZE));
  const items = [...first.list];

  for (let page = 2; page <= totalPages; page += 1) {
    await sleep(1200);
    const next = await fetchPage(page, mixin, cookie);
    items.push(...next.list);
  }

  /* bvid 去重（接口偶发重复时保第一条） */
  const seen = new Set();
  const videos = [];
  for (const item of items) {
    if (item.bvid && !seen.has(item.bvid)) {
      seen.add(item.bvid);
      videos.push(slimVideo(item));
    }
  }

  const payload = {
    ok: true,
    updatedAt: new Date().toISOString(),
    mid: MID,
    videos
  };

  await mkdir(path.dirname(OUT_TMP), { recursive: true });
  await writeFile(OUT_TMP, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  await rename(OUT_TMP, OUT_FILE);

  console.log(`已写入 ${path.relative(ROOT, OUT_FILE)}，共 ${payload.videos.length} 个视频（接口 total=${first.total}）`);
}

/* wbi 固定混淆表（社区通用，来自B站前端 js） */
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
];

function mixinKey(imgKey, subKey) {
  const raw = imgKey + subKey;
  return MIXIN_KEY_ENC_TAB.map((i) => raw[i]).join('').slice(0, 32);
}

/* 参数值先剔除 !'()* 再编码，与B站前端行为保持一致 */
function signQuery(params, mixin) {
  const query = Object.keys(params)
    .sort()
    .map((key) => {
      const value = String(params[key]).replace(/[!'()*]/g, '');
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return { query, wRid: createHash('md5').update(query + mixin).digest('hex') };
}

/* 空间接口的设备指纹参数：格式像浏览器环境上报，值可以是随机构造。
   dm_img_str / dm_cover_img_str 是 base64(JSON 数组)，dm_img_inter 是 JSON 字符串 */
function randomWord(n) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < n; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function b64Json(list) {
  return Buffer.from(JSON.stringify(list), 'utf8').toString('base64');
}

function fingerprintParams() {
  return {
    dm_img_list: '[]',
    dm_img_str: b64Json([randomWord(2), randomWord(2)]),
    dm_cover_img_str: b64Json([randomWord(6), randomWord(8)]),
    dm_img_inter: JSON.stringify({
      ds: [],
      wh: [3858, 1467, 78],
      of: [348, 812, 78]
    })
  };
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function getMixinKey() {
  const nav = await fetchJson('https://api.bilibili.com/x/web-interface/nav', {
    'User-Agent': UA,
    Referer: 'https://www.bilibili.com/'
  });
  const wbi = nav?.data?.wbi_img;
  if (!wbi?.img_url || !wbi?.sub_url) {
    throw new Error('nav 接口未返回 wbi_img，响应码：' + (nav?.code ?? 'unknown'));
  }
  const keyFrom = (url) => path.basename(new URL(url).pathname).replace(/\..*$/, '');
  return mixinKey(keyFrom(wbi.img_url), keyFrom(wbi.sub_url));
}

/* 未提供 BILI_COOKIE 时先访问主站领游客 Cookie（buvid3 等），否则空间接口直接 412 */
async function getGuestCookies() {
  if (COOKIE) {
    return COOKIE;
  }
  const res = await fetch('https://www.bilibili.com/', {
    headers: { 'User-Agent': UA, Accept: 'text/html' }
  });
  const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  const pairs = setCookies
    .map((line) => line.split(';')[0])
    .filter((pair) => /^[^=]+=.+$/.test(pair));
  return pairs.join('; ');
}

main().catch((err) => {
  console.error('抓取失败：', err?.message ?? err);
  process.exit(1);
});
