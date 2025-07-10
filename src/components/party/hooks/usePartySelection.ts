'use client';

import { useState, useCallback, useMemo } from 'react';
import type { PartyListItem } from '../types';

interface UsePartySelectionReturn {
  selectedParties: string[];
  selectAll: () => void;
  selectParty: (_id: string) => void;
  clearSelection: () => void;
  isAllSelected: boolean;
  hasSelection: boolean;
}

export function usePartySelection(parties: PartyListItem[]): UsePartySelectionReturn {
  const [selectedParties, setSelectedParties] = useState<string[]>([]);

  const selectAll = useCallback(() => {
    if (selectedParties.length === parties.length) {
      setSelectedParties([]);
    } else {
      setSelectedParties(parties.map(party => party.id));
    }
  }, [selectedParties.length, parties]);

  const selectParty = useCallback((_id: string) => {
    setSelectedParties(prev => {
      if (prev.includes(_id)) {
        return prev.filter(partyId => partyId !== _id);
      } else {
        return [...prev, _id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedParties([]);
  }, []);

  const isAllSelected = useMemo(() => {
    return parties.length > 0 && selectedParties.length === parties.length;
  }, [parties.length, selectedParties.length]);

  const hasSelection = useMemo(() => {
    return selectedParties.length > 0;
  }, [selectedParties.length]);

  return {
    selectedParties,
    selectAll,
    selectParty,
    clearSelection,
    isAllSelected,
    hasSelection,
  };
}