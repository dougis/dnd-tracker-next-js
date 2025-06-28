import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { auth } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'D&D Encounter Tracker',
    description: 'A comprehensive tool for managing D&D combat encounters',
};

export default async function RootLayout({
    children,
}: {
  children: React.ReactNode;
}) {

    const session = await auth();

    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProvider session={session}>
                    <ThemeProvider defaultTheme="system" storageKey="dnd-tracker-theme">
                        <AppLayout>{children}</AppLayout>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );

}
