import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "8QB 다국어 음성 번역 시스템",
  description: "외국인 작업자 교육용 8QB 다국어 음성 번역 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-800 text-white text-center py-3 text-base">
          © OH Young-Hwan (쑤구이)
        </footer>
      </body>
    </html>
  );
}
