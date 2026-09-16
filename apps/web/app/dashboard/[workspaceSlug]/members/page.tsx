'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ApiClient } from '../../../../lib/api-client';
import { WorkspaceMember, WorkspaceRole } from '@repo/types';
import { Users, UserPlus, Shield, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function MembersPage() {
  const params = useParams();
  const slug = params.workspaceSlug as string;

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [userRole, setUserRole] = useState<WorkspaceRole>('MEMBER');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('MEMBER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    const email = localStorage.getItem('user_email') || 'owner@skyport.io';
    setLoading(true);

    Promise.all([
      ApiClient.getWorkspaceBySlug(slug, email),
      ApiClient.getMembers(slug, email),
    ])
      .then(([wsRes, membersRes]) => {
        setUserRole(wsRes.role);
        setMembers(membersRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = localStorage.getItem('user_email') || 'owner@skyport.io';
    setSubmitting(true);
    setError('');

    try {
      await ApiClient.inviteMember(slug, { email: inviteEmail, role: inviteRole }, email);
      setModalOpen(false);
      setInviteEmail('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to invite member');
    } finally {
      setSubmitting(false);
    }
  };

  const canInvite = userRole === 'OWNER' || userRole === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Workspace Members</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage user roles and permissions within <span className="text-slate-200 font-semibold">{slug}</span>.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {!canInvite && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            You are currently logged in with role <strong className="uppercase">{userRole}</strong>. RBAC restrictions allow only <strong>OWNER</strong> or <strong>ADMIN</strong> roles to send invitations.
          </span>
        </div>
      )}

      {/* Members Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-indigo-400">
                      {m.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{m.user?.name}</div>
                      <div className="text-xs text-slate-400">{m.user?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        m.role === 'OWNER'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : m.role === 'ADMIN'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-emerald-400 font-medium inline-flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Invite Team Member</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="colleague@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="MEMBER">Member (Standard Access)</option>
                  <option value="ADMIN">Admin (Can Invite & Edit)</option>
                  <option value="OWNER">Owner (Full Privileges)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
