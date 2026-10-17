/* 文章列表数据。旧站目前只有一篇「关于我」，列表页与首页共用这份数据。 */
export interface PostTag {
  label: string;
  pin?: boolean;
}

export interface Post {
  /** 站内路径，用于跳转与 key */
  href: string;
  thumb: string;
  date: string;
  /** 中文 / 英文两套标题、摘要、标签与配图 alt */
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  altZh: string;
  altEn: string;
  tagsZh: PostTag[];
  tagsEn: PostTag[];
}

export const POSTS: Post[] = [
  {
    href: '/posts/about',
    thumb: import.meta.env.BASE_URL + 'images/Image_1764458904822.jpg',
    date: '2026-09-04',
    titleZh: '关于我',
    titleEn: 'About me',
    excerptZh: '网名白吟秋，B站我的世界 UP 主，也是 Ci OS 的作者——很高兴认识你。',
    excerptEn:
      "You can call me Yinqiu. I'm a Minecraft creator on Bilibili and the author of Ci OS — nice to meet you.",
    altZh: '关于我 配图',
    altEn: 'Illustration for About me',
    tagsZh: [{ label: '置顶', pin: true }, { label: '关于' }],
    tagsEn: [{ label: 'Pinned', pin: true }, { label: 'About' }]
  }
];

/* 搜索用的完整文本：中英两套都参与匹配，与旧站读 textContent 的行为一致 */
export function postSearchText(post: Post): string {
  return [
    post.titleZh,
    post.titleEn,
    post.excerptZh,
    post.excerptEn,
    ...post.tagsZh.map((tag) => tag.label),
    ...post.tagsEn.map((tag) => tag.label),
    post.date
  ].join(' ');
}