'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, Search, LayoutDashboard, History, Key, Settings, User, LogOut, Sun, Moon, QrCode, Lock } from 'lucide-react';
import { getStoredUser, removeAuthToken } from '@/lib/api';

/** Must match the key read by the pre-paint script in app/layout.tsx. */
const THEME_STORAGE_KEY = 'safesurf-theme';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    // The theme is applied before paint (see app/layout.tsx); mirror it here.
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, [pathname]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (private mode) — the theme still applies for
      // this session, it just will not be remembered on the next visit.
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border text-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              SafeSurf <span className="text-cyan-400 font-mono text-lg">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">Threat Detection</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-background/60 p-1.5 rounded-full border border-border/80">
          <Link
            href="/dashboard/scan"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              pathname === '/dashboard/scan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-foreground/70 hover:text-foreground hover:bg-background/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Scanner
          </Link>
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              pathname === '/dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-foreground/70 hover:text-foreground hover:bg-background/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/history"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              pathname === '/dashboard/history' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-foreground/70 hover:text-foreground hover:bg-background/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
          <Link
            href="/dashboard/qr-scanner"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              pathname === '/dashboard/qr-scanner' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-foreground/70 hover:text-foreground hover:bg-background/50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Scan
          </Link>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-background border border-border text-foreground/60 hover:text-cyan-400 transition-colors"
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground/80 hidden sm:inline-block px-2.5 py-1 rounded-lg bg-background border border-border">
                {user.email} {user.role === 'admin' && <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono">ADMIN</span>}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
