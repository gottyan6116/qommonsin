"use client";
import { useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Globe2,
  ArrowRight,
  ChevronDown,
  Send,
  ImagePlus,
  CalendarDays,
  FileText,
  ShieldCheck,
  Check,
  Quote,
  Flag,
  Sparkles,
  Users,
} from "lucide-react";
import { people, me, packages } from "@/lib/data";
import type { Post, State } from "@/lib/model";
import { Avatar, Empty, PackageIcon } from "./ui";
export type FeedActions = {
  profile: (id: string) => void;
  openPackage: (id: string) => void;
  toggle: (
    key: "liked" | "saved" | "following" | "reposted",
    id: string,
  ) => void;
  comment: (id: string, text: string) => void;
  compose: (text?: string, packageId?: string, quote?: string) => void;
  ai: (id?: string) => void;
  notify: (text: string) => void;
};
export function Composer({
  compose,
  event,
}: {
  compose: FeedActions["compose"];
  event: () => void;
}) {
  return (
    <section className="card composer">
      <div className="composer-row">
        <Avatar person={me} />
        <button className="composer-start" onClick={() => compose()}>
          いまの気づきや、課題を共有しませんか？
        </button>
      </div>
      <div className="composer-tools">
        <button onClick={() => compose()}>
          <ImagePlus size={20} className="mint" />
          写真
        </button>
        <button onClick={event}>
          <CalendarDays size={20} className="orange" />
          イベント
        </button>
        <button
          onClick={() =>
            compose(
              "【知見・事例の共有】\n取り組んだこと：\n工夫したこと：\n気づき・次の一歩：",
            )
          }
        >
          <FileText size={20} className="green" />
          知見・事例を共有
        </button>
      </div>
    </section>
  );
}
export function Feed({
  posts,
  state,
  actions,
  filter,
  setFilter,
}: {
  posts: Post[];
  state: State;
  actions: FeedActions;
  filter: string;
  setFilter: (s: string) => void;
}) {
  const [sort, setSort] = useState("recommended");
  const shown =
    filter === "following"
      ? posts.filter((p) => state.following.includes(p.authorId))
      : filter === "questions"
        ? posts.filter((p) => p.tag === "課題を相談")
        : filter === "cases"
          ? posts.filter((p) => p.tag === "実践事例")
          : posts;
  const sorted =
    sort === "popular" ? [...shown].sort((a, b) => b.likes - a.likes) : shown;
  return (
    <>
      <div className="feed-toolbar">
        <div className="feed-tabs">
          {[
            ["all", "すべて"],
            ["following", "フォロー中"],
            ["questions", "課題・相談"],
            ["cases", "実践事例"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="sort-label">
          <span className="sr-only">投稿の並び順</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recommended">おすすめ順</option>
            <option value="new">新しい順</option>
            <option value="popular">人気順</option>
          </select>
        </label>
      </div>
      {sorted.length ? (
        sorted.map((post) => (
          <PostCard key={post.id} post={post} state={state} actions={actions} />
        ))
      ) : (
        <section className="card">
          <Empty
            title="投稿が見つかりませんでした"
            description="検索条件を変えるか、ほかの職員をフォローしてみてください。"
          />
        </section>
      )}
      <p className="feed-end">
        ここまでの知恵が、次の一歩につながります。
        <br />
        すべて架空のデモ投稿です。
      </p>
    </>
  );
}
export function PostCard({
  post,
  state,
  actions,
}: {
  post: Post;
  state: State;
  actions: FeedActions;
}) {
  const person = people.find((p) => p.id === post.authorId) || me;
  const [commentsOpen, setCommentsOpen] = useState(post.id === "p1");
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [repostMenu, setRepostMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const comments = [...post.comments, ...(state.comments[post.id] || [])];
  const pkg = packages.find((p) => p.id === post.packageId);
  const liked = state.liked.includes(post.id),
    saved = state.saved.includes(post.id);
  return (
    <article className="card post" data-testid={"post-" + post.id}>
      {post.tag === "課題を相談" && (
        <div className="post-context">
          <MessageCircle size={13} />
          <span>現場の課題から、みんなで考える</span>
          <span className="unverified">未検証の相談・知見</span>
        </div>
      )}
      <div className="post-header">
        <button
          className="avatar-button"
          onClick={() => actions.profile(person.id)}
          aria-label={person.name + "のプロフィール"}
        >
          <Avatar person={person} />
        </button>
        <div className="author-meta">
          <button
            className="author-name"
            onClick={() => actions.profile(person.id)}
          >
            {person.name}
            {person.id === "official" && (
              <ShieldCheck size={15} className="green" />
            )}
            <span className="author-degree">
              {person.id === "official" ? "公式" : "· 自治体職員"}
            </span>
          </button>
          <div>
            {person.municipality}
            {person.department && " · " + person.department}
          </div>
          <div className="post-time">
            {post.time}
            <span>·</span>
            <Globe2 size={11} />
            <span>職員コミュニティ</span>
          </div>
        </div>
        {person.id !== "me" && person.id !== "official" && (
          <button
            className={
              "follow-inline " +
              (state.following.includes(person.id) ? "following" : "")
            }
            onClick={() => actions.toggle("following", person.id)}
          >
            {state.following.includes(person.id) ? (
              <Check size={15} />
            ) : (
              <span>＋</span>
            )}
            {state.following.includes(person.id) ? "フォロー中" : "フォロー"}
          </button>
        )}
        <div className="relative">
          <button
            className="icon-button"
            aria-label="投稿メニュー"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <MoreHorizontal size={21} />
          </button>
          {menu && (
            <>
              <button
                className="menu-dismiss"
                aria-label="メニューを閉じる"
                onClick={() => setMenu(false)}
              />
              <div className="dropdown">
                <button
                  onClick={() => {
                    actions.toggle("saved", post.id);
                    setMenu(false);
                  }}
                >
                  <Bookmark size={16} />
                  {saved ? "保存を解除" : "投稿を保存"}
                </button>
                <button
                  onClick={() => {
                    actions.ai(post.packageId);
                    setMenu(false);
                  }}
                >
                  <Sparkles size={16} />
                  QommonsAIに相談
                </button>
                <button
                  onClick={() => {
                    actions.notify("ご報告をデモ内で受け付けました");
                    setMenu(false);
                  }}
                >
                  <Flag size={16} />
                  運営に報告
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="post-content">
        <span
          className={
            "post-tag " +
            (post.tag === "課題を相談"
              ? "question"
              : post.tag === "実践事例"
                ? "case"
                : "")
          }
        >
          {post.tag || "知見を共有"}
        </span>
        <p
          className={
            "post-body " +
            (!expanded && post.body.length > 330 ? "clamped" : "")
          }
        >
          {post.body}
        </p>
        {post.body.length > 330 && !expanded && (
          <button className="muted-link" onClick={() => setExpanded(true)}>
            続きを読む
          </button>
        )}
        {post.quote && (
          <blockquote className="quoted-post">{post.quote}</blockquote>
        )}
      </div>
      {post.visual && <PostVisual type={post.visual} />}
      {post.image && (
        <img
          className="post-image"
          src={post.image}
          alt="投稿に添付された画像"
        />
      )}
      {pkg && (
        <button
          className="related-package"
          onClick={() => actions.openPackage(pkg.id)}
        >
          <PackageIcon name={pkg.icon} size={20} />
          <span>
            <small>関連AXパッケージ</small>
            <strong>{pkg.title}</strong>
            <span className="package-sub">
              {pkg.status === "approved" ? (
                <>
                  <ShieldCheck size={12} />
                  責任者承認済み
                </>
              ) : (
                <>検証中</>
              )}
              <span>·</span>構想デモ
            </span>
          </span>
          <ArrowRight size={19} />
        </button>
      )}
      <div className="reaction-summary">
        <button
          onClick={() => actions.toggle("liked", post.id)}
          aria-label="いいねした職員に共感する"
        >
          <span className="reaction-bubble">
            <ThumbsUp size={10} fill="currentColor" />
          </span>
          <span className="reaction-bubble heart">♥</span>
          {post.likes + (liked ? 1 : 0)}人が共感
        </button>
        <button onClick={() => setCommentsOpen(!commentsOpen)}>
          {comments.length}件のコメント
          {state.reposted.includes(post.id) ? " · 1件のリポスト" : ""}
        </button>
      </div>
      <div className="post-actions">
        <button
          className={liked ? "selected" : ""}
          onClick={() => actions.toggle("liked", post.id)}
          aria-pressed={liked}
        >
          <ThumbsUp size={18} />
          いいね
        </button>
        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          aria-expanded={commentsOpen}
        >
          <MessageCircle size={18} />
          コメント
        </button>
        <div className="relative">
          <button
            className={state.reposted.includes(post.id) ? "selected" : ""}
            onClick={() => setRepostMenu(!repostMenu)}
            aria-expanded={repostMenu}
          >
            <Repeat2 size={18} />
            リポスト
          </button>
          {repostMenu && (
            <>
              <button
                className="menu-dismiss"
                aria-label="リポストメニューを閉じる"
                onClick={() => setRepostMenu(false)}
              />
              <div className="dropdown repost-menu">
                <button
                  onClick={() => {
                    actions.toggle("reposted", post.id);
                    setRepostMenu(false);
                  }}
                >
                  <Repeat2 size={16} />
                  {state.reposted.includes(post.id)
                    ? "リポストを取り消す"
                    : "そのままリポスト"}
                </button>
                <button
                  onClick={() => {
                    actions.compose(
                      "",
                      post.packageId,
                      person.name + "：" + post.body,
                    );
                    setRepostMenu(false);
                  }}
                >
                  <Quote size={16} />
                  引用して投稿
                </button>
              </div>
            </>
          )}
        </div>
        <button
          className={saved ? "selected" : ""}
          onClick={() => actions.toggle("saved", post.id)}
          aria-pressed={saved}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          保存
        </button>
      </div>
      {commentsOpen && (
        <div className="comments">
          {comments.map((c) => {
            const a = people.find((p) => p.id === c.authorId) || me;
            return (
              <div className="comment" key={c.id}>
                <button
                  className="avatar-button"
                  onClick={() => actions.profile(a.id)}
                >
                  <Avatar person={a} size={32} />
                </button>
                <div className="comment-bubble">
                  <button
                    className="author-name"
                    onClick={() => actions.profile(a.id)}
                  >
                    {a.name}
                    <span className="comment-affiliation">
                      {a.municipality} · {a.department}
                    </span>
                  </button>
                  <p>{c.body}</p>
                </div>
              </div>
            );
          })}
          <form
            className="comment-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) {
                actions.comment(post.id, text.trim());
                setText("");
              }
            }}
          >
            <Avatar person={me} size={32} />
            <div>
              <input
                aria-label="コメントを入力"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="知恵や経験をコメントする…"
                maxLength={2000}
              />
              <button aria-label="コメントを送信" disabled={!text.trim()}>
                <Send size={17} />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
function PostVisual({ type }: { type: string }) {
  if (type === "workshop")
    return (
      <div className="workshop-photo">
        <img
          src="/workshop.jpg"
          alt="業務改善ワークショップをイメージした参考写真"
        />
        <div>
          <span>現場の対話から、業務は変わる。</span>
          <small>業務の見える化ワークショップ · イメージ写真</small>
        </div>
      </div>
    );
  if (type === "tips")
    return (
      <div className="tips-visual">
        <div className="tips-kicker">
          <Sparkles size={16} /> QommonsAI TIPS <span>01</span>
        </div>
        <strong>
          いつもの仕事に、
          <br />
          小さなAIの工夫を。
        </strong>
        <div className="tips-bottom">
          <span>目的 ＋ 相手 ＋ アウトプット</span>
          <span className="tips-ai">
            Q<span>AI</span>
          </span>
        </div>
      </div>
    );
  if (type === "event")
    return (
      <div className="event-visual">
        <span>QOMMONS COMMUNITY SESSION</span>
        <strong>現場からはじめる、行政AX。</strong>
        <div>
          <b>
            11.12 <small>THU</small>
          </b>
          <span>
            12:10–12:50
            <br />
            オンライン / デモイベント
          </span>
        </div>
      </div>
    );
  return (
    <div className="publicity-visual">
      <MegaphoneGraphic />
      <div>
        <small>住民に届く、ことばを考える</small>
        <strong>
          伝わる広報は、
          <br />
          相手の目線から。
        </strong>
      </div>
    </div>
  );
}
function MegaphoneGraphic() {
  return (
    <div className="publicity-symbol">
      <Users size={54} />
    </div>
  );
}
