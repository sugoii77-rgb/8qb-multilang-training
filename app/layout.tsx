import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "8QB 다국어 음성 번역 시스템",
  description: "외국인 작업자 교육을 위한 현장용 번역 · 음성 출력 웹앱"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
