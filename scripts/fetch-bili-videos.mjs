/* 抓取B站主页视频列表，输出精简 JSON 到 public/data/bili-videos.json
 *
 * 方案：B站对非浏览器 TLS 指纹风控严格（Node fetch 直接 412/-352），
 * 因此改用 Playwright 无头 Chromium：签名在 Node 计算，
 * 请求由页面上下文内的 fetch 发出（真实浏览器 TLS + Cookie）。
 *
 * 流程：
 *   1. 启动无头 Chromium，可选注入 BILI_COOKIE，访问空间页建立环境
 *   2. 页面上下文内 GET /x/web-interface/nav 取 wbi_img 的 img_key / sub_key
 *   3. 按固定混淆表重排得到 mixin_key，对查询参数（含 wts）签名得 w_rid
 *   4. 页面上下文内逐页请求 /x/space/wbi/arc/search 抓全量投稿
 *
 * 环境变量（可选）：
 *   BILI_MID    用户 id，默认 1937945301
 *   BILI_COOKIE 完整 Cookie（含 SESSDATA 登录态时最稳）
 *
 * 成功才覆盖 public/data/bili-videos.json，失败保留旧数据并以非 0 退出。
 */

import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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

const keyFrom = (url) => path.basename(new URL(url).pathname).replace(/\..*$/, '');

/* 把 "k=v; k2=v2" 形式的 Cookie 字符串转成 Playwright cookie 对象 */
function parseCookies(str) {
  return str
    .split(';')
    .map((pair) => pair.trim())
    .filter((pair) => /^[^=]+=.+$/.test(pair))
    .map((pair) => {
      const idx = pair.indexOf('=');
      return {
        name: pair.slice(0, idx),
        value: pair.slice(idx + 1),
        domain: '.bilibili.com',
        path: '/'
      };
    });
}

async function main() {
  const browser = await chromium.launch({
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    userAgent: UA,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    extraHTTPHeaders: { 'Accept-Language': 'zh-CN,zh;q=0.9' }
  });
  if (COOKIE) {
    await context.addCookies(parseCookies(COOKIE));
  }

  const page = await context.newPage();

  /* 访问空间页建立 Cookie 环境与请求来源 */
  await page.goto(`https://space.bilibili.com/${MID}/video`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(3000);

  /* 页面上下文内取 wbi key（自带完整 Cookie，不会被风控） */
  const nav = await page.evaluate(async () => {
    const res = await fetch('https://api.bilibili.com/x/web-interface/nav', {
      credentials: 'include'
    });
    return res.json();
  });
  const wbi = nav?.data?.wbi_img;
  if (!wbi?.img_url || !wbi?.sub_url) {
    throw new Error('nav 接口未返回 wbi_img，响应码：' + (nav?.code ?? 'unknown'));
  }
  const mixin = mixinKey(keyFrom(wbi.img_url), keyFrom(wbi.sub_url));

  /* 签名在 Node 算好，请求从页面上下文发出（真实浏览器 TLS） */
  const fetchArcPage = async (pn) => {
    const params = { mid: MID, pn, ps: PAGE_SIZE, wts: Math.floor(Date.now() / 1000) };
    const { query, wRid } = signQuery(params, mixin);
    const data = await page.evaluate(async (url) => {
      const res = await fetch(url, { credentials: 'include' });
      return res.json();
    }, `https://api.bilibili.com/x/space/wbi/arc/search?${query}&w_rid=${wRid}`);

    if (data.code !== 0) {
      throw new Error(`空间接口返回错误 code=${data.code} message=${data.message ?? ''}`);
    }
    const list = data?.data?.list?.vlist;
    if (!Array.isArray(list)) {
      throw new Error('空间接口返回结构缺少 data.list.vlist');
    }
    return { list, total: Number(data?.data?.page?.count) || list.length };
  };

  /* 先取第一页拿 total，再抓剩余页 */
  const first = await fetchArcPage(1);
  const totalPages = Math.max(1, Math.ceil(first.total / PAGE_SIZE));
  const items = [...first.list];

  for (let pn = 2; pn <= totalPages; pn += 1) {
    await sleep(1000);
    const next = await fetchArcPage(pn);
    items.push(...next.list);
  }

  await browser.close();

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

  console.log(
    `已写入 ${path.relative(ROOT, OUT_FILE)}，共 ${payload.videos.length} 个视频（接口 total=${first.total}）`
  );
}

main().catch(async (err) => {
  console.error('抓取失败：', err?.message ?? err);
  process.exit(1);
});
