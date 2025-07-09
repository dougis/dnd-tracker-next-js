import { useState, useCallback } from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Effect, Trigger, validateRoundNumber } from '../round-utils';

interface HistoryEntry {
  round: number;
  events: string[];
  timestamp?: Date;
}

interface RoundTrackingState {
  currentRound: number;
  effects: Effect[];
  triggers: Trigger[];
  history: HistoryEntry[];
  error: string | null;
}

interface RoundTrackingOptions {
  initialEffects?: Effect[];
  initialTriggers?: Trigger[];
}

/**
 * Hook for managing round tracking state
 */
export function useRoundState(
  encounter: IEncounter | null,
  options: RoundTrackingOptions = {}
) {
  const { initialEffects = [], initialTriggers = [] } = options;

  // Helper to create initial state
  const createInitialState = useCallback((): RoundTrackingState => {
    const defaultState = {
      currentRound: 1,
      effects: [...initialEffects],
      triggers: [...initialTriggers],
      history: [],
    };

    if (!encounter) {
      return { ...defaultState, error: 'Invalid encounter data' };
    }

    if (!encounter.combatState) {
      return { ...defaultState, error: 'Invalid combat state' };
    }

    return {
      ...defaultState,
      currentRound: Math.max(1, encounter.combatState.currentRound),
      error: null,
    };
  }, [encounter, initialEffects, initialTriggers]);

  // Initialize state
  const [state, setState] = useState<RoundTrackingState>(createInitialState);

  // Basic round management
  const setRound = useCallback((newRound: number) => {
    if (!validateRoundNumber(newRound)) {
      setState(prev => ({
        ...prev,
        error: 'Round must be at least 1',
      }));
      return false;
    }

    setState(prev => ({ ...prev, currentRound: newRound, error: null }));
    return true;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => prev.error ? { ...prev, error: null } : prev);
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    state,
    setState,
    setRound,
    clearError,
    setError,
  };
}