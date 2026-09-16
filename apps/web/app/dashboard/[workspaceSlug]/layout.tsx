'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '../../../lib/api-client';
import { Building2, LayoutDashboard, Users, Settings, ScrollText, ChevronDown, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const slug = params.workspaceSlug as string;

  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentRole, setCurrentRole] = useState<string>('MEMBER');
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    const name = localStorage.getItem('user_name');

    if (!email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setUserName(name || email);

    ApiClient.getWorkspaces(email)
      .then((data) => {
        setWorkspaces(data);
        const currentWs = data.find((w: any) => w.workspace.slug === slug);
        if (currentWs) {
          setCurrentRole(currentWs.role);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const currentWorkspace = workspaces.find((w) => w.workspace.slug === slug)?.workspace;

  const navItems = [
    { label: 'Overview', href: `/dashboard/${slug}`, icon: LayoutDashboard },
    { label: 'Members', href: `/dashboard/${slug}/members`, icon: Users },
    { label: 'Settings', href: `/dashboard/${slug}/settings`, icon: Settings },
    { label: 'Audit Logs', href: `/dashboard/${slug}/audit-logs`, icon: ScrollText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-6">
          <Link href={`/dashboard/${slug}`} className="flex items-center space-x-2 text-indigo-400 font-bold text-lg">
            <Building2 className="w-6 h-6" />
            <span className="hidden sm:inline text-white tracking-tight">SkyPort SaaS</span>
          </Link>

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-sm font-medium text-white transition-all"
            >
              <div className="w-5 h-5 rounded bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {currentWorkspace?.name?.[0] || 'W'}
              </div>
              <span className="max-w-[140px] truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentRole}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {switcherOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl glass-card border border-slate-700 shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Workspaces
                </div>
                {workspaces.map((item) => (
                  <button
                    key={item.workspace.id}
                    onClick={() => {
                      setSwitcherOpen(false);
                      router.push(`/dashboard/${item.workspace.slug}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-800/60 transition-colors ${
                      item.workspace.slug === slug ? 'text-indigo-400 font-semibold bg-indigo-950/20' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{item.workspace.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Tenant: {slug}</span>
          </div>

          <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-white">{userName}</div>
              <div className="text-[10px] text-slate-400">{userEmail}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 hidden md:block p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
