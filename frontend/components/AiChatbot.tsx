'use client';

import React, { useState } from 'react';
import { ScanReport } from '@/lib/types';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface AiChatbotProps {
  reportData: ScanReport;
}

export default function AiChatbot({ reportData }: AiChatbotProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your SafeSurf AI Security Assistant. Ask me anything about the scan report for ${reportData.domain} (Trust Score: ${reportData.risk_score}/100).`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let aiResponse = `Based on the security audit for ${reportData.domain}: `;
      const query = userMsg.toLowerCase();

      if (query.includes('ssl') || query.includes('certificate')) {
        const ssl = reportData.report_data?.modules.ssl;
        aiResponse += `The SSL certificate status is ${ssl?.valid ? 'Valid' : 'Invalid'}, issued by ${ssl?.issuer} using ${ssl?.tls_version}.`;
      } else if (query.includes('safe') || query.includes('score') || query.includes('why')) {
        aiResponse += reportData.summary || `The site scored ${reportData.risk_score}/100 and is classified as ${reportData.status.toUpperCase()}.`;
      } else if (query.includes('dns') || query.includes('ip')) {
        const hosting = reportData.report_data?.modules.hosting;
        aiResponse += `The website resolves to IP address ${hosting?.ip_address} hosted by ${hosting?.isp} in ${hosting?.city}, ${hosting?.country}.`;
      } else {
        aiResponse += `The website received a ${reportData.status.toUpperCase()} rating. Key findings include ${reportData.report_data?.modules.ai_risk_engine.deductions.length || 0} risk flags and ${reportData.report_data?.modules.ai_risk_engine.bonuses.length || 0} trust signals.`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <h3 className="text-base font-bold text-slate-100">SafeSurf AI Chatbot Assistant</h3>
      </div>

      <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <Bot className="w-4 h-4 animate-spin text-cyan-400" />
            SafeSurf AI is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI e.g. 'Is the SSL certificate valid?' or 'Why was this flagged?'"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-accent-foreground font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
}
