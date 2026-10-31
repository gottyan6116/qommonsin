"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {
  X,
  ShieldCheck,
  Building2,
  ArrowRight,
  Files,
  BookOpen,
  Scale,
  MessagesSquare,
  Search,
  Megaphone,
  Wifi,
} from "lucide-react";
import type { Person } from "@/lib/model";
export function Avatar({
  person,
  size = 44,
}: {
  person: Person;
  size?: number;
}) {
  return person.id === "official" ? (
    <span
      className="avatar official-avatar"
      style={{ width: size, height: size }}
    >
      <Wifi size={size * 0.55} />
    </span>
  ) : (
    <span className="avatar" style={{ width: size, height: size }}>
      <img
        src={person.avatar}
        alt={person.name}
        width={size}
        height={size}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="avatar-fallback">{person.name.slice(0, 1)}</span>
    </span>
  );
}
export function Status({ approved = true }: { approved?: boolean }) {
  return (
    <span className={"status " + (!approved ? "review" : "")}>
      <ShieldCheck size={13} />
      {approved ? "責任者承認済み" : "検証中"}
    </span>
  );
}
export function PackageIcon({
  name = "files",
  size = 22,
}: {
  name?: string;
  size?: number;
}) {
  const Icon =
    (
      {
        files: Files,
        book: BookOpen,
        scale: Scale,
        messages: MessagesSquare,
        search: Search,
        megaphone: Megaphone,
      } as const
    )[name as "files"] || Files;
  return (
    <span className="package-icon">
      <Icon size={size} />
    </span>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Search size={30} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button,input,textarea,select,a[href],[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        className={"modal " + (wide ? "wide" : "")}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="閉じる" onClick={onClose}>
            <X size={23} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function DemoNotice() {
  return (
    <div className="demo-notice">
      <Building2 size={13} />
      <span>提案用デモ · 人物・自治体・実績は架空です</span>
    </div>
  );
}
export function TextLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={16} />
    </button>
  );
}
