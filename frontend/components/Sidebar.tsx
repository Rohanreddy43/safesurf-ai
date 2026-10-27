'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, History, Bookmark, Key, Settings, ShieldAlert, QrCode, Terminal } from 'lucide-react';
import { getStoredUser } from '@/lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Scan URL', href: '/dashboard/scan', icon: Search },
    { name: 'Scan History', href: '/dashboard/history', icon: History },
    { name: 'Saved Reports', href: '/dashboard/saved', icon: Bookmark },
    { name: 'QR Code Scanner', href: '/dashboard/qr-scanner', icon: QrCode },
    { name: 'API Keys', href: '/dashboard/apikeys', icon: Key },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (isAdmin) {
    links.push({ name: 'Admin Console', href: '/dashboard/admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">Navigation</span>
          <nav className="mt-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-[11px] space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>Engine Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-slate-400 text-[10px]">10 Modules Active</p>
      </div>
    </aside>
  );
}
