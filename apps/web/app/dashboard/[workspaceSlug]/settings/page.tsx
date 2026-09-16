'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ApiClient } from '../../../../lib/api-client';
import { SubscriptionTier, WorkspaceRole } from '@repo/types';
import { Settings, Shield, Sparkles, Check, AlertOctagon } from 'lucide-react';

export default function SettingsPage() {
  const params = useParams();
  const slug = params.workspaceSlug as string;

  const [workspace, setWorkspace] = useState<any>(null);
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');
  const [wsName, setWsName] = useState('');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('FREE');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = () => {
    const email = localStorage.getItem('user_email') || 'owner@skyport.io';
    ApiClient.getWorkspaceBySlug(slug, email)
      .then((res) => {
        setWorkspace(res.workspace);
        setRole(res.role);
        setWsName(res.workspace.name);
        setSelectedTier(res.workspace.tier);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleUpdate = async (tierOverride?: SubscriptionTier) => {
    const email = localStorage.getItem('user_email') || 'owner@skyport.io';
    setSaving(true);
    setMessage('');

    try {
      const updated = await ApiClient.updateWorkspace(
        slug,
        { name: wsName, tier: tierOverride || selectedTier },
        email
      );
      setWorkspace(updated);
      setSelectedTier(updated.tier);
      setMessage('Workspace settings successfully updated!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const isOwner = role === 'OWNER';

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Workspace Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure workspace details, subscription plans, and tenant limits.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
          {message}
        </div>
      )}

      {/* General Settings */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">General Information</h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-300">Workspace Name</label>
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              disabled={!isOwner}
              className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Workspace Slug</label>
            <input
              type="text"
              value={slug}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-sm font-mono cursor-not-allowed"
            />
          </div>

          {isOwner && (
            <button
              onClick={() => handleUpdate()}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Subscription Plans & Usage Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE */}
          <div className={`glass-card p-6 rounded-2xl border ${selectedTier === 'FREE' ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'} space-y-4 relative`}>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Starter</span>
              <h3 className="text-xl font-bold text-white mt-1">FREE</h3>
              <div className="text-2xl font-extrabold text-white mt-2">$0 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>Up to 5 Users</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>5,000 API reqs/day</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>2,000 MB Storage</span></li>
            </ul>
            {isOwner && (
              <button
                onClick={() => handleUpdate('FREE')}
                disabled={selectedTier === 'FREE' || saving}
                className="w-full py-2 rounded-lg text-xs font-semibold border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white"
              >
                {selectedTier === 'FREE' ? 'Current Plan' : 'Downgrade to Free'}
              </button>
            )}
          </div>

          {/* PRO */}
          <div className={`glass-card p-6 rounded-2xl border ${selectedTier === 'PRO' ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'} space-y-4 relative`}>
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase">Growth</span>
              <h3 className="text-xl font-bold text-white mt-1">PRO</h3>
              <div className="text-2xl font-extrabold text-white mt-2">$49 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>Up to 25 Users</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>25,000 API reqs/day</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>10,000 MB Storage</span></li>
            </ul>
            {isOwner && (
              <button
                onClick={() => handleUpdate('PRO')}
                disabled={selectedTier === 'PRO' || saving}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
              >
                {selectedTier === 'PRO' ? 'Current Plan' : 'Select Pro Plan'}
              </button>
            )}
          </div>

          {/* ENTERPRISE */}
          <div className={`glass-card p-6 rounded-2xl border ${selectedTier === 'ENTERPRISE' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800'} space-y-4 relative`}>
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase">Scale</span>
              <h3 className="text-xl font-bold text-white mt-1">ENTERPRISE</h3>
              <div className="text-2xl font-extrabold text-white mt-2">$299 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>Up to 100 Users</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>100,000 API reqs/day</span></li>
              <li className="flex items-center space-x-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>50,000 MB Storage</span></li>
            </ul>
            {isOwner && (
              <button
                onClick={() => handleUpdate('ENTERPRISE')}
                disabled={selectedTier === 'ENTERPRISE' || saving}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
              >
                {selectedTier === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade to Enterprise'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
