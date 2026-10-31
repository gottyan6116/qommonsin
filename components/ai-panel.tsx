"use client";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  Send,
  ShieldCheck,
  RotateCcw,
  Bot,
  FileCheck2,
  MessageSquarePlus,
} from "lucide-react";
import { packages } from "@/lib/data";
import { assessDifferences } from "@/lib/model";
import { Dialog, PackageIcon } from "./ui";
export default function AIPanel({
  id,
  onClose,
  onImprove,
  onPackage,
}: {
  id: string;
  onClose: () => void;
  onImprove: (text: string, id: string) => void;
  onPackage: (id: string) => void;
}) {
  const pkg = packages.find((p) => p.id === id) || packages[0];
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState("paper");
  const [review, setReview] = useState("internal");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [step, busy, submitted]);
  function advance() {
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      setStep(1);
    }, 650);
  }
  const differences = assessDifferences(channel, review);
  function improve() {
    const text =
      "【改善提案】" +
      pkg.title +
      "\n\nQommonsAIの差分確認デモで、自庁の運用との違いを整理しました。\n" +
      differences.map((s) => "・" + s).join("\n") +
      (submitted ? "\n・追加確認：" + submitted : "") +
      "\n\nこの点を確認項目に加え、業務の型をより使いやすくしていきたいです。\n※実運用前の検討案・未検証の知見です。";
    onImprove(text, pkg.id);
  }
  return (
    <Dialog title="QommonsAI" onClose={onClose} wide>
      <div className="ai-panel">
        <div className="ai-demo-label">
          <Sparkles size={14} />
          シナリオデモ · 実際のAIへの送信はありません
        </div>
        <div className="ai-chat" ref={bodyRef}>
          <div className="ai-hello">
            <div className="ai-mark">
              <Sparkles size={23} />
            </div>
            <div>
              <strong>この知恵を、あなたの自治体で。</strong>
              <p>業務の型と自庁の運用を、一緒に確認しましょう。</p>
            </div>
          </div>
          <div className="ai-bubble">
            <p>
              「{pkg.title}
              」の型が見つかりました。まず、自庁との違いを2つの観点で整理します。
            </p>
            <button className="ai-package" onClick={() => onPackage(pkg.id)}>
              <PackageIcon name={pkg.icon} size={18} />
              <span>
                {pkg.title}
                <small>
                  {pkg.status === "approved" ? "責任者承認済み" : "検証中"} ·
                  構想デモ
                </small>
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="ai-form">
            <div className="step-label">
              STEP 1 / 2 <span>自庁の運用を教えてください</span>
            </div>
            <fieldset disabled={step === 1 || busy}>
              <legend>申請の受付方法</legend>
              <label>
                <input
                  type="radio"
                  name="channel"
                  value="paper"
                  checked={channel === "paper"}
                  onChange={() => setChannel("paper")}
                />
                紙の申請も受け付けている
              </label>
              <label>
                <input
                  type="radio"
                  name="channel"
                  value="online"
                  checked={channel === "online"}
                  onChange={() => setChannel("online")}
                />
                オンライン申請を中心に受け付けている
              </label>
            </fieldset>
            <fieldset disabled={step === 1 || busy}>
              <legend>審査の体制</legend>
              <label>
                <input
                  type="radio"
                  name="review"
                  checked={review === "internal"}
                  onChange={() => setReview("internal")}
                />
                庁内の担当課で審査する
              </label>
              <label>
                <input
                  type="radio"
                  name="review"
                  checked={review === "external"}
                  onChange={() => setReview("external")}
                />
                外部への審査委託がある
              </label>
            </fieldset>
            {step === 0 && (
              <button
                className="button primary"
                onClick={advance}
                disabled={busy}
              >
                {busy ? <span className="spinner" /> : <Sparkles size={16} />}{" "}
                {busy ? "差分を整理しています…" : "自庁との差分を確認する"}
              </button>
            )}
          </div>
          {step === 1 && (
            <>
              <div className="ai-user-bubble">
                {channel === "paper" ? "紙申請も受付" : "オンライン申請中心"}・
                {review === "internal" ? "庁内審査" : "外部審査あり"}
                で確認してください。
              </div>
              <div className="ai-result">
                <div className="step-label">
                  STEP 2 / 2 <span>自庁に合わせるポイント</span>
                </div>
                <h3>
                  <FileCheck2 size={19} />
                  2つの運用差分を確認しました
                </h3>
                {differences.map((d, i) => (
                  <div className="difference" key={d}>
                    <span>{i + 1}</span>
                    <p>{d}</p>
                  </div>
                ))}
                <div className="ai-review-note">
                  <ShieldCheck size={17} />
                  <p>
                    条例・要綱、個人情報の取り扱い、最終承認の権限は、自庁の責任者に確認してください。
                  </p>
                </div>
                <p className="ai-fixed-note">
                  定義済みの回答を表示しています。要件の適合性や審査結果を判定するものではありません。
                </p>
                <button
                  className="text-link"
                  onClick={() => {
                    setStep(0);
                    setSubmitted("");
                  }}
                >
                  <RotateCcw size={14} />
                  条件を変えて確認する
                </button>
              </div>
              {submitted && (
                <>
                  <div className="ai-user-bubble">{submitted}</div>
                  <div className="ai-bubble">
                    <p>
                      追加の確認事項として下書きに記録しました。このデモでは自由入力を分析しません。担当課・業務責任者に確認する項目として共有しましょう。
                    </p>
                  </div>
                </>
              )}
              <form
                className="ai-note-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (note.trim()) {
                    setSubmitted(note.trim());
                    setNote("");
                  }
                }}
              >
                <input
                  aria-label="追加で確認したい点"
                  placeholder="自庁で追加確認したい点をメモ…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                />
                <button
                  className="icon-button"
                  disabled={!note.trim()}
                  aria-label="確認事項を追加"
                >
                  <Send size={17} />
                </button>
              </form>
            </>
          )}
        </div>
        <div className="ai-footer">
          {step === 1 ? (
            <>
              <p>この気づきを共有して、業務の型を育てましょう。</p>
              <button className="button primary" onClick={improve}>
                <MessageSquarePlus size={17} />
                改善案を投稿する
                <ArrowRight size={17} />
              </button>
            </>
          ) : (
            <p>
              <ShieldCheck size={15} />
              入力内容はこのブラウザ内でのみ使用します。
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
