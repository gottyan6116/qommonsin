"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  Users,
  Layers3,
  Bell,
  Search,
  ChevronDown,
  Bookmark,
  CalendarDays,
  Building2,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Check,
  Eye,
  MessageCircle,
  Sparkles,
  Info,
  ShieldCheck,
  ImagePlus,
  X,
  Globe2,
  FileText,
  Send,
  Settings,
  Menu,
  MapPin,
  Briefcase,
  Link2,
  Clock3,
  Video,
  HelpCircle,
  Mail,
  ChevronRight,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { people, me, packages, initialState } from "@/lib/data";
import {
  createPost,
  searchPosts,
  restoreState,
  type State,
  type Post,
} from "@/lib/model";
import { Avatar, Dialog, Empty, DemoNotice, PackageIcon, TextLink } from "./ui";
import { Composer, Feed, PostCard, type FeedActions } from "./feed";
import { Repository, PackageDetail } from "./repository";
import AIPanel from "./ai-panel";
const KEY = "qommons-in-demo-v1";
type Draft = { text: string; packageId?: string; quote?: string };
export default function AppShell() {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState("home");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ai, setAi] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [read, setRead] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [joined, setJoined] = useState<string[]>(["dx", "ai"]);
  const [profileMenu, setProfileMenu] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  useEffect(() => {
    try {
      const stored = restoreState(localStorage.getItem(KEY));
      if (stored) setState(stored);
    } catch {}
    setReady(true);
    function change() {
      setRoute(decodeURIComponent(location.hash.slice(1)) || "home");
      window.scrollTo({ top: 0 });
    }
    change();
    window.addEventListener("hashchange", change);
    return () => {
      window.removeEventListener("hashchange", change);
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      notify(
        "保存容量が不足しています。今回の変更はこの画面を閉じるまで保持されます。",
      );
    }
  }, [state, ready, notify]);
  const navigate = useCallback(
    (next: string) => {
      if (next !== route) location.hash = next;
      else window.scrollTo({ top: 0, behavior: "smooth" });
      setProfileMenu(false);
    },
    [route],
  );
  const compose: FeedActions["compose"] = (text = "", packageId, quote) =>
    setDraft({ text, packageId, quote });
  const toggle: FeedActions["toggle"] = (key, id) => {
    setState((s) => ({
      ...s,
      [key]: s[key].includes(id)
        ? s[key].filter((x) => x !== id)
        : [...s[key], id],
    }));
    if (key === "reposted")
      notify(
        state.reposted.includes(id)
          ? "リポストを取り消しました"
          : "プロフィールのアクティビティにリポストしました",
      );
    if (key === "saved")
      notify(
        state.saved.includes(id)
          ? "保存を解除しました"
          : "保存済み項目に追加しました",
      );
  };
  const actions: FeedActions = {
    profile: (id) => navigate("profile/" + id),
    openPackage: (id) => navigate("package/" + id),
    toggle,
    comment: (id, text) =>
      setState((s) => ({
        ...s,
        comments: {
          ...s.comments,
          [id]: [
            ...(s.comments[id] || []),
            { id: crypto.randomUUID(), authorId: "me", body: text },
          ],
        },
      })),
    compose,
    ai: (id) => setAi(id || "benefit"),
    notify,
  };
  function post(
    text: string,
    image?: string,
    packageId?: string,
    quote?: string,
    tag?: string,
  ) {
    const p = createPost(text, image, packageId);
    if (!p) return;
    setState((s) => ({
      ...s,
      posts: [{ ...p, quote, tag: tag || p.tag }, ...s.posts],
    }));
    setDraft(null);
    setQuery("");
    setFilter("all");
    navigate("home");
    notify("投稿しました。あなたの知恵をコミュニティへ。");
  }
  const profileId = route.startsWith("profile/") ? route.split("/")[1] : "me";
  const currentPerson = people.find((p) => p.id === profileId) || me;
  const home = route === "home";
  const isPackage = route.startsWith("package/");
  const mainRoute = home
    ? "home"
    : isPackage || route === "repository"
      ? "repository"
      : route.startsWith("profile/")
        ? "profile"
        : route;
  const navs = [
    { id: "home", label: "ホーム", Icon: Home },
    { id: "network", label: "ネットワーク", Icon: Users },
    { id: "repository", label: "AXレポジトリ", Icon: Layers3 },
    { id: "notifications", label: "通知", Icon: Bell },
  ];
  const closeDraft = useCallback(() => setDraft(null), []);
  const closeModal = useCallback(() => setModal(null), []);
  const closeAi = useCallback(() => setAi(null), []);
  return (
    <>
      <div className="demo-bar">
        <span>
          Qommons IN <b>コンセプトデモ</b>
        </span>
        <span>架空の人物・自治体・実績を使用しています</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            aria-label="Qommons IN ホーム"
            onClick={() => {
              setQuery("");
              navigate("home");
            }}
          >
            <img src="/polimill-logo.png" alt="Polimill" />
            <span className="brand-divider" />
            <span className="brand-name">
              Qommons <b>IN</b>
              <small>行政の知恵を、つなぐ。</small>
            </span>
          </button>
          <label className="header-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (route !== "home") navigate("home");
              }}
              placeholder="投稿・職員・行政課題を検索"
              aria-label="フィードを検索"
            />
            {query && (
              <button aria-label="検索をクリア" onClick={() => setQuery("")}>
                <X size={14} />
              </button>
            )}
          </label>
          <nav className="top-nav" aria-label="メインナビゲーション">
            {navs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => {
                  navigate(id);
                  if (id === "notifications") setRead(true);
                }}
                className={mainRoute === id ? "active" : ""}
                aria-current={mainRoute === id ? "page" : undefined}
              >
                <span className="nav-icon">
                  <Icon size={22} strokeWidth={mainRoute === id ? 2.4 : 1.8} />
                  {id === "notifications" && !read && (
                    <i className="notification-dot" />
                  )}
                </span>
                <span>{label}</span>
              </button>
            ))}
            <div className="profile-nav relative">
              <button
                onClick={() => setProfileMenu(!profileMenu)}
                aria-expanded={profileMenu}
                className={mainRoute === "profile" ? "active" : ""}
              >
                <Avatar person={me} size={25} />
                <span>
                  プロフィール
                  <ChevronDown size={11} />
                </span>
              </button>
              {profileMenu && (
                <>
                  <button
                    className="menu-dismiss"
                    aria-label="プロフィールメニューを閉じる"
                    onClick={() => setProfileMenu(false)}
                  />
                  <div className="dropdown profile-dropdown">
                    <div>
                      <Avatar person={me} size={42} />
                      <strong>
                        {me.name}
                        <small>
                          {me.municipality} · {me.department}
                        </small>
                      </strong>
                    </div>
                    <button onClick={() => navigate("profile/me")}>
                      プロフィールを見る
                      <ArrowRight size={15} />
                    </button>
                    <button onClick={() => navigate("saved")}>
                      <Bookmark size={16} />
                      保存済み項目
                    </button>
                    <button
                      onClick={() => {
                        setModal("events");
                        setProfileMenu(false);
                      }}
                    >
                      <CalendarDays size={16} />
                      イベント・勉強会
                    </button>
                    <button
                      onClick={() => {
                        setModal("communities");
                        setProfileMenu(false);
                      }}
                    >
                      <Users size={16} />
                      参加コミュニティ
                    </button>
                    <button
                      onClick={() => {
                        setModal("settings");
                        setProfileMenu(false);
                      }}
                    >
                      <Settings size={16} />
                      デモの設定
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main
        className={
          "main-layout " +
          (!home &&
          !isPackage &&
          route !== "saved" &&
          !route.startsWith("profile/")
            ? "full-center"
            : "")
        }
      >
        <aside className="left-sidebar">
          <section className="card profile-card">
            <button
              className="profile-cover"
              onClick={() => navigate("profile/me")}
              aria-label="自分のプロフィール"
            >
              <span />
              <span />
            </button>
            <div className="profile-card-body">
              <button
                className="profile-avatar"
                onClick={() => navigate("profile/me")}
              >
                <Avatar person={me} size={65} />
              </button>
              <button
                className="profile-title"
                onClick={() => navigate("profile/me")}
              >
                {me.name}
                <ShieldCheck size={15} />
              </button>
              <p>
                {me.municipality} · {me.department}
              </p>
              <small>現場の知恵を、次の自治体へ。</small>
              <div className="municipality">
                <Building2 size={17} />
                {me.municipality}
              </div>
            </div>
            <div className="profile-stats">
              <button onClick={() => setModal("views")}>
                <span>プロフィール閲覧</span>
                <strong>28</strong>
              </button>
              <button onClick={() => navigate("network")}>
                <span>つながっている職員</span>
                <strong>{126 + state.following.length}</strong>
              </button>
            </div>
          </section>
          <section className="card personal-menu">
            {[
              {
                label: "保存済み項目",
                Icon: Bookmark,
                action: () => navigate("saved"),
                count: state.saved.length,
                active: route === "saved",
              },
              {
                label: "参加コミュニティ",
                Icon: Users,
                action: () => setModal("communities"),
                count: joined.length,
              },
              {
                label: "イベント・勉強会",
                Icon: CalendarDays,
                action: () => setModal("events"),
                count: undefined,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={item.active ? "active" : ""}
              >
                <item.Icon size={17} />
                <span>{item.label}</span>
                {item.count !== undefined && <small>{item.count}</small>}
              </button>
            ))}
          </section>
          <section className="card left-ai">
            <div className="left-ai-icon">
              <Sparkles size={21} />
            </div>
            <h3>
              その課題、
              <br />
              知恵を借りてみませんか。
            </h3>
            <p>
              全国の業務の型から、
              <br />
              あなたの実務にヒントを。
            </p>
            <button onClick={() => setAi("benefit")}>
              QommonsAIに相談
              <ArrowUpRight size={15} />
            </button>
            <span>シナリオデモ</span>
          </section>
          <div className="sidebar-footer">
            <span>職員の対話から、行政の未来へ。</span>
            <strong>
              Qommons IN <small>by Polimill</small>
            </strong>
            <div>
              <button onClick={() => setModal("about")}>
                このデモについて
              </button>
              <span>·</span>
              <button onClick={() => setModal("help")}>ヘルプ</button>
            </div>
            <small>© 2026 Polimill Inc. Concept Demo</small>
          </div>
        </aside>
        <div className="center-column">
          {home && (
            <>
              {query ? (
                <div className="search-result-label">
                  <Search size={18} />
                  <strong>「{query}」の検索結果</strong>
                  <span>
                    {searchPosts(state.posts, people, query).length}件
                  </span>
                </div>
              ) : (
                <div className="welcome-strip">
                  <span>
                    <span className="live-dot" />
                    つながる知恵が、行政を変えていく。
                  </span>
                  <button onClick={() => setModal("about")}>
                    Qommons INとは
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              )}
              <Composer compose={compose} event={() => setModal("events")} />
              <Feed
                posts={searchPosts(state.posts, people, query)}
                state={state}
                actions={actions}
                filter={filter}
                setFilter={setFilter}
              />
            </>
          )}
          {route === "repository" && (
            <Repository openPackage={actions.openPackage} />
          )}
          {isPackage && (
            <PackageDetail
              key={route}
              id={route.split("/")[1]}
              state={state}
              actions={actions}
              back={() => navigate("repository")}
            />
          )}
          {route.startsWith("profile/") && (
            <>
              <section className="card full-profile">
                <div className="full-profile-cover">
                  <span>行政の知恵を、つなぐ。</span>
                  <div />
                </div>
                <div className="full-profile-body">
                  <Avatar person={currentPerson} size={100} />
                  <div className="full-profile-name">
                    <div>
                      <h1>
                        {currentPerson.name}
                        {currentPerson.id === "official" && (
                          <ShieldCheck size={21} />
                        )}
                      </h1>
                      <p>
                        {currentPerson.municipality} ·{" "}
                        {currentPerson.department || currentPerson.role}
                      </p>
                      <small>
                        <MapPin size={13} />
                        全国の自治体職員コミュニティ
                      </small>
                    </div>
                    {currentPerson.id === "me" ? (
                      <button
                        className="button secondary small"
                        onClick={() => setModal("editProfile")}
                      >
                        プロフィールを確認
                      </button>
                    ) : (
                      <button
                        className={
                          "button " +
                          (state.following.includes(currentPerson.id)
                            ? "secondary"
                            : "primary")
                        }
                        onClick={() => toggle("following", currentPerson.id)}
                      >
                        {state.following.includes(currentPerson.id) ? (
                          <Check size={16} />
                        ) : (
                          <Plus size={16} />
                        )}{" "}
                        {state.following.includes(currentPerson.id)
                          ? "フォロー中"
                          : "フォローする"}
                      </button>
                    )}
                  </div>
                  <p className="profile-bio">{currentPerson.bio}</p>
                  <div className="profile-interest">
                    {currentPerson.fields.map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setQuery(f);
                          navigate("home");
                        }}
                      >
                        #{f}
                      </button>
                    ))}
                  </div>
                  <div className="profile-demo-info">
                    <ShieldCheck size={14} />
                    提案用に作成した架空のプロフィールです
                  </div>
                </div>
              </section>
              <section className="card section-pad">
                <div className="section-title">
                  <Layers3 size={19} />
                  <h2>関連するAXパッケージ</h2>
                </div>
                <div className="profile-packages">
                  {packages
                    .filter((p) =>
                      state.posts.some(
                        (post) =>
                          post.authorId === currentPerson.id &&
                          post.packageId === p.id,
                      ),
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => actions.openPackage(p.id)}
                      >
                        <PackageIcon name={p.icon} size={18} />
                        <span>{p.title}</span>
                        <ArrowRight size={17} />
                      </button>
                    ))}
                  {!state.posts.some(
                    (p) => p.authorId === currentPerson.id && p.packageId,
                  ) && (
                    <p className="muted">
                      これから、知恵と業務の型をつないでいきます。
                    </p>
                  )}
                </div>
              </section>
              <h2 className="subheading">アクティビティ・共有した知見</h2>
              {state.posts
                .filter(
                  (p) =>
                    p.authorId === currentPerson.id ||
                    (currentPerson.id === "me" &&
                      state.reposted.includes(p.id)),
                )
                .map((p) => (
                  <div key={p.id}>
                    {p.authorId !== "me" && currentPerson.id === "me" && (
                      <div className="reposted-label">
                        高橋 直樹さんがリポストしました
                      </div>
                    )}
                    <PostCard post={p} state={state} actions={actions} />
                  </div>
                ))}
            </>
          )}
          {route === "saved" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">YOUR COLLECTION</div>
                <h1>保存済み項目</h1>
                <p>あとで読みたい知見を、ここに。</p>
              </div>
              {state.posts
                .filter((p) => state.saved.includes(p.id))
                .map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    state={state}
                    actions={actions}
                  />
                ))}
              {!state.saved.length && (
                <section className="card">
                  <Empty
                    title="気になる知見を保存しましょう"
                    description="投稿の「保存」から、いつでも振り返れる自分のコレクションに。"
                  >
                    <button
                      className="button primary"
                      onClick={() => navigate("home")}
                    >
                      フィードを見る
                    </button>
                  </Empty>
                </section>
              )}
            </>
          )}
          {route === "network" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">YOUR COMMUNITY</div>
                <h1>知恵が広がる、つながりを。</h1>
                <p>同じ課題に向き合う職員と、自治体の枠を超えて。</p>
              </div>
              <section className="card section-pad">
                <div className="section-title">
                  <Users size={20} />
                  <h2>おすすめの職員</h2>
                  <span>{state.following.length}人をフォロー中</span>
                </div>
                <div className="people-grid">
                  {people
                    .filter((p) => p.id !== "me")
                    .map((p) => (
                      <div className="person-card" key={p.id}>
                        <button
                          className="avatar-button"
                          onClick={() => actions.profile(p.id)}
                        >
                          <Avatar person={p} size={64} />
                        </button>
                        <button
                          className="author-name"
                          onClick={() => actions.profile(p.id)}
                        >
                          {p.name}
                        </button>
                        <p>
                          {p.municipality}
                          <br />
                          {p.department || p.role}
                        </p>
                        <small>{p.fields.slice(0, 2).join(" · ")}</small>
                        <button
                          className={
                            "button small " +
                            (state.following.includes(p.id)
                              ? "secondary"
                              : "primary")
                          }
                          onClick={() => toggle("following", p.id)}
                        >
                          {state.following.includes(p.id) ? (
                            <Check size={15} />
                          ) : (
                            <Plus size={15} />
                          )}{" "}
                          {state.following.includes(p.id)
                            ? "フォロー中"
                            : "フォローする"}
                        </button>
                      </div>
                    ))}
                </div>
              </section>
              <CommunityList
                joined={joined}
                setJoined={setJoined}
                notify={notify}
              />
            </>
          )}
          {route === "notifications" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">NOTIFICATIONS</div>
                <h1>あなたへのお知らせ</h1>
                <p>対話の続きや、新しい知恵をチェック。</p>
              </div>
              <section className="card notifications">
                {[
                  {
                    person: "sato",
                    title:
                      "佐藤 健太さんが、給付金申請の相談にコメントしました。",
                    body: "受付時の確認項目を統一し、不備の種類ごとに…",
                    time: "20分前",
                    next: "home",
                  },
                  {
                    person: "official",
                    title: "新しいAXパッケージのサンプルを公開しました。",
                    body: "給付金申請受付・審査 v1.2 · 構想デモ",
                    time: "1時間前",
                    next: "package/benefit",
                  },
                  {
                    person: "official",
                    title: "オンライン勉強会「現場からはじめる行政AX」",
                    body: "11月12日（木）12:10〜12:50 · デモイベント",
                    time: "2時間前",
                    next: "events",
                  },
                ].map((n, i) => (
                  <button
                    className="notification-item"
                    key={i}
                    onClick={() =>
                      n.next === "events"
                        ? setModal("events")
                        : navigate(n.next)
                    }
                  >
                    <Avatar person={people.find((p) => p.id === n.person)!} />
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.body}</p>
                      <small>{n.time}</small>
                    </div>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </section>
            </>
          )}
          {![
            "home",
            "repository",
            "saved",
            "network",
            "notifications",
          ].includes(route) &&
            !isPackage &&
            !route.startsWith("profile/") && (
              <section className="card">
                <Empty title="このページは見つかりませんでした">
                  <button
                    className="button primary"
                    onClick={() => navigate("home")}
                  >
                    ホームに戻る
                  </button>
                </Empty>
              </section>
            )}
        </div>
        <aside className="right-sidebar">
          <section className="card topics-card">
            <div className="rail-heading">
              <h2>注目の行政課題</h2>
              <Info size={15} />
            </div>
            <p className="rail-subtitle">現場の声から、次の一歩へ</p>
            {[
              {
                name: "給付金申請の不備確認",
                meta: "福祉・子育て",
                q: "給付金",
              },
              {
                name: "生成AIの庁内活用を進めるには",
                meta: "行政DX・AX",
                q: "AI",
              },
              { name: "窓口業務の「見える化」", meta: "窓口改革", q: "窓口" },
            ].map((t, i) => (
              <button
                className="topic-row"
                key={t.name}
                onClick={() => {
                  setQuery(t.q);
                  setFilter("all");
                  navigate("home");
                }}
              >
                <span className="topic-dot" />
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.meta} · コミュニティで話題</small>
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
            <TextLink
              onClick={() => {
                setQuery("");
                setFilter("questions");
                navigate("home");
              }}
            >
              課題・相談をすべて見る
            </TextLink>
          </section>
          <section className="card popular-card">
            <div className="rail-heading">
              <h2>注目のAXパッケージ</h2>
              <Layers3 size={17} />
            </div>
            <span className="rail-concept">2027年4月公開予定 · 構想デモ</span>
            {packages.slice(0, 3).map((p, i) => (
              <button
                className="popular-row"
                key={p.id}
                onClick={() => actions.openPackage(p.id)}
              >
                <span className="rank">0{i + 1}</span>
                <div>
                  <strong>{p.title}</strong>
                  <span>
                    <ShieldCheck size={11} />
                    責任者承認済み<small>v{p.version}</small>
                  </span>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
            <TextLink onClick={() => navigate("repository")}>
              業務の型を探す
            </TextLink>
          </section>
          <section className="card recommendations">
            <div className="rail-heading">
              <h2>つながりを広げよう</h2>
              <Users size={17} />
            </div>
            {people
              .filter((p) => ["sato", "suzuki", "official"].includes(p.id))
              .map((p) => (
                <div className="recommendation" key={p.id}>
                  <button
                    className="avatar-button"
                    onClick={() => actions.profile(p.id)}
                  >
                    <Avatar person={p} size={39} />
                  </button>
                  <div>
                    <button
                      className="author-name"
                      onClick={() => actions.profile(p.id)}
                    >
                      {p.name}
                      {p.id === "official" && <ShieldCheck size={13} />}
                    </button>
                    <p>
                      {p.municipality}
                      {p.department && " · " + p.department}
                    </p>
                    <button
                      className={
                        "follow-pill " +
                        (state.following.includes(p.id) ? "following" : "")
                      }
                      onClick={() => toggle("following", p.id)}
                    >
                      {state.following.includes(p.id) ? (
                        <Check size={14} />
                      ) : (
                        <Plus size={14} />
                      )}{" "}
                      {state.following.includes(p.id)
                        ? "フォロー中"
                        : "フォロー"}
                    </button>
                  </div>
                </div>
              ))}
            <TextLink onClick={() => navigate("network")}>
              おすすめをすべて見る
            </TextLink>
          </section>
          <section className="card event-card">
            <div className="event-date">
              <span>NOV</span>
              <strong>12</strong>
            </div>
            <div>
              <span className="event-online">
                <Video size={12} />
                オンライン勉強会
              </span>
              <h3>現場からはじめる行政AX</h3>
              <p>11月12日（木）12:10–12:50</p>
              <button onClick={() => setModal("events")}>
                詳細を見る
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
          <DemoNotice />
        </aside>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button aria-label="通知を閉じる" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {draft && (
        <ComposeDialog
          draft={draft}
          onClose={closeDraft}
          onPost={post}
          notify={notify}
        />
      )}
      {ai && (
        <AIPanel
          key={ai}
          id={ai}
          onClose={closeAi}
          onPackage={(id) => {
            setAi(null);
            navigate("package/" + id);
          }}
          onImprove={(text, id) => {
            setAi(null);
            navigate("home");
            compose(text, id);
          }}
        />
      )}
      {modal && (
        <Dialog title={modalTitle(modal)} onClose={closeModal}>
          {modal === "events" && (
            <div className="modal-content">
              <div className="event-detail-hero">
                <span>QOMMONS COMMUNITY SESSION</span>
                <h3>現場からはじめる行政AX</h3>
                <p>申請受付と不備確認を、みんなで考える。</p>
              </div>
              <div className="event-info">
                <p>
                  <CalendarDays size={17} />
                  2026年11月12日（木）12:10〜12:50
                </p>
                <p>
                  <Video size={17} />
                  オンライン開催 · 参加無料
                </p>
                <p>
                  <Users size={17} />
                  対象：自治体職員 / 初めての方も歓迎
                </p>
              </div>
              <p>
                他自治体の取り組みをヒントに、日々の業務を見直す40分間。業務の見える化と、QommonsAIを使った差分確認を体験します。
              </p>
              <div className="demo-callout">
                架空のデモイベントです。実際の参加登録・外部送信は行いません。
              </div>
              <button
                className={"button " + (registered ? "secondary" : "primary")}
                onClick={() => {
                  setRegistered(!registered);
                  notify(
                    registered
                      ? "デモの参加登録を解除しました"
                      : "デモの参加登録が完了しました",
                  );
                }}
              >
                {registered ? <Check size={17} /> : <Plus size={17} />}{" "}
                {registered
                  ? "参加予定 · 登録を取り消す"
                  : "参加登録する（デモ）"}
              </button>
            </div>
          )}
          {modal === "communities" && (
            <div className="modal-content">
              <CommunityList
                joined={joined}
                setJoined={setJoined}
                notify={notify}
              />
            </div>
          )}
          {modal === "views" && (
            <div className="modal-content">
              <div className="metric-number">
                28<small>過去7日間のプロフィール閲覧（架空）</small>
              </div>
              <p>
                あなたの共有した知見に、ほかの自治体の職員が関心を寄せています。
              </p>
              {people.slice(1, 4).map((p) => (
                <button
                  className="viewer-row"
                  key={p.id}
                  onClick={() => {
                    setModal(null);
                    actions.profile(p.id);
                  }}
                >
                  <Avatar person={p} size={39} />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.municipality} · {p.department}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
          )}
          {modal === "settings" && (
            <div className="modal-content">
              <h3>データの保存先</h3>
              <p>
                投稿・コメント・いいね・保存・フォローは、このブラウザ内に保存されます。別の端末への同期は行いません。
              </p>
              <div className="demo-callout">
                初期化すると、このブラウザで追加した投稿などが削除されます。
              </div>
              <button
                className="button danger"
                onClick={() => setModal("resetConfirm")}
              >
                デモデータを初期化する
              </button>
            </div>
          )}
          {modal === "resetConfirm" && (
            <div className="modal-content">
              <p>
                追加した投稿・画像・コメント、いいね、保存、フォローを初期状態に戻します。
              </p>
              <div className="modal-buttons">
                <button
                  className="button secondary"
                  onClick={() => setModal("settings")}
                >
                  戻る
                </button>
                <button
                  className="button danger"
                  onClick={() => {
                    setState(initialState);
                    setRegistered(false);
                    setJoined([]);
                    setModal(null);
                    setQuery("");
                    navigate("home");
                    notify("初期状態に戻しました");
                  }}
                >
                  初期化する
                </button>
              </div>
            </div>
          )}
          {modal === "editProfile" && (
            <div className="modal-content">
              <Avatar person={me} size={72} />
              <h3>{me.name}</h3>
              <p>
                {me.municipality} · {me.department} · {me.role}
              </p>
              <p>{me.bio}</p>
              <div className="demo-callout">
                このプロフィールは提案用デモの固定サンプルです。職員の投稿・知見の共有を体験できます。
              </div>
              <button
                className="button primary"
                onClick={() => {
                  setModal(null);
                  compose();
                }}
              >
                知見を共有する
              </button>
            </div>
          )}
          {(modal === "about" || modal === "help") && (
            <div className="modal-content">
              <div className="eyebrow">QOMMONS IN / CONCEPT DEMO</div>
              <h3>一つの自治体の知恵を、全国の力に。</h3>
              <p>
                自治体職員の交流から生まれた知見を、検証・承認を経て「業務の型」に。QommonsAIによって自庁での活用を支援し、改善をコミュニティに還元します。
              </p>
              <ol className="demo-steps">
                <li>
                  田中 美咲さんの給付金相談と、佐藤 健太さんのコメントを見る
                </li>
                <li>「関連AXパッケージ」を開き、業務フローを確認</li>
                <li>「この型を使ってみる」から、自庁との差分を確認</li>
                <li>「改善案を投稿する」で、気づきをコミュニティに共有</li>
              </ol>
              <div className="demo-callout">
                人物・自治体・数値・承認状態はすべて架空です。AIは定義済みシナリオです。全国行政AXレポジトリは2027年4月公開予定の構想として表現しています。
              </div>
              <button
                className="button primary"
                onClick={() => {
                  setModal(null);
                  setQuery("");
                  setFilter("all");
                  navigate("home");
                }}
              >
                ホームから体験する
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}
function modalTitle(id: string) {
  return (
    (
      {
        events: "イベント・勉強会",
        communities: "参加コミュニティ",
        views: "プロフィール閲覧",
        settings: "デモの設定",
        resetConfirm: "デモデータを初期化",
        editProfile: "プロフィール",
        about: "Qommons INについて",
        help: "90秒のデモガイド",
      } as Record<string, string>
    )[id] || "Qommons IN"
  );
}
function CommunityList({
  joined,
  setJoined,
  notify,
}: {
  joined: string[];
  setJoined: (s: string[]) => void;
  notify: (s: string) => void;
}) {
  const communities = [
    {
      id: "dx",
      title: "行政DX・AX 実践コミュニティ",
      description: "現場からはじめる業務改善を、ともに。",
      count: "128",
    },
    {
      id: "welfare",
      title: "福祉・給付金実務ラボ",
      description: "給付金の受付・審査の知恵を持ち寄る。",
      count: "86",
    },
    {
      id: "ai",
      title: "QommonsAI 活用研究会",
      description: "小さく試し、学びを共有する職員の集まり。",
      count: "204",
    },
  ];
  return (
    <section className="community-list">
      <h2>
        <Users size={19} />
        おすすめのコミュニティ
      </h2>
      <p>参加人数は架空のデモデータです。</p>
      {communities.map((c) => (
        <div className="community-row" key={c.id}>
          <span className="community-icon">
            <Users size={23} />
          </span>
          <div>
            <strong>{c.title}</strong>
            <p>{c.description}</p>
            <small>{c.count}人の職員が参加 · デモ</small>
          </div>
          <button
            className={
              "button small " +
              (joined.includes(c.id) ? "secondary" : "primary")
            }
            onClick={() => {
              setJoined(
                joined.includes(c.id)
                  ? joined.filter((x) => x !== c.id)
                  : [...joined, c.id],
              );
              notify(
                joined.includes(c.id)
                  ? "コミュニティへの参加を解除しました"
                  : "コミュニティに参加しました（デモ）",
              );
            }}
          >
            {joined.includes(c.id) ? "参加中" : "参加する"}
          </button>
        </div>
      ))}
    </section>
  );
}
function ComposeDialog({
  draft,
  onClose,
  onPost,
  notify,
}: {
  draft: Draft;
  onClose: () => void;
  onPost: (
    text: string,
    image?: string,
    packageId?: string,
    quote?: string,
    tag?: string,
  ) => void;
  notify: (s: string) => void;
}) {
  const [text, setText] = useState(draft.text);
  const [image, setImage] = useState<string>();
  const [tag, setTag] = useState(draft.packageId ? "改善提案" : "知見を共有");
  const [packageId, setPackageId] = useState(draft.packageId || "");
  const input = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      notify("JPEG・PNG・WebP・GIFの画像を選んでください");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify("画像は2MB以下で添付してください");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setLoading(false);
    };
    reader.onerror = () => {
      setLoading(false);
      notify("画像を読み込めませんでした");
    };
    reader.readAsDataURL(file);
  }
  return (
    <Dialog title="知恵・気づきを共有する" onClose={onClose}>
      <div className="compose-dialog-body">
        <div className="compose-author">
          <Avatar person={me} size={48} />
          <div>
            <strong>{me.name}</strong>
            <span>
              {me.municipality} · {me.department}
            </span>
            <small>
              <Globe2 size={12} />
              職員コミュニティに公開
            </small>
          </div>
          <select
            aria-label="投稿の種類"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            {["知見を共有", "課題を相談", "実践事例", "改善提案"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <textarea
          autoFocus
          aria-label="投稿本文"
          placeholder="いまの課題や、実務で役立った工夫を共有しましょう。"
          maxLength={6000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {draft.quote && (
          <blockquote className="quoted-post">{draft.quote}</blockquote>
        )}
        {image && (
          <div className="attachment-preview">
            <img src={image} alt="添付画像プレビュー" />
            <button
              className="icon-button"
              aria-label="添付画像を削除"
              onClick={() => setImage(undefined)}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <label className="attach-package">
          <Layers3 size={17} />
          <select
            aria-label="関連AXパッケージ"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
          >
            <option value="">関連する業務の型を追加（任意）</option>
            {packages.map((p) => (
              <option value={p.id} key={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <div className="compose-disclaimer">
          <Info size={14} />
          投稿は未検証の知見として共有されます。個人情報は入力しないでください。
        </div>
        <div className="compose-footer">
          <input
            type="file"
            ref={input}
            hidden
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
            aria-label="画像ファイル"
          />
          <button
            className="button ghost"
            onClick={() => input.current?.click()}
            disabled={loading}
          >
            <ImagePlus size={21} />
            {loading ? "読み込み中…" : "画像を添付"}
          </button>
          <span>{text.length}/6,000</span>
          <button
            className="button primary"
            disabled={(!text.trim() && !image) || loading}
            onClick={() =>
              onPost(text, image, packageId || undefined, draft.quote, tag)
            }
          >
            <Send size={16} />
            投稿する
          </button>
        </div>
      </div>
    </Dialog>
  );
}
