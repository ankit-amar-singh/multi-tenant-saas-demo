import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkyPort Multi-Tenant SaaS Portal',
  description: 'Enterprise Multi-Tenant SaaS platform demonstrating workspace isolation, CASL RBAC, usage analytics, and REST API architecture.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 font-sans min-h-screen glow-gradient">
        {children}
      </body>
    </html>
  );
}
