'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ShieldAlert, AlertTriangle, ArrowUpRight, Activity, Clock, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { GlobalStats, ScanReport } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<GlobalStats>({
    total_scans: 0,
    threats_detected: 0,
    avg_scan_time: 1.3,
    safe_urls: 0,
    suspicious_urls: 0,
    malicious_urls: 0
  });
  const [recentScans, setRecentScans] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getHistory()]).then(([statsData, historyData]) => {
      if (statsData) setStats(statsData);
      if (historyData) setRecentScans(historyData.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-400">Real-time web security metrics & recent scan logs</p>
        </div>
        <Link
          href="/dashboard/scan"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-accent-foreground font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center gap-2 self-start"
        >
          <Search className="w-4 h-4" />
          Scan New URL
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total URLs Scanned</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">{stats.total_scans}</div>
          <p className="text-[10px] text-slate-500">Across 10 inspection engines</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Threats Caught</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{stats.threats_detected}</div>
          <p className="text-[10px] text-slate-500">Suspicious & Malicious URLs</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Safe Domains</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{stats.safe_urls}</div>
          <p className="text-[10px] text-slate-500">Verified clean trust scores</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg Scan Speed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">{stats.avg_scan_time}s</div>
          <p className="text-[10px] text-slate-500">Parallel async response</p>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Recent Security Audits
          </h3>
          <Link href="/dashboard/history" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
            View All History <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Target URL</th>
                <th className="p-3">Trust Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Scan Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentScans.length > 0 ? (
                recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40 font-mono">
                    <td className="p-3 font-semibold text-slate-200 truncate max-w-xs">{scan.url}</td>
                    <td className="p-3 font-bold text-slate-100">{scan.risk_score}/100</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        scan.status === 'safe'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : scan.status === 'suspicious'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(scan.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/dashboard/scan?id=${scan.id}`}
                        className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 text-[11px]"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic font-sans">
                    No scan history recorded yet. Run your first scan above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
