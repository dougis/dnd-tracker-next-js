import React from 'react';

interface IconProps {
  className?: string;
}

interface BaseIconProps extends IconProps {
  children: React.ReactNode;
}

function BaseIcon({ children, className = "h-4 w-4" }: BaseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={className}
    >
      {children}
    </svg>
  );
}

export function UserIcon({ className = "h-4 w-4 text-muted-foreground" }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </BaseIcon>
  );
}

export function SwordIcon({ className = "h-4 w-4 text-muted-foreground" }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </BaseIcon>
  );
}

export function ActivityIcon({ className = "h-4 w-4 text-muted-foreground" }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
    </BaseIcon>
  );
}