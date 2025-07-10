'use client';

import { PartyCard } from '../PartyCard';
import { PartyGridSkeleton } from './PartyGridSkeleton';
import { EmptyState } from './EmptyState';
import type { PartyListItem } from '../types';

interface PartyGridProps {
  parties: PartyListItem[];
  isLoading: boolean;
  selectedParties: string[];
  onSelectParty: (_id: string) => void;
  onRefetch: () => void;
}

export function PartyGrid({
  parties,
  isLoading,
  selectedParties,
  onSelectParty,
  onRefetch
}: PartyGridProps) {
  if (isLoading) {
    return <PartyGridSkeleton />;
  }

  if (parties.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {parties.map((party) => (
        <PartyCard
          key={party.id}
          party={party}
          isSelected={selectedParties.includes(party.id)}
          onSelect={onSelectParty}
          onRefetch={onRefetch}
        />
      ))}
    </div>
  );
}