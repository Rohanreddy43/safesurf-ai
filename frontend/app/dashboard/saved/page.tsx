'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ExternalLink, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { ScanReport } from '@/lib/types';

export default function SavedReportsPage() {
  const [savedScans, setSavedScans] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory({ saved_only: true })
      .then((data) => setSavedScans(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-400" />
          Saved Favorite Reports
        </h1>
        <p className="text-xs text-slate-400">Bookmarked URL security audit reports for rapid access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedScans.length > 0 ? (
          savedScans.map((scan) => (
            <div key={scan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">REPORT #{scan.id}</span>
                  <h3 className="text-base font-bold text-slate-100 truncate max-w-xs">{scan.url}</h3>
                  <p className="text-xs text-slate-400 font-mono">Domain: {scan.domain}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  scan.status === 'safe'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : scan.status === 'suspicious'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {scan.risk_score}/100
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500 font-mono">{new Date(scan.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={api.getExportPdfUrl(scan.id)}
                    download
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                  >
                    PDF
                  </a>
                  <Link
                    href={`/dashboard/scan?id=${scan.id}`}
                    className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 font-semibold"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 italic">
            {loading ? 'Loading saved reports...' : 'No bookmarked reports yet. Click "Save Report" on any scan to save it here!'}
          </div>
        )}
      </div>
    </div>
  );
}
