import { useCallback } from 'react';
import { createHistoryEntry, limitHistorySize } from '../round-utils';

interface HistoryEntry {
  round: number;
  events: string[];
  timestamp?: Date;
}

interface HistoryManagementHook {
  addHistoryEvent: (_event: string) => void;
  clearHistory: () => void;
  updateHistory: (_history: HistoryEntry[], _round: number) => HistoryEntry[];
}

/**
 * Hook for managing history during round tracking
 */
export function useHistoryManagement(
  setState: React.Dispatch<React.SetStateAction<any>>,
  maxHistoryRounds: number
): HistoryManagementHook {
  // Helper to add event to existing entry
  const addEventToEntry = useCallback((history: HistoryEntry[], currentRound: number, event: string) => {
    const updatedHistory = [...history];
    const currentRoundEntry = updatedHistory.find(entry => entry.round === currentRound);

    if (currentRoundEntry) {
      currentRoundEntry.events.push(event);
    } else {
      const newEntry = createHistoryEntry(currentRound, [event]);
      updatedHistory.push(newEntry);
    }

    return limitHistorySize(updatedHistory, maxHistoryRounds);
  }, [maxHistoryRounds]);

  // Helper to update history
  const updateHistory = useCallback((history: HistoryEntry[], round: number) => {
    const newHistoryEntry = createHistoryEntry(round, ['Round started']);
    return limitHistorySize([...history, newHistoryEntry], maxHistoryRounds);
  }, [maxHistoryRounds]);

  const addHistoryEvent = useCallback((event: string) => {
    setState((prev: any) => ({
      ...prev,
      history: addEventToEntry(prev.history, prev.currentRound, event),
    }));
  }, [addEventToEntry, setState]);

  const clearHistory = useCallback(() => {
    setState((prev: any) => ({ ...prev, history: [] }));
  }, [setState]);

  return {
    addHistoryEvent,
    clearHistory,
    updateHistory,
  };
}