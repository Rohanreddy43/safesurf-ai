'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Terminal, Globe, Lock, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { User, ScanReport } from '@/lib/types';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [maliciousDomains, setMaliciousDomains] = useState<ScanReport[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'malicious' | 'logs'>('users');

  useEffect(() => {
    Promise.all([
      api.getAdminUsers(),
      api.getMaliciousDomains(),
      api.getSystemLogs()
    ]).then(([uData, mData, lData]) => {
      if (uData) setUsers(uData);
      if (mData) setMaliciousDomains(mData);
      if (lData) setLogs(lData);
    }).catch(() => {});
  }, []);

  const handleToggleUser = async (user: User) => {
    try {
      const nextActive = !user.is_active;
      await api.toggleUserStatus(user.id, nextActive);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: nextActive } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Admin Control Center
        </h1>
        <p className="text-xs text-slate-400">User management, global threat intelligence feeds, and system diagnostics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('malicious')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'malicious' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Flagged Malicious Domains
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'logs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          System Diagnostic Logs
        </button>
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Active Status</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-500">#{u.id}</td>
                    <td className="p-3 font-semibold text-slate-200">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUser(u)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          u.is_active ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Malicious Domains */}
      {activeTab === 'malicious' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Blacklisted Domains Feed</h3>
          <div className="space-y-2 text-xs font-mono">
            {maliciousDomains.length > 0 ? (
              maliciousDomains.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-400">{m.domain}</span>
                    <span className="text-slate-500 block text-[10px]">{m.url}</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 font-bold border border-rose-500/30">
                    Score: {m.risk_score}/100 ({m.status.toUpperCase()})
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 italic font-sans">No malicious domains flagged yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2 font-mono text-xs text-slate-300">
          {logs.map((l, i) => (
            <div key={i} className="p-2 border-b border-slate-800 flex gap-3">
              <span className="text-slate-500 font-mono">{l.timestamp}</span>
              <span className="text-cyan-400 font-bold">[{l.level}]</span>
              <span className="text-slate-400">[{l.service}]</span>
              <span className="text-slate-200">{l.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
