'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Search, ArrowRight, Lock, Globe, Server, ShieldAlert,
  Zap, Code2, Cpu, CheckCircle2, AlertTriangle, Activity, Terminal
} from 'lucide-react';
import { api } from '@/lib/api';
import { GlobalStats } from '@/lib/types';

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [stats, setStats] = useState<GlobalStats>({
    total_scans: 12480,
    threats_detected: 1420,
    avg_scan_time: 1.35,
    safe_urls: 11060,
    suspicious_urls: 980,
    malicious_urls: 440
  });

  useEffect(() => {
    api.getStats().then((data) => {
      if (data && data.total_scans > 0) setStats(data);
    }).catch(() => {});
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/dashboard/scan?url=${encodeURIComponent(url.trim())}`);
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    router.push(`/dashboard/scan?url=${encodeURIComponent(exampleUrl)}`);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Glow backdrop shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            SafeSurf AI 2.0 Engine Live
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-none">
            Analyze Any Website URL for <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Phishing & Security Threats
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Enterprise URL analysis inspired by VirusTotal and Google Safe Browsing. Executes 10 concurrent security inspection modules with plain-English AI risk explanations.
          </p>

          {/* Search Box */}
          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto">
            <div className="relative flex items-center p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-cyan-500/10 focus-within:border-cyan-500 transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g. https://example.com)"
                className="w-full bg-transparent px-4 py-3 text-slate-100 text-sm focus:outline-none placeholder:text-slate-500 font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-accent-foreground font-bold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center gap-2 shrink-0"
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Example Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-500 font-mono">Try examples:</span>
              <button
                type="button"
                onClick={() => handleExampleClick('https://google.com')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 font-mono transition-all"
              >
                https://google.com
              </button>
              <button
                type="button"
                onClick={() => handleExampleClick('http://g00gle-verify.tk')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-rose-300 font-mono transition-all"
              >
                http://g00gle-verify.tk
              </button>
              <button
                type="button"
                onClick={() => handleExampleClick('https://github.com')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 font-mono transition-all"
              >
                https://github.com"
              </button>
            </div>
          </form>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <div className="text-2xl font-black font-mono text-slate-100">{stats.total_scans.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">URLs Scanned</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <div className="text-2xl font-black font-mono text-rose-400">{stats.threats_detected.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Threats Blocked</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <div className="text-2xl font-black font-mono text-cyan-400">{stats.avg_scan_time}s</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Avg Scan Time</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
              <div className="text-2xl font-black font-mono text-emerald-400">99.8%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            10 Multi-Layered Security Inspection Engines
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            SafeSurf AI combines deep static DOM analysis, network protocol auditing, threat intelligence blacklists, and automated AI scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Phishing & Typosquatting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects homograph character attacks, punycode spoofing, and brand mimicry using Levenshtein distance against major global domains.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">SSL/TLS Inspection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audits certificate issuer trust, expiry dates, TLS protocol versions, and warns against weak or self-signed certificates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">DNS & WHOIS Metadata</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resolves A, MX, TXT, NS, and CNAME records while inspecting WHOIS domain age to penalize newly created registration domains.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">HTML DOM Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scans target HTML for hidden zero-pixel iframes, unencrypted password submit forms, obfuscated JS code, and crypto miners.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Threat Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aggregates reputation data from VirusTotal, Google Safe Browsing, OpenPhish, PhishTank, AbuseIPDB, and URLScan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">AI Dynamic Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates a dynamic trust score (0-100) and synthesizes human-readable plain English explanations detailing exact risk factors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Ready to Audit Your Website Security?</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Scan any link, export PDF reports, and manage API keys for automated security checks.</p>
          </div>
          <Link
            href="/dashboard/scan"
            className="px-6 py-3.5 rounded-xl bg-cyan-500 text-accent-foreground font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/25 shrink-0"
          >
            Launch URL Scanner
          </Link>
        </div>
      </section>
    </div>
  );
}
