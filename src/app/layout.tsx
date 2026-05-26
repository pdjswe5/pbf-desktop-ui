import type { Metadata } from "next";
import TabNav from "@/components/tab-nav";
import WinMenuBar from "@/components/win-menubar";
import "./globals.css";

export const metadata: Metadata = {
  title: "APOFAST | PBF Desktop v1.0",
  description: "PBF Desktop - Apotek Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <TabNav />
        <WinMenuBar />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
