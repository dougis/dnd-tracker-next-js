'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  paths: string[];
}

const createIcon = (paths: string[]) => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {paths.map((path, index) => (
      <path
        key={index}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={path}
      />
    ))}
  </svg>
);

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    paths: [
      'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      'M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z',
    ],
  },
  {
    name: 'Characters',
    href: '/characters',
    paths: [
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    ],
  },
  {
    name: 'Parties',
    href: '/parties',
    paths: [
      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    ],
  },
  {
    name: 'Encounters',
    href: '/encounters',
    paths: [
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    ],
  },
  {
    name: 'Combat',
    href: '/combat',
    paths: [
      'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    ],
  },
];

const secondaryItems: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/settings',
    paths: [
      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    ],
  },
  {
    name: 'Help',
    href: '/help',
    paths: [
      'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    ],
  },
];

const NavigationLink = ({
  item,
  isActive,
}: {
  item: NavigationItem;
  isActive: boolean;
}) => (
  <Link
    key={item.name}
    href={item.href as any}
    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    <span className="mr-3 flex-shrink-0">{createIcon(item.paths)}</span>
    {item.name}
  </Link>
);

const NavigationSection = ({ items }: { items: NavigationItem[] }) => {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      {items.map(item => {
        const isActive = pathname === item.href;
        return (
          <NavigationLink key={item.name} item={item} isActive={isActive} />
        );
      })}
    </div>
  );
};

export function Sidebar({ isOpen }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:z-auto">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {createIcon([
                'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
              ])}
            </div>
            <div>
              <h1 className="text-lg font-fantasy font-bold text-foreground">
                D&D Tracker
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavigationSection items={navigationItems} />
          <div className="my-4 border-t border-border" />
          <NavigationSection items={secondaryItems} />
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Demo User
              </p>
              <p className="text-xs text-muted-foreground truncate">
                demo@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
