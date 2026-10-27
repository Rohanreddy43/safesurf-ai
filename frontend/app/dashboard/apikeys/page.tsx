'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { ApiKey } from '@/lib/types';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keyName, setKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchKeys = () => {
    api.getApiKeys()
      .then((data) => setKeys(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      const res = await api.createApiKey(keyName.trim());
      setCreatedKey(res.raw_key);
      setKeyName('');
      fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to create API key. Login required.');
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm('Revoke this API key?')) return;
    try {
      await api.deleteApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Key className="w-6 h-6 text-cyan-400" />
          Developer REST API Keys
        </h1>
        <p className="text-xs text-slate-400">Generate authentication keys for programmatic URL scanning integrations</p>
      </div>

      {/* Create Key Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100">Generate New API Key</h3>
        <form onSubmit={handleCreateKey} className="flex gap-3">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key Name e.g. Production Webhook Scanner"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-accent-foreground font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </form>

        {createdKey && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <p className="text-xs text-emerald-300 font-bold">API Key Generated Successfully! Copy it now (it won't be shown again):</p>
            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <code className="text-xs font-mono text-cyan-300 flex-1 truncate">{createdKey}</code>
              <button
                onClick={() => copyToClipboard(createdKey)}
                className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100">Active API Keys</h3>
        <div className="space-y-3 font-mono text-xs">
          {keys.length > 0 ? (
            keys.map((k) => (
              <div key={k.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{k.name}</div>
                  <div className="text-[11px] text-slate-500">Prefix: {k.prefix}... | Created: {new Date(k.created_at).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleDeleteKey(k.id)}
                  className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  title="Revoke Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 italic font-sans">
              No API keys created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
