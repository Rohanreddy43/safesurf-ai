'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';

interface ScanProgressProps {
  onComplete?: () => void;
}

const MODULES = [
  { id: 1, name: 'URL Validation & Typosquatting', desc: 'Checking homographs, punycode, & brand mimicry' },
  { id: 2, name: 'DNS Record Lookup', desc: 'Resolving A, AAAA, MX, TXT, & SPF records' },
  { id: 3, name: 'WHOIS & Domain Age', desc: 'Inspecting registrar details & age thresholds' },
  { id: 4, name: 'SSL/TLS Inspection', desc: 'Auditing certificate chain, cipher, & expiry' },
  { id: 5, name: 'Hosting & Geolocation', desc: 'Resolving IP, ASN, ISP, & geographical server map' },
  { id: 6, name: 'Redirect Flow Analysis', desc: 'Tracing HTTP redirect hops & loop detection' },
  { id: 7, name: 'Static HTML Security Audit', desc: 'Scanning for hidden iframes, miners, & obfuscation' },
  { id: 8, name: 'Security Headers Audit', desc: 'Evaluating CSP, HSTS, X-Frame-Options, & policy score' },
  { id: 9, name: 'Multi-Source Threat Intel', desc: 'Cross-checking VirusTotal, Safe Browsing, & PhishTank' },
  { id: 10, name: 'AI Dynamic Risk Engine', desc: 'Synthesizing weighted risk score & plain English summary' },
];

export default function ScanProgress({ onComplete }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < MODULES.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round((currentStep / MODULES.length) * 100));

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Scanning Target Website...</h3>
            <p className="text-xs text-slate-400">Executing 10 concurrent security inspection engines</p>
          </div>
        </div>
        <span className="text-lg font-extrabold font-mono text-cyan-400">{progressPercent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Module Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODULES.map((mod) => {
          const isDone = mod.id < currentStep;
          const isCurrent = mod.id === currentStep;

          return (
            <div
              key={mod.id}
              className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                isDone
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                  : isCurrent
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-500/5'
                  : 'bg-slate-950/30 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />
              ) : (
                <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold">{mod.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{mod.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
