'use client';

import { useState, useCallback, useMemo } from 'react';
import type { EncounterListItem } from '../types';

interface UseEncounterSelectionReturn {
  selectedEncounters: string[];
  selectAll: () => void;
  selectEncounter: (_id: string) => void;
  clearSelection: () => void;
  isAllSelected: boolean;
  hasSelection: boolean;
}

export function useEncounterSelection(
  encounters: EncounterListItem[]
): UseEncounterSelectionReturn {
  const [selectedEncounters, setSelectedEncounters] = useState<string[]>([]);

  const selectAll = useCallback(() => {
    if (selectedEncounters.length === encounters.length) {
      // If all are selected, deselect all
      setSelectedEncounters([]);
    } else {
      // Select all encounters
      setSelectedEncounters(encounters.map(encounter => encounter.id));
    }
  }, [encounters, selectedEncounters]);

  const selectEncounter = useCallback((id: string) => {
    setSelectedEncounters(prev => {
      if (prev.includes(id)) {
        // Remove from selection
        return prev.filter(encounterId => encounterId !== id);
      } else {
        // Add to selection
        return [...prev, id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEncounters([]);
  }, []);

  const isAllSelected = useMemo(() => {
    return encounters.length > 0 && selectedEncounters.length === encounters.length;
  }, [encounters.length, selectedEncounters.length]);

  const hasSelection = useMemo(() => {
    return selectedEncounters.length > 0;
  }, [selectedEncounters.length]);

  // Clear selection when encounters change (e.g., on filter change)
  useState(() => {
    setSelectedEncounters(prev =>
      prev.filter(id => encounters.some(encounter => encounter.id === id))
    );
  });

  return {
    selectedEncounters,
    selectAll,
    selectEncounter,
    clearSelection,
    isAllSelected,
    hasSelection,
  };
}