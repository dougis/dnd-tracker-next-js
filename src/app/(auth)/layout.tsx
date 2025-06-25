import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - D&D Encounter Tracker',
  description:
    'Sign in or register to access your D&D Encounter Tracker account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
