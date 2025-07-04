import { ReactNode } from 'react';

interface GridLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared responsive grid layout for encounter components
 * Eliminates duplication of grid classes across components
 */
export function GridLayout({ children, className = "" }: GridLayoutProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
}