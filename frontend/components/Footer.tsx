import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Terminal, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span className="font-extrabold text-lg text-slate-100 tracking-tight">SafeSurf AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise multi-layered web security & phishing detection engine analyzing URLs across 10 distinct security modules with plain-English AI explanations.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Security Modules</h4>
          <ul className="space-y-2 text-xs">
            <li>URL & Typosquatting Analysis</li>
            <li>DNS & WHOIS Metadata</li>
            <li>SSL/TLS Inspection</li>
            <li>Redirect Flow Tracing</li>
            <li>HTML DOM Security Audit</li>
            <li>Security Headers Grading</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard/scan" className="hover:text-cyan-400">Live URL Scanner</Link></li>
            <li><Link href="/dashboard" className="hover:text-cyan-400">Dashboard</Link></li>
            <li><Link href="/dashboard/history" className="hover:text-cyan-400">Scan History & Reports</Link></li>
            <li><Link href="/dashboard/apikeys" className="hover:text-cyan-400">REST API Keys</Link></li>
            <li><Link href="/dashboard/qr-scanner" className="hover:text-cyan-400">QR Code Scanner</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Compliance & Tech</h4>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">FastAPI</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300">Next.js 15</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-300">VirusTotal AI</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-indigo-300">PyJWT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            &copy; {new Date().getFullYear()} SafeSurf AI Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
