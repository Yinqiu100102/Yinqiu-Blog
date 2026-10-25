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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slimVideo(item) {
  return {
    bvid: item.bvid,
    title: item.title,
    pic: String(item.pic ?? '').replace(/^http:\/\//, 'https://'),
    created: item.created,
    desc: item.description ?? ''
  };
}

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

  const seen = new Map();
  let total = 0;

  {
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

    page.on('response', async (res) => {
      try {
        if (!res.url().includes('/arc/search')) {
          return;
        }
        const data = await res.json();
        if (data?.code !== 0) {
          return;
        }
        const list = data?.data?.list?.vlist ?? data?.data?.archives;
        if (!Array.isArray(list) || list.length === 0) {
          return;
        }
        total = Math.max(total, Number(data?.data?.page?.count) || list.length);
        for (const item of list) {
          if (item?.bvid && !seen.has(item.bvid)) {
            seen.set(item.bvid, item);
          }
        }
      } catch {}
    });

    await page.goto(`https://space.bilibili.com/${MID}/video`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const deadline = Date.now() + 45000;
    while (seen.size === 0 && Date.now() < deadline) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1200);
    }
    if (seen.size === 0) {
      throw new Error('空间页未发出视频列表请求，可能被风控拦截');
    }

    let idle = 0;
    while (seen.size < total && idle < 4) {
      const before = seen.size;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1600);
      if (seen.size === before) {
        idle += 1;
      } else {
        idle = 0;
      }
    }

    await browser.close();
  }

  const videos = [];
  for (const item of seen.values()) {
    if (item.is_self_view) {
      continue;
    }
    videos.push(slimVideo(item));
  }

  if (videos.length === 0) {
    throw new Error('抓取结果为空');
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
    `已写入 ${path.relative(ROOT, OUT_FILE)}，公开视频 ${payload.videos.length} 个（页面 total=${total}）`
  );
}

main().catch((err) => {
  console.error('抓取失败：', err?.message ?? err);
  process.exit(1);
});
