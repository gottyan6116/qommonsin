"use client";
import { useState } from "react";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Download,
  GitBranch,
  FileText,
  Bot,
  CheckCircle2,
  Sparkles,
  Clock3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  ArrowDown,
  AlertCircle,
  BookOpen,
  FlaskConical,
  Layers3,
} from "lucide-react";
import { packages, fields, type AxPackage } from "@/lib/data";
import type { State } from "@/lib/model";
import { Empty, PackageIcon, Status } from "./ui";
import { PostCard, type FeedActions } from "./feed";
export function Repository({
  openPackage,
}: {
  openPackage: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("すべて");
  const [approved, setApproved] = useState(false);
  const items = packages.filter(
    (p) =>
      (field === "すべて" || p.field === field) &&
      (!approved || p.status === "approved") &&
      (p.title + p.description + p.field).includes(query.trim()),
  );
  return (
    <div className="repository">
      <div className="page-heading">
        <div className="eyebrow">QOMMONS KNOWLEDGE</div>
        <h1>全国行政AXレポジトリ</h1>
        <p>一つの自治体の知恵を、全国で使える「業務の型」に。</p>
        <span className="concept-badge">
          <Clock3 size={13} />
          2027年4月公開予定 · 構想デモ
        </span>
      </div>
      <section className="card repository-search">
        <label className="big-search">
          <Search size={21} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="解決したい課題や、業務名で検索"
            aria-label="AXパッケージを検索"
          />
        </label>
        <div className="filter-chips">
          {fields.map((f) => (
            <button
              key={f}
              onClick={() => setField(f)}
              className={field === f ? "active" : ""}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
          />
          責任者承認済みのみ表示
        </label>
      </section>
      <div className="list-caption">
        <strong>{items.length}件の業務パッケージ</strong>
        <span>デモ用のサンプルパッケージ</span>
      </div>
      <div className="package-grid">
        {items.map((p) => (
          <button
            className="card package-card"
            onClick={() => openPackage(p.id)}
            key={p.id}
          >
            <div className="package-card-top">
              <PackageIcon name={p.icon} />
              <Status approved={p.status === "approved"} />
            </div>
            <span className="subtle-label">{p.field}</span>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <div className="package-card-bottom">
              <span>
                <Layers3 size={14} />
                6つの構成要素
              </span>
              <span>
                v{p.version}
                <ArrowRight size={17} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {!items.length && (
        <section className="card">
          <Empty
            title="条件に合う業務の型がありません"
            description="別のキーワードや行政分野で検索してください。"
          >
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setField("すべて");
                setApproved(false);
              }}
            >
              検索条件をリセット
            </button>
          </Empty>
        </section>
      )}
      <div className="repository-explainer">
        <ShieldCheck size={24} />
        <div>
          <h3>知見を、そのまま業務の正解にしない。</h3>
          <p>
            コミュニティの未検証の知見を、検証・承認を経て再利用できる業務の型へ。承認状態を確認し、自庁の制度・運用との違いを必ず見直します。
          </p>
        </div>
      </div>
    </div>
  );
}
const flows: Record<string, string[]> = {
  benefit: [
    "申請書の提出",
    "受付・添付確認",
    "不備判定",
    "対象要件の確認",
    "結果の通知",
  ],
  assembly: [
    "質問・論点の整理",
    "過去答弁の検索",
    "根拠資料の照合",
    "答弁案の作成",
    "責任者による確認",
  ],
  rules: [
    "調べたい事務を入力",
    "例規・法令を検索",
    "改正時点を照合",
    "適用範囲を確認",
    "根拠を記録",
  ],
  helpdesk: [
    "問い合わせの受付",
    "質問の分類",
    "根拠資料の検索",
    "一次回答案の作成",
    "担当者確認・回答",
  ],
  subsidy: [
    "政策課題の整理",
    "公募情報を調査",
    "対象・期限を抽出",
    "制度比較表を作成",
    "担当者の最終確認",
  ],
  publicity: [
    "対象・目的を整理",
    "原稿の下書き",
    "やさしい日本語へ",
    "事実・表現を確認",
    "媒体別に仕上げ",
  ],
};
const elements = [
  {
    title: "業務フロー",
    icon: GitBranch,
    description: "担当・判断・引き継ぎを見える化",
    ext: "業務フロー.txt",
  },
  {
    title: "AIスキル",
    icon: Sparkles,
    description: "作業ごとのプロンプトと入力要件",
    ext: "AIスキル.txt",
  },
  {
    title: "エージェント定義",
    icon: Bot,
    description: "AIの役割と人に戻す条件",
    ext: "エージェント定義.json",
  },
  {
    title: "判断基準",
    icon: ShieldCheck,
    description: "確認項目・例外対応・人の承認",
    ext: "判断基準.txt",
  },
  {
    title: "成果物ひな形",
    icon: FileText,
    description: "確認表・案内文のテンプレート",
    ext: "成果物ひな形.csv",
  },
  {
    title: "検証用テスト",
    icon: FlaskConical,
    description: "正常・不備・例外のテストケース",
    ext: "検証用テスト.txt",
  },
];
export function PackageDetail({
  id,
  state,
  actions,
  back,
}: {
  id: string;
  state: State;
  actions: FeedActions;
  back: () => void;
}) {
  const pkg = packages.find((p) => p.id === id);
  const [tab, setTab] = useState("overview");
  const [open, setOpen] = useState<number | null>(null);
  if (!pkg)
    return (
      <section className="card">
        <Empty title="パッケージが見つかりません">
          <button className="button primary" onClick={back}>
            一覧に戻る
          </button>
        </Empty>
      </section>
    );
  const steps = flows[pkg.id];
  const related = state.posts.filter((p) => p.packageId === pkg.id);
  return (
    <div className="detail">
      <button className="back-link" onClick={back}>
        <ArrowLeft size={16} />
        AXレポジトリに戻る
      </button>
      <section className="card detail-header">
        <div className="detail-breadcrumb">
          全国行政AXレポジトリ / {pkg.field}
        </div>
        <div className="detail-title-row">
          <PackageIcon name={pkg.icon} size={29} />
          <div>
            <div className="detail-status">
              <Status approved={pkg.status === "approved"} />
              <span>v{pkg.version}</span>
            </div>
            <h1>{pkg.title}</h1>
          </div>
        </div>
        <p>{pkg.description}</p>
        <div className="detail-byline">
          <span>
            <Users size={14} />
            {pkg.owner}
          </span>
          <span>更新 {pkg.updated}</span>
        </div>
        <div className="detail-ctas">
          <button className="button primary" onClick={() => actions.ai(pkg.id)}>
            <Sparkles size={17} />
            この型を使ってみる
          </button>
          <button
            className="button secondary"
            onClick={() => actions.ai(pkg.id)}
          >
            <Bot size={17} />
            QommonsAIに相談
          </button>
          <button
            className="button ghost"
            onClick={() =>
              actions.compose(
                "【改善提案】" +
                  pkg.title +
                  "\n自庁で確認したこと：\n改善したい点：",
                pkg.id,
              )
            }
          >
            改善案を共有
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="concept-inline">
          <Clock3 size={13} />
          2027年4月公開予定の構想を再現したデモです。承認・実績も架空です。
        </div>
        <div className="detail-tabs">
          {[
            ["overview", "概要・業務フロー"],
            ["elements", "構成要素"],
            ["posts", "関連する投稿"],
          ].map(([key, label]) => (
            <button
              className={tab === key ? "active" : ""}
              key={key}
              onClick={() => setTab(key)}
            >
              {label}
              {key === "posts" && <span>{related.length}</span>}
            </button>
          ))}
        </div>
      </section>
      {tab === "overview" && (
        <>
          <section className="card section-pad">
            <div className="section-title">
              <GitBranch size={19} />
              <h2>業務の流れ</h2>
              <span>人とAIの役割を明確に</span>
            </div>
            <p className="section-description">
              {pkg.id === "benefit"
                ? "申請受付から結果通知まで、確認の順番と判断の分かれ道を共通化します。"
                : "実務の手順を整理し、AIが支援する作業と担当者の判断を分けます。"}
            </p>
            <div className="workflow">
              {steps.map((s, i) => (
                <div className="flow-item" key={s}>
                  <div className={"flow-step " + (i === 2 ? "decision" : "")}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{s}</strong>
                    <small>
                      {i === 2
                        ? "担当者が判断"
                        : i === steps.length - 1
                          ? "人が確認・確定"
                          : "AIが作業を支援"}
                    </small>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowDown className="flow-arrow" size={18} />
                  )}
                </div>
              ))}
            </div>
            {pkg.id === "benefit" && (
              <div className="flow-branch">
                <div className="branch-line" />
                <span>不備あり</span>
                <ArrowRight size={16} />
                <strong>補正のご案内・再提出</strong>
                <ArrowRight size={16} />
                <span>受付・添付確認へ戻る</span>
              </div>
            )}
            <div className="human-note">
              <ShieldCheck size={16} />
              <span>
                AIは確認や下書きを支援します。適否の判断・結果通知は、担当職員が確認します。
              </span>
            </div>
          </section>
          <section className="card section-pad">
            <div className="section-title">
              <Layers3 size={19} />
              <h2>6つの構成要素</h2>
              <button onClick={() => setTab("elements")} className="muted-link">
                すべて見る
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="element-mini-grid">
              {elements.map((el, i) => (
                <button
                  key={el.title}
                  onClick={() => {
                    setTab("elements");
                    setOpen(i);
                  }}
                >
                  <el.icon size={20} />
                  <span>{el.title}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </section>
          <section className="card section-pad validation">
            <div className="section-title">
              <ShieldCheck size={19} />
              <h2>検証・承認の状態</h2>
              <Status approved={pkg.status === "approved"} />
            </div>
            <p>
              {pkg.status === "approved"
                ? "想定ケースの検証と業務責任者の確認を完了したサンプルです。"
                : "想定ケースを検証中のサンプルです。業務責任者の承認前に、実業務へ適用しないでください。"}
            </p>
            <div className="validation-line">
              <CheckCircle2 size={16} />
              担当者レビュー<span>→</span>
              <CheckCircle2 size={16} />
              テスト検証<span>→</span>
              {pkg.status === "approved" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock3 size={16} />
              )}
              責任者承認
            </div>
            <small>
              デモ上の状態です。自庁の条例・要綱・運用との適合性は別途確認が必要です。
            </small>
          </section>
        </>
      )}
      {tab === "elements" && (
        <section className="card section-pad">
          <div className="section-title">
            <Layers3 size={19} />
            <h2>パッケージの構成要素</h2>
          </div>
          <p className="section-description">
            サンプルを確認・ダウンロードして、自庁に合わせた検討に使えます。
          </p>
          {elements.map((el, i) => (
            <div className="element-accordion" key={el.title}>
              <button
                className="element-toggle"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <el.icon size={21} />
                <span>
                  <strong>{el.title}</strong>
                  <small>{el.description}</small>
                </span>
                {open === i ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {open === i && (
                <div className="element-content">
                  <pre>{elementContent(pkg, i, steps)}</pre>
                  <button
                    className="button secondary small"
                    onClick={() =>
                      download(
                        pkg.title + "_" + el.ext,
                        elementContent(pkg, i, steps),
                      )
                    }
                  >
                    <Download size={15} />
                    サンプルをダウンロード
                  </button>
                  <small>
                    提案用のひな形です。実運用前に内容を確認してください。
                  </small>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
      {tab === "posts" && (
        <>
          <div className="related-posts-note">
            <MessageIcon />
            コミュニティの投稿は未検証の知見です。パッケージの承認状態とは異なります。
          </div>
          {related.map((p) => (
            <PostCard key={p.id} post={p} state={state} actions={actions} />
          ))}
          {!related.length && (
            <section className="card">
              <Empty
                title="この型を、最初の対話につなげましょう"
                description="自庁で確認したいことや改善案を共有できます。"
              >
                <button
                  className="button primary"
                  onClick={() =>
                    actions.compose(
                      "【" + pkg.title + "】\n自庁で確認したいこと：",
                      pkg.id,
                    )
                  }
                >
                  知見を共有する
                </button>
              </Empty>
            </section>
          )}
        </>
      )}
    </div>
  );
}
function MessageIcon() {
  return <AlertCircle size={16} />;
}
export function elementContent(pkg: AxPackage, i: number, steps: string[]) {
  const base = "【" + pkg.title + " / 構想デモ・サンプル】\n";
  return (
    (i === 2 || i === 4 ? "" : base) +
    [
      steps.map((s, j) => j + 1 + ". " + s).join("\n") +
        (pkg.id === "benefit" ? "\n不備あり → 補正・再提出 → 受付へ戻る" : ""),
      "目的：" +
        pkg.title +
        "の確認と下書き支援\n入力：対象資料・自庁の要綱・確認項目\n指示：資料に書かれた事実と不明点を分け、根拠箇所を示す。推測で判断しない。\n出力：確認結果、根拠、不明点、担当者への質問",
      JSON.stringify(
        {
          name: pkg.title,
          version: pkg.version,
          mode: "demo",
          tasks: steps,
          human_approval_required: true,
          escalate_when: [
            "根拠が不明",
            "例外ケース",
            "個人情報の取り扱い確認が必要",
          ],
        },
        null,
        2,
      ),
      "□ 必要資料がそろっているか\n□ 入力と原本に相違がないか\n□ 適用する条例・要綱と改正時点を確認したか\n□ 判断に迷う場合は責任者へ確認したか\n□ 最終結果を担当職員が確認したか",
      "確認項目,確認結果,根拠資料,担当者メモ\n必要資料の添付,未確認,,\n入力内容の一致,未確認,,\n対象要件との適合,未確認,,\n責任者の確認,未確認,,",
      "テスト01：必要資料あり → 次の手順へ進む\nテスト02：資料の不足 → 補正案内を作成、人が確認\nテスト03：根拠不明 → 判断を保留し責任者へ\nテスト04：対象要件の例外 → 自動確定しない\nテスト05：結果通知 → 必ず人による承認を挟む",
    ][i]
  );
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([name.endsWith(".csv") ? "\uFEFF" + text : text], {
      type: name.endsWith(".json")
        ? "application/json;charset=utf-8"
        : name.endsWith(".csv")
          ? "text/csv;charset=utf-8"
          : "text/plain;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
