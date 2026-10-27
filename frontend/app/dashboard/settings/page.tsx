'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Lock, User, Check } from 'lucide-react';
import { getStoredUser, api } from '@/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !user?.email) return;

    try {
      await api.resetPassword(user.email, newPassword);
      setMsg('Password updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Account & Security Settings
        </h1>
        <p className="text-xs text-slate-400">Manage user credentials and preferences</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-3 pb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Profile Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Email Address</span>
              <span className="text-slate-200 font-bold">{user?.email || 'Guest User'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Role</span>
              <span className="text-cyan-300 font-bold uppercase">{user?.role || 'user'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Change Account Password
          </h3>

          {msg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              {msg}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-3 max-w-md">
            <div>
              <label className="text-xs text-slate-400 block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 text-accent-foreground font-bold text-xs hover:bg-cyan-400 transition-all"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
