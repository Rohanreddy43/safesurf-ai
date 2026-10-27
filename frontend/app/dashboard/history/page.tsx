'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, Trash2, Bookmark, Filter, History, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { ScanReport } from '@/lib/types';

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanReport[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory({ search, status_filter: statusFilter })
      .then((data) => setScans(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scan report?')) return;
    try {
      await api.deleteReport(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            Scan History & Saved Reports
          </h1>
          <p className="text-xs text-slate-400">Search, filter, export CSV, and download PDF reports</p>
        </div>
        
        <a
          href={api.getExportCsvUrl()}
          download
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-semibold text-xs hover:bg-slate-800 transition-all flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4" />
          Export History CSV
        </a>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL or domain name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="safe">Safe Only</option>
            <option value="suspicious">Suspicious Only</option>
            <option value="malicious">Malicious Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Target URL</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {scans.length > 0 ? (
                scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-500">#{scan.id}</td>
                    <td className="p-3 font-semibold text-slate-200 truncate max-w-xs">{scan.url}</td>
                    <td className="p-3 text-slate-400">{scan.domain}</td>
                    <td className="p-3 font-extrabold text-slate-100">{scan.risk_score}/100</td>
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
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/dashboard/scan?id=${scan.id}`}
                        className="px-2 py-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 text-[11px] inline-flex items-center gap-1"
                      >
                        View
                      </Link>
                      <a
                        href={api.getExportPdfUrl(scan.id)}
                        download
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] inline-flex items-center gap-1"
                      >
                        PDF
                      </a>
                      <button
                        onClick={() => handleDelete(scan.id)}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px]"
                        title="Delete scan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic font-sans">
                    {loading ? 'Loading scan history...' : 'No matching scan reports found.'}
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
