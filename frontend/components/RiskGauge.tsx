'use client';

import React from 'react';
import { ScanStatus } from '@/lib/types';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  status: ScanStatus;
  size?: number;
}

export default function RiskGauge({ score, status, size = 180 }: RiskGaugeProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'stroke-emerald-400 text-emerald-400 shadow-emerald-500/20';
  let badgeBg = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  let Icon = ShieldCheck;

  if (status === 'suspicious' || (score < 80 && score >= 50)) {
    colorClass = 'stroke-amber-400 text-amber-400 shadow-amber-500/20';
    badgeBg = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    Icon = AlertTriangle;
  } else if (status === 'malicious' || score < 50) {
    colorClass = 'stroke-rose-500 text-rose-500 shadow-rose-500/20';
    badgeBg = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    Icon = ShieldAlert;
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight font-mono text-slate-100">{score}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Trust Score</span>
        </div>
      </div>
      <div className={`mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
        <Icon className="w-4 h-4" />
        {status}
      </div>
    </div>
  );
}
