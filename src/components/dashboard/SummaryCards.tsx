import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, SwordIcon, ActivityIcon } from './icons';

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