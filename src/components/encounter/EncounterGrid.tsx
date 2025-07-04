'use client';

import { EncounterCard } from './EncounterCard';
import { GridLoadingState } from './components/LoadingStates';
import { EmptyState } from './components/EmptyState';
import { GridLayout } from './components/GridLayout';
import type { EncounterListItem } from './types';

interface EncounterGridProps {
  encounters: EncounterListItem[];
  isLoading: boolean;
  selectedEncounters: string[];
  onSelectEncounter: (_id: string) => void;
  onRefetch: () => void;
}

export function EncounterGrid({
  encounters,
  isLoading,
  selectedEncounters,
  onSelectEncounter,
  onRefetch,
}: EncounterGridProps) {
  if (isLoading) {
    return <GridLoadingState />;
  }

  if (encounters.length === 0) {
    return <EmptyState />;
  }

  return (
    <GridLayout>
      {encounters.map((encounter) => (
        <EncounterCard
          key={encounter.id}
          encounter={encounter}
          isSelected={selectedEncounters.includes(encounter.id)}
          onSelect={onSelectEncounter}
          onRefetch={onRefetch}
        />
      ))}
    </GridLayout>
  );
}