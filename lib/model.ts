export type Person = {
  id: string;
  name: string;
  municipality: string;
  department: string;
  role: string;
  avatar: string;
  bio: string;
  fields: string[];
};
export type Comment = { id: string; authorId: string; body: string };
export type Post = {
  id: string;
  authorId: string;
  body: string;
  tag?: string;
  time: string;
  likes: number;
  comments: Comment[];
  image?: string;
  visual?: string;
  packageId?: string;
  quote?: string;
};
export type State = {
  posts: Post[];
  liked: string[];
  saved: string[];
  following: string[];
  comments: Record<string, Comment[]>;
  reposted: string[];
};
export function createPost(
  body: string,
  image?: string,
  packageId?: string,
): Post | null {
  if (!body.trim() && !image) return null;
  return {
    id: crypto.randomUUID(),
    authorId: "me",
    body: body.trim(),
    image,
    packageId,
    time: "たった今",
    likes: 0,
    comments: [],
    tag: packageId ? "改善提案" : "知見を共有",
  };
}
export function searchPosts(
  posts: Post[],
  people: Person[],
  query: string,
): Post[] {
  const q = query.trim().toLocaleLowerCase();
  return posts.filter((p) => {
    const a = people.find((a) => a.id === p.authorId);
    return [p.body, p.tag, a?.name, a?.municipality, a?.department]
      .join(" ")
      .toLocaleLowerCase()
      .includes(q);
  });
}
export function assessDifferences(channel: string, review: string): string[] {
  return [
    channel === "paper"
      ? "紙申請を含むため、受付時にスキャン・転記確認を追加します。"
      : "オンライン申請の添付ファイルを、受付チェックリストに連携します。",
    review === "internal"
      ? "庁内で審査を行うため、福祉課の確認者・承認者を設定します。"
      : "外部審査を行うため、委託先への受け渡しと庁内承認の境界を確認します。",
  ];
}
export function restoreState(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    const strings = (x: unknown) =>
      Array.isArray(x) && x.every((v) => typeof v === "string");
    const comment = (c: any) =>
      c &&
      typeof c.id === "string" &&
      typeof c.authorId === "string" &&
      typeof c.body === "string";
    if (
      !s ||
      !Array.isArray(s.posts) ||
      !s.posts.every(
        (p: any) =>
          p &&
          typeof p.id === "string" &&
          typeof p.body === "string" &&
          typeof p.authorId === "string" &&
          typeof p.time === "string" &&
          typeof p.likes === "number" &&
          Number.isFinite(p.likes) &&
          ["tag", "quote", "image", "visual", "packageId"].every(
            (k) => p[k] === undefined || typeof p[k] === "string",
          ) &&
          Array.isArray(p.comments) &&
          p.comments.every(comment),
      ) ||
      !["liked", "saved", "following", "reposted"].every((k) =>
        strings(s[k]),
      ) ||
      !s.comments ||
      typeof s.comments !== "object" ||
      Array.isArray(s.comments) ||
      !Object.values(s.comments).every(
        (c) => Array.isArray(c) && c.every(comment),
      )
    )
      return null;
    return s as State;
  } catch {
    return null;
  }
}
