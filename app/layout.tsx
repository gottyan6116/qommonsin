import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Qommons IN | 行政の知恵を、つなぐ。",
  description:
    "全国の自治体職員がつながり、知恵を共有する共創プラットフォーム。提案用デモ。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
