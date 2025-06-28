'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from '@/components/theme-toggle';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {

        const checkScreenSize = () => {

            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {

                setSidebarOpen(false);

            }

        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);

    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar for desktop */}
            <Sidebar isOpen={!isMobile} />

            {/* Mobile menu overlay */}
            <MobileMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div
                className={`transition-all duration-300 ${!isMobile ? 'lg:ml-64' : ''}`}
            >
                {/* Top navigation bar */}
                <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
                    <div className="flex h-16 items-center justify-between px-4">
                        {/* Mobile menu button */}
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
                                aria-label="Open menu"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Breadcrumbs */}
                        <div className="flex-1">
                            <Breadcrumbs />
                        </div>

                        {/* Theme toggle and user menu */}
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <button className="rounded-full bg-primary p-2 text-primary-foreground">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );

}
