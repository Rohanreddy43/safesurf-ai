'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Search, ShieldCheck, Upload } from 'lucide-react';

export default function QrScannerPage() {
  const router = useRouter();
  const [inputUrl, setInputUrl] = useState('');

  const handleScanUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    router.push(`/dashboard/scan?url=${encodeURIComponent(inputUrl.trim())}`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <QrCode className="w-6 h-6 text-cyan-400" />
          QR Code URL Scanner
        </h1>
        <p className="text-xs text-slate-400">Scan QR codes embedded with website URLs to prevent malicious Quishing attacks</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <QrCode className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-100">Audit QR Code Encoded Links</h3>
          <p className="text-xs text-slate-400">
            Paste the decoded QR URL below to analyze it against SafeSurf AI's 10 security modules before opening it on your device.
          </p>
        </div>

        <form onSubmit={handleScanUrl} className="max-w-md mx-auto space-y-3">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste decoded QR Code URL (e.g. https://qr-link-check.com)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-accent-foreground font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20"
          >
            Analyze QR Code Destination
          </button>
        </form>
      </div>
    </div>
  );
}
