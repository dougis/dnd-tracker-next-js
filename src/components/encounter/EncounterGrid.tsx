'use client';

import { EncounterCard } from './EncounterCard';
import { LoadingCard } from '@/components/shared/LoadingCard';
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-medium mb-2">No encounters found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first encounter to get started organizing your combat sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {encounters.map((encounter) => (
        <EncounterCard
          key={encounter.id}
          encounter={encounter}
          isSelected={selectedEncounters.includes(encounter.id)}
          onSelect={onSelectEncounter}
          onRefetch={onRefetch}
        />
      ))}
    </div>
  );
}