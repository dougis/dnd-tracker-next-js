'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSidebarPrimaryNavigationItems, getSidebarSecondaryNavigationItems, createIcon, type SidebarNavigationItem } from './shared/navigation-config';
import { UserMenu } from './UserMenu';

interface SidebarProps {
  isOpen: boolean;
  isAuthenticated?: boolean;
}


const NavigationLink = ({
  item,
  isActive,
}: {
  item: SidebarNavigationItem;
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
    <span className="mr-3 flex-shrink-0">{item.icon}</span>
    {item.name}
  </Link>
);

const NavigationSection = ({ items }: { items: SidebarNavigationItem[] }) => {
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

export function Sidebar({ isOpen, isAuthenticated = false }: SidebarProps) {
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
          <NavigationSection items={getSidebarPrimaryNavigationItems(isAuthenticated)} />
          {isAuthenticated && (
            <>
              <div className="my-4 border-t border-border" />
              <NavigationSection items={getSidebarSecondaryNavigationItems()} />
            </>
          )}
        </nav>

        {/* User Menu Footer */}
        <UserMenu />
      </div>
    </div>
  );
}
