'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div
        className="border-t border-border p-4"
        data-testid="user-menu"
      >
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const displayName = session.user.name || session.user.email || 'User';
  const displayEmail = session.user.email;

  return (
    <div
      className="border-t border-border p-4"
      data-testid="user-menu"
    >
      <div className="space-y-3">
        {/* User Profile Section */}
        <div className="flex items-center space-x-3">
          <div
            className="h-8 w-8 rounded-full bg-muted"
            data-testid="user-avatar"
          />
          <div
            className="flex-1 min-w-0"
            data-testid="user-info"
          >
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
            {displayEmail && displayName !== displayEmail && (
              <p className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </p>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
          aria-label="Sign Out"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}