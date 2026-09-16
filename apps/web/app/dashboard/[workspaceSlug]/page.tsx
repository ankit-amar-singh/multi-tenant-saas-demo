'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ApiClient } from '../../../lib/api-client';
import { Users, Activity, HardDrive, Cpu, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function OverviewPage() {
  const params = useParams();
  const slug = params.workspaceSlug as string;

  const [metrics, setMetrics] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [role, setRole] = useState<string>('MEMBER');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const email = localStorage.getItem('user_email') || 'owner@skyport.io';
    setLoading(true);

    Promise.all([
      ApiClient.getWorkspaceBySlug(slug, email),
      ApiClient.getMetrics(slug, email),
    ])
      .then(([wsRes, metricsRes]) => {
        setWorkspace(wsRes.workspace);
        setRole(wsRes.role);
        setMetrics(metricsRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{workspace?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {workspace?.tier} TIER
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Tenant ID: <span className="font-mono text-slate-300">{workspace?.id}</span> • Active Role: <span className="font-semibold text-emerald-400">{role}</span>
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Members</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.activeUsersCount} <span className="text-xs text-slate-500 font-normal">/ {metrics?.maxUsersQuota}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${(metrics?.activeUsersCount / metrics?.maxUsersQuota) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Traffic / Day</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.apiRequestsToday.toLocaleString()} <span className="text-xs text-slate-500 font-normal">reqs</span>
          </div>
          <p className="text-xs text-emerald-400 flex items-center space-x-1">
            <span>Quota Limit: {metrics?.apiRequestsLimit.toLocaleString()}</span>
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Usage</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics?.storageUsedMb} <span className="text-xs text-slate-500 font-normal">MB</span>
          </div>
          <p className="text-xs text-slate-400">Max limit: {metrics?.storageLimitMb} MB</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Quota</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics?.monthlyQuotaPercent}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${metrics?.monthlyQuotaPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recruiter Technical Feature Matrix */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Architecture & Security Assertions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-indigo-300">Tenant Isolation</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              All queries enforce workspace boundary checks (`WHERE workspaceId = ?`) via NestJS tenant middleware and Prisma models.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-emerald-300">CASL RBAC Enforcement</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Role permissions strictly enforced: OWNER (full write/delete), ADMIN (invites/edits), MEMBER (read-only).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-purple-300">Audit Trail Pipeline</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every workspace mutation emits an immutable audit event recording actor email, IP address, and resource payload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
