'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ApiClient } from '../../../../lib/api-client';
import { AuditLogEntry } from '@repo/types';
import { ScrollText, Search, ShieldAlert, Clock, Terminal } from 'lucide-react';

export default function AuditLogsPage() {
  const params = useParams();
  const slug = params.workspaceSlug as string;

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('user_email') || 'owner@skyport.io';
    setLoading(true);

    ApiClient.getAuditLogs(slug, email)
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message || 'Access denied'))
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ScrollText className="w-6 h-6 text-indigo-400" />
            <span>Workspace Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable activity logs recording security events and administrative actions in <span className="font-semibold text-slate-200">{slug}</span>.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or user..."
            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl glass-card border border-red-500/30 bg-red-500/10 text-red-300 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Permission Required</span>
          </div>
          <p className="text-sm text-red-200">
            Audit log streams contain sensitive operational telemetry and require <strong>ADMIN</strong> or <strong>OWNER</strong> role permissions.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Actor</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Resource / Payload</th>
                  <th className="px-6 py-4 font-semibold text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-indigo-300 font-sans font-semibold">
                      {log.actorName} <span className="text-slate-500 font-normal">({log.actorEmail})</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-sans">{log.resource}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
