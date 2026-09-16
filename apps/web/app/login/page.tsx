'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '../../lib/api-client';
import { Shield, Building2, User, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@skyport.io');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (eEmail?: string) => {
    const targetEmail = eEmail || email;
    setLoading(true);
    setError('');

    try {
      const auth = await ApiClient.login(targetEmail);
      localStorage.setItem('user_email', auth.user.email);
      localStorage.setItem('user_name', auth.user.name);
      localStorage.setItem('auth_response', JSON.stringify(auth));

      const firstWorkspace = auth.workspaces[0]?.workspace.slug || 'acme-global';
      router.push(`/dashboard/${firstWorkspace}`);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 glow-gradient">
      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SkyPort SaaS Portal</h1>
          <p className="mt-2 text-sm text-slate-400">
            Multi-Tenant Enterprise Architecture Demo
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Quick Role Presets for Recruiters */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            ⚡ Quick Recruiter Persona Login
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleLogin('owner@skyport.io')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  OWN
                </div>
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-indigo-300">Ankit Kumar</div>
                  <div className="text-xs text-slate-400">Workspace Owner (Full RBAC Admin)</div>
                </div>
              </div>
              <Shield className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => handleLogin('admin@skyport.io')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  ADM
                </div>
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-indigo-300">Sarah Connor</div>
                  <div className="text-xs text-slate-400">Workspace Admin (Invite Rights)</div>
                </div>
              </div>
              <User className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={() => handleLogin('member@skyport.io')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center font-bold text-xs">
                  MEM
                </div>
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-indigo-300">David Miller</div>
                  <div className="text-xs text-slate-400">Standard Member (Read-Only)</div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111827] px-2 text-slate-500">Or sign in with email</span>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="user@skyport.io"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built with Next.js 14, NestJS, Tailwind & TypeScript</span>
          </p>
        </div>
      </div>
    </div>
  );
}
