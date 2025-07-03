import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryStats {
  characters?: number;
  encounters?: number;
  activeSessions?: number;
}

interface SummaryCardsProps {
  stats: SummaryStats;
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  testId: string;
}

function SummaryCard({ title, value, icon, testId }: SummaryCardProps) {
  return (
    <Card data-testid={`${testId}-card`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle data-testid={`${testId}-title`} className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div data-testid={`${testId}-value`} className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className="h-4 w-4 text-muted-foreground"
  >
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SwordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className="h-4 w-4 text-muted-foreground"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ActivityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className="h-4 w-4 text-muted-foreground"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
  </svg>
);

export function SummaryCards({ stats }: SummaryCardsProps) {
  const {
    characters = 0,
    encounters = 0,
    activeSessions = 0
  } = stats;

  return (
    <div data-testid="summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        title="Characters"
        value={characters}
        icon={<UserIcon />}
        testId="characters"
      />
      <SummaryCard
        title="Encounters"
        value={encounters}
        icon={<SwordIcon />}
        testId="encounters"
      />
      <SummaryCard
        title="Active Sessions"
        value={activeSessions}
        icon={<ActivityIcon />}
        testId="active-sessions"
      />
    </div>
  );
}