'use client';

import { Card } from '@/components/ui/card';
import { CardHeader } from './card/CardHeader';
import { CardContent } from './card/CardContent';
import type { EncounterCardProps } from './types';

const shouldPreventCardClick = (target: EventTarget | null): boolean => {
  return !!(
    target instanceof HTMLElement &&
    (target.closest('[data-checkbox]') || target.closest('[data-actions]'))
  );
};

const handleEncounterView = (encounterId: string): void => {
  // TODO: Navigate to encounter detail view
  console.log('View encounter:', encounterId);
};

export function EncounterCard({
  encounter,
  isSelected = false,
  onSelect,
  onRefetch,
}: EncounterCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if (shouldPreventCardClick(e.target)) {
      return;
    }
    handleEncounterView(encounter.id);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader
        encounter={encounter}
        isSelected={isSelected}
        onSelect={onSelect}
        onRefetch={onRefetch}
      />
      <CardContent encounter={encounter} />
    </Card>
  );
}