'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import ScanProgress from '@/components/ScanProgress';
import ReportView from '@/components/ReportView';
import { api } from '@/lib/api';
import { ScanReport } from '@/lib/types';

function ScanContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url') || '';
  const initialId = searchParams.get('id') || '';

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [scanning, setScanning] = useState(false);
  const [currentReport, setCurrentReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialId) {
      api.getReport(parseInt(initialId))
        .then((rep) => setCurrentReport(rep))
        .catch((err) => setError(err.message));
    } else if (initialUrl) {
      triggerScan(initialUrl);
    }
  }, [initialUrl, initialId]);

  const triggerScan = async (target: string) => {
    if (!target.trim()) return;
    setScanning(true);
    setError(null);
    setCurrentReport(null);

    try {
      const rep = await api.runScan(target.trim());
      setCurrentReport(rep);
    } catch (err: any) {
      setError(err.message || 'Failed to scan target URL');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerScan(inputUrl);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            Live URL Scanner & Threat Inspection
          </h1>
          <p className="text-xs text-slate-400">
            Analyzes any website URL across 10 security modules in real time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter URL e.g. https://example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={scanning}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-accent-foreground font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
          >
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            Error: {error}
          </div>
        )}
      </div>

      {/* Progress Animation */}
      {scanning && (
        <ScanProgress />
      )}

      {/* Report View */}
      {!scanning && currentReport && (
        <ReportView report={currentReport} />
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading URL Scanner...</div>}>
      <ScanContent />
    </Suspense>
  );
}
