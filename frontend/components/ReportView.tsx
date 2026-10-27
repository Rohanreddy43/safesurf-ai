'use client';

import React, { useState } from 'react';
import { ScanReport } from '@/lib/types';
import RiskGauge from './RiskGauge';
import AiChatbot from './AiChatbot';
import { api } from '@/lib/api';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, FileText, Download, Bookmark, Share2,
  Globe, Lock, Server, ArrowRight, Code2, LayoutList, MapPin, ExternalLink, Cpu,
  Search, Eye, Terminal, Layers, Activity, Sparkles, Image, ShieldX, Users, Flag
} from 'lucide-react';

interface ReportViewProps {
  report: ScanReport;
  onBookmarkToggle?: (isSaved: boolean) => void;
}

export default function ReportView({ report, onBookmarkToggle }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'top10' | 'technical' | 'headers' | 'threat' | 'chat'>('overview');
  const [isSaved, setIsSaved] = useState(report.is_saved);
  const [communityReported, setCommunityReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const modules = report.report_data?.modules;
  const execTime = report.report_data?.execution_time_seconds || 1.25;

  const handleToggleBookmark = async () => {
    try {
      const res = await api.toggleSaveReport(report.id);
      setIsSaved(res.is_saved);
      if (onBookmarkToggle) onBookmarkToggle(res.is_saved);
    } catch (err) {
      alert('Login required to save reports.');
    }
  };

  const handleReportCommunityUrl = async () => {
    setIsReporting(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/community/report?domain=${encodeURIComponent(report.domain)}`, {
        method: 'POST'
      });
      if (res.ok) {
        setCommunityReported(true);
        alert(`Domain '${report.domain}' successfully reported to SafeSurf AI Community Threat Feed!`);
      }
    } catch (err) {
      alert('Failed to report domain.');
    } finally {
      setIsReporting(false);
    }
  };

  const pdfDownloadUrl = api.getExportPdfUrl(report.id);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-semibold">
                SCAN REPORT #{report.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(report.created_at).toLocaleString()}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2 break-all">
              <Globe className="w-7 h-7 text-cyan-400 shrink-0" />
              {report.url}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Domain: <strong className="text-slate-200">{report.domain}</strong></span>
              <span>•</span>
              <span>Scan Duration: <strong className="text-cyan-400">{execTime}s</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">14 Detection Engines Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RiskGauge score={report.risk_score} status={report.status} size={130} />
            
            <div className="flex flex-col gap-2">
              <a
                href={pdfDownloadUrl}
                download
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </a>
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {isSaved ? 'Bookmarked' : 'Save Report'}
              </button>
              <button
                onClick={handleReportCommunityUrl}
                disabled={isReporting || communityReported}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  communityReported
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 cursor-default'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                }`}
              >
                <Flag className="w-4 h-4" />
                {communityReported ? 'Reported to Community' : 'Report Phishing URL'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Overview & AI Summary
        </button>

        <button
          onClick={() => setActiveTab('top10')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'top10'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          Full Security Engines Suite
        </button>

        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'technical'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          DNS, WHOIS & SSL
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'headers'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security Headers & HTML
        </button>

        <button
          onClick={() => setActiveTab('threat')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'threat'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Threat Intelligence
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          Ask SafeSurf AI Chat
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Explanation */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Plain-English AI Risk Analysis
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {report.summary || 'Analyzing domain heuristics and risk factors...'}
            </div>

            {/* Risk Factor Deductions */}
            {modules?.ai_risk_engine?.deductions && modules.ai_risk_engine.deductions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Identified Risk Factors (-{modules.ai_risk_engine.breakdown.total_deductions} pts)
                </h4>
                <div className="space-y-2">
                  {modules.ai_risk_engine.deductions.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-rose-300">{d.factor}: </span>
                        <span className="text-slate-300">{d.reason}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-400 shrink-0 ml-2">-{d.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positive Trust Signals */}
            {modules?.ai_risk_engine?.bonuses && modules.ai_risk_engine.bonuses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Positive Trust Signals (+{modules.ai_risk_engine.breakdown.total_bonuses} pts)
                </h4>
                <div className="space-y-2">
                  {modules.ai_risk_engine.bonuses.map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-300">{b.factor}: </span>
                        <span className="text-slate-300">{b.reason}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">+{b.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics & Hosting */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Server & Hosting Info
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">IP Address</span>
                  <span className="font-mono font-semibold text-cyan-300">{modules?.hosting?.ip_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-200">{modules?.hosting?.city}, {modules?.hosting?.country}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">ISP</span>
                  <span className="font-semibold text-slate-200">{modules?.hosting?.isp || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">ASN</span>
                  <span className="font-mono text-slate-300">{modules?.hosting?.asn || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Redirect Flow */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-cyan-400" />
                Redirect Hops ({modules?.redirects?.hop_count || 1})
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {modules?.redirects?.redirect_chain?.map((hop, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-cyan-400 font-bold">Hop #{hop.hop}</span>
                    <span className="truncate text-slate-300 flex-1">{hop.url}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[10px]">
                      {hop.status_code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Full Security Engines Suite */}
      {activeTab === 'top10' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2 mb-2">
              <Layers className="w-6 h-6 text-cyan-400" />
              Advanced Security & Detection Engines Audit
            </h3>
            <p className="text-xs text-slate-400">
              Detailed findings from all specialized scanning modules operating in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favicon Hashing & Brand Fingerprinting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Image className="w-4 h-4 text-cyan-400" />
                  Favicon MurmurHash3 Brand Matching
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.favicon_hash?.is_favicon_spoofed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.favicon_hash?.is_favicon_spoofed ? 'Spoofed Brand Favicon' : 'Clean'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Shodan MurmurHash3</span>
                  <span className="font-mono font-bold text-cyan-300">{modules?.favicon_hash?.shodan_mmh3_hash || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">MD5 Hash</span>
                  <span className="font-mono text-slate-300 text-[10px] truncate max-w-[200px]">{modules?.favicon_hash?.md5_hash || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Matched Brand Signature</span>
                  <span className="font-semibold text-slate-200">{modules?.favicon_hash?.brand_matched || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Site Structure & Legitimacy Audit */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Site Structure & Legitimacy Index
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.site_legitimacy?.is_isolated_phishing_kit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.site_legitimacy?.is_isolated_phishing_kit ? 'Phishing Kit Structure' : 'Established Site'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Legitimacy Score</span>
                  <span className="font-mono font-bold text-cyan-300">{modules?.site_legitimacy?.legitimacy_score || 0}/100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">robots.txt & sitemap.xml</span>
                  <span className="font-mono text-slate-200">{modules?.site_legitimacy?.has_robots_txt ? 'Present' : 'Missing'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Structure Classification</span>
                  <span className="font-semibold text-slate-200">{modules?.site_legitimacy?.classification || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tech Stack & Phishing Kit Fingerprinter */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldX className="w-4 h-4 text-cyan-400" />
                  Phishing Kit Framework Fingerprints
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.phishing_kit?.phishing_kit_detected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.phishing_kit?.phishing_kit_detected ? 'Kit Detected' : 'Clean'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Matched Templates</span>
                  <span className="font-mono font-bold text-rose-400">{modules?.phishing_kit?.detected_templates?.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Exfiltration Handler</span>
                  <span className="font-mono text-slate-200">{modules?.phishing_kit?.has_exfiltration_pipe ? 'Telegram/Discord Webhook' : 'Clean'}</span>
                </div>
              </div>
            </div>

            {/* Crowdsourced Community Threat Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Crowdsourced Community Threat Feed
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.community_threat?.is_community_flagged ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.community_threat?.threat_status || 'Clean'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Community User Reports</span>
                  <span className="font-mono font-bold text-cyan-300">{modules?.community_threat?.community_reports_count || 0} Reports</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">First-Party Intelligence</span>
                  <span className="font-mono text-slate-200">Active</span>
                </div>
              </div>
            </div>

            {/* 1. Website Crawling & Discovery */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  1. Website Crawling & Discovery
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.crawler_engine?.has_hidden_login_portal ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.crawler_engine?.has_hidden_login_portal ? 'Hidden Portal' : 'Clean'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Discovered Routes</span>
                  <span className="font-mono font-bold text-cyan-300">{modules?.crawler_engine?.discovered_routes_count || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Form Endpoints</span>
                  <span className="font-mono font-bold text-slate-200">{modules?.crawler_engine?.form_endpoints?.length || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">External Posts</span>
                  <span className="font-mono text-slate-300">{modules?.crawler_engine?.has_external_form_posts ? 'Yes (Risk)' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* 2. URL Validation & Typosquatting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  2. URL Validation & Typosquatting
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.url_validation?.typosquatting_detected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.url_validation?.typosquatting_detected ? 'Typosquatting' : 'Pass'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">HTTPS Encryption</span>
                  <span className="font-bold text-emerald-400">{modules?.url_validation?.is_https ? 'Active' : 'Missing'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Punycode / Homograph</span>
                  <span className="font-mono text-slate-200">{modules?.url_validation?.has_punycode ? 'Detected' : 'None'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Raw IP URL</span>
                  <span className="font-mono text-slate-300">{modules?.url_validation?.is_ip ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* 3. Threat Intelligence */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  3. Multi-Source Threat Intelligence
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.threat_intelligence?.flagged_count !== undefined && modules.threat_intelligence.flagged_count > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.threat_intelligence?.flagged_count !== undefined && modules.threat_intelligence.flagged_count > 0 ? `${modules.threat_intelligence.flagged_count} Flagged` : 'Clean'}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 font-mono">
                <div>VirusTotal: <span className="text-cyan-300 font-bold">{modules?.threat_intelligence?.providers?.VirusTotal || 'Clean'}</span></div>
                <div>Google Safe Browsing: <span className="text-cyan-300 font-bold">{modules?.threat_intelligence?.providers?.['Google Safe Browsing'] || 'Safe'}</span></div>
                <div>OpenPhish / PhishTank: <span className="text-cyan-300 font-bold">{modules?.threat_intelligence?.providers?.OpenPhish || 'Clean'}</span></div>
              </div>
            </div>

            {/* 4. Visual Similarity Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  4. Visual Similarity Engine
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.visual_similarity?.is_cloned_brand ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.visual_similarity?.is_cloned_brand ? `Cloned ${modules.visual_similarity.matched_brand}` : 'No Match'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Target Brand Similarity</span>
                  <span className="font-mono font-bold text-cyan-300">{modules?.visual_similarity?.similarity_score || 0}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Targets Inspected</span>
                  <span className="font-mono text-slate-300">{modules?.visual_similarity?.inspected_targets_count || 11} Brands</span>
                </div>
              </div>
            </div>

            {/* 5. JavaScript Static & Dynamic Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  5. JS Static & Dynamic Analysis
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.js_analysis?.has_keylogger || modules?.js_analysis?.has_obfuscated_js ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.js_analysis?.risk_level || 'SAFE'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Keylogger Interceptor</span>
                  <span className="font-mono text-slate-200">{modules?.js_analysis?.has_keylogger ? 'DETECTED' : 'Clean'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Obfuscated JS</span>
                  <span className="font-mono text-slate-200">{modules?.js_analysis?.has_obfuscated_js ? 'Detected' : 'Clean'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Crypto Miner</span>
                  <span className="font-mono text-slate-300">{modules?.js_analysis?.has_crypto_miner ? 'Detected' : 'Clean'}</span>
                </div>
              </div>
            </div>

            {/* 6. HTML & Login Form Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  6. HTML & Login Form Analysis
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.html_security?.findings?.hidden_iframes !== undefined && modules.html_security.findings.hidden_iframes > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.html_security?.findings?.hidden_iframes !== undefined && modules.html_security.findings.hidden_iframes > 0 ? 'Suspicious' : 'Clean'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Hidden 0px Iframes</span>
                  <span className="font-mono font-bold text-slate-200">{modules?.html_security?.findings?.hidden_iframes || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">JS Redirects</span>
                  <span className="font-mono text-slate-300">{modules?.html_security?.findings?.js_redirects ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* 7. SSL, DNS & Domain Intelligence */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  7. SSL, DNS & Domain Intelligence
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Grade {modules?.ssl_dns_intelligence?.trust_grade || 'A'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Newly Registered Domain</span>
                  <span className="font-mono font-bold text-slate-200">{modules?.ssl_dns_intelligence?.is_newly_registered ? 'Yes (<30 Days)' : 'No (Established)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">SSL Certificate</span>
                  <span className="font-bold text-emerald-400">{modules?.ssl_dns_intelligence?.ssl_valid ? 'Valid' : 'Invalid'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">MX Mail Records</span>
                  <span className="font-mono text-slate-300">{modules?.ssl_dns_intelligence?.has_mx_records ? 'Configured' : 'Missing'}</span>
                </div>
              </div>
            </div>

            {/* 8. Behavioral Sandbox */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  8. Behavioral Sandbox Simulator
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.behavioral_sandbox?.suspicious_behavior_detected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.behavioral_sandbox?.risk_rating || 'LOW'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Auto File Download Trigger</span>
                  <span className="font-mono font-bold text-slate-200">{modules?.behavioral_sandbox?.auto_download_triggered ? 'TRIGGERED' : 'Clean'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Alert Dialog Loop</span>
                  <span className="font-mono text-slate-300">{modules?.behavioral_sandbox?.has_alert_loop ? 'Detected' : 'Clean'}</span>
                </div>
              </div>
            </div>

            {/* 9. AI Vision & Content Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  9. AI Vision & Content Analysis
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${modules?.ai_vision_engine?.has_phishing_intent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {modules?.ai_vision_engine?.has_phishing_intent ? 'Phishing Intent' : 'Clean Text'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Phishing NLP Text Score</span>
                  <span className="font-mono font-bold text-cyan-300">{modules?.ai_vision_engine?.content_phishing_score || 0}/100</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Layout Classification</span>
                  <span className="font-mono text-slate-300">{modules?.ai_vision_engine?.layout_classification || 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* 10. AI Risk Scoring & Explanation */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  10. AI Risk Scoring & Explanation Engine
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Score: {report.risk_score}/100
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Overall Trust Status</span>
                  <span className="font-bold uppercase text-emerald-400">{report.status}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Total Deductions</span>
                  <span className="font-mono text-rose-400">-{modules?.ai_risk_engine?.breakdown?.total_deductions || 0} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: DNS, WHOIS & SSL */}
      {activeTab === 'technical' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SSL Certificate */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              SSL/TLS Certificate Inspection
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Validity Status</span>
                <span className={`font-bold ${modules?.ssl?.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {modules?.ssl?.valid ? 'VALID CERTIFICATE' : 'INVALID / EXPIRED'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Issuer</span>
                <span className="font-semibold text-slate-200">{modules?.ssl?.issuer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">TLS Protocol Version</span>
                <span className="font-mono text-cyan-300">{modules?.ssl?.tls_version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Expiration Date</span>
                <span className="font-mono text-slate-200">{modules?.ssl?.expiry_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Self-Signed Check</span>
                <span className="font-semibold text-slate-200">{modules?.ssl?.is_self_signed ? 'Yes (Untrusted)' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* WHOIS Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              WHOIS Domain Metadata
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Domain Age</span>
                <span className="font-bold text-cyan-300">
                  {modules?.whois?.domain_age_days ? `${modules.whois.domain_age_days} Days (${(modules.whois.domain_age_days / 365).toFixed(1)} Yrs)` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Registrar</span>
                <span className="font-semibold text-slate-200">{modules?.whois?.registrar}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Registration Date</span>
                <span className="font-mono text-slate-200">{modules?.whois?.creation_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Expiry Date</span>
                <span className="font-mono text-slate-200">{modules?.whois?.expiration_date || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* DNS Records Table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-cyan-400" />
              DNS Resolution Records
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Resolved Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {modules?.dns?.records && Object.entries(modules.dns.records).map(([type, records]) => (
                    <tr key={type} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-cyan-400">{type}</td>
                      <td className="p-3 text-slate-300">
                        {(records as string[]).length > 0 ? (
                          <div className="space-y-1">
                            {(records as string[]).map((r, i) => (
                              <div key={i}>{r}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No records found</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security Headers & HTML */}
      {activeTab === 'headers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Headers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Security Headers Grade
              </h3>
              <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold text-base border border-cyan-500/30">
                Grade: {modules?.security_headers?.grade}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {modules?.security_headers?.header_grades && Object.entries(modules.security_headers.header_grades).map(([header, val]) => (
                <div key={header} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{header}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] ${(val as string).includes('Present') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    {val as string}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Static HTML Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              HTML DOM Heuristics & Script Findings
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Hidden Iframes</span>
                <span className="font-mono font-bold text-slate-200">{modules?.html_security?.findings?.hidden_iframes}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Obfuscated JavaScript</span>
                <span className={`font-mono font-bold ${modules?.html_security?.findings?.obfuscated_js ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {modules?.html_security?.findings?.obfuscated_js ? 'DETECTED' : 'Clean'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Browser Crypto Miner</span>
                <span className={`font-mono font-bold ${modules?.html_security?.findings?.crypto_miners ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {modules?.html_security?.findings?.crypto_miners ? 'DETECTED' : 'Clean'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">JavaScript Location Redirects</span>
                <span className="font-mono font-bold text-slate-200">
                  {modules?.html_security?.findings?.js_redirects ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Threat Intelligence */}
      {activeTab === 'threat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Multi-Provider Threat Intelligence Feeds
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Flagged Vendors: <strong className="text-rose-400">{modules?.threat_intelligence?.flagged_count || 0}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules?.threat_intelligence?.providers && Object.entries(modules.threat_intelligence.providers).map(([provider, res]) => {
              const strRes = res as string;
              const isMal = strRes.includes('Malicious') || strRes.includes('Flagged') || strRes.includes('Phishing');
              return (
                <div key={provider} className={`p-4 rounded-xl border space-y-2 ${isMal ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="text-xs font-bold text-slate-200">{provider}</div>
                  <div className={`text-xs font-mono font-bold ${isMal ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {strRes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Ask SafeSurf AI Chat */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <AiChatbot reportData={report} />
        </div>
      )}
    </div>
  );
}
