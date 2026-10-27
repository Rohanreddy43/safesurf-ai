import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SafeSurf AI | Modern Website Security & Phishing Detection Platform",
  description: "Enterprise-grade URL scanner and phishing detection platform analyzing websites across 10 security modules with plain-English AI explanations.",
};

/**
 * Applies the persisted theme before first paint so a reload never flashes the
 * wrong colour scheme. The storage key must match `THEME_STORAGE_KEY` in
 * components/Navbar.tsx.
 */
const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem('safesurf-theme');
    var root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-300`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
