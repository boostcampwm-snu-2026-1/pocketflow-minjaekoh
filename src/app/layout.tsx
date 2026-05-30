import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pocketflow",
  description: "1인 가구를 위한 현금흐름 예측 대시보드"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
