import React from 'react';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

export function UnauthenticatedState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">Please sign in to access your settings.</div>
    </div>
  );
}

interface SettingsContentProps {
  children: React.ReactNode;
}

export function SettingsContent({ children }: SettingsContentProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </header>
      {children}
    </main>
  );
}