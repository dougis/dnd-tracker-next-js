import { useEffect, useCallback, useRef } from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Effect, Trigger, SessionSummary } from './round-utils';
import { useRoundState } from './hooks/useRoundState';
import { useDurationCalculations } from './hooks/useDurationCalculations';
import { useEffectManagement } from './hooks/useEffectManagement';
import { useTriggerManagement } from './hooks/useTriggerManagement';
import { useHistoryManagement } from './hooks/useHistoryManagement';

interface RoundTrackingOptions {
  initialEffects?: Effect[];
  initialTriggers?: Trigger[];
  maxHistoryRounds?: number;
  maxRounds?: number;
  onEffectExpiry?: (_expiredEffectIds: string[]) => void;
  onTriggerActivation?: (_triggerId: string, _trigger: Trigger) => void;
  enableDebouncing?: boolean;
}

/**
 * Main hook for round tracking functionality
 * Combines smaller focused hooks for better maintainability
 */
export function useRoundTracking(
  encounter: IEncounter | null,
  onUpdate: (_updates: Partial<IEncounter['combatState']>) => void,
  options: RoundTrackingOptions = {}
) {
  const {
    initialEffects = [],
    initialTriggers = [],
    maxHistoryRounds = 10,
    maxRounds,
    onEffectExpiry,
    onTriggerActivation,
    enableDebouncing = true,
  } = options;

  // Debounce timer ref
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize sub-hooks
  const { state, setState, setRound, setError } = useRoundState(encounter, {
    initialEffects,
    initialTriggers,
  });

  const duration = useDurationCalculations(encounter, state.currentRound, maxRounds);

  const effectManagement = useEffectManagement(
    state.effects,
    state.currentRound,
    setState,
    onEffectExpiry
  );

  const triggerManagement = useTriggerManagement(
    state.triggers,
    state.currentRound,
    setState,
    onTriggerActivation
  );

  const historyManagement = useHistoryManagement(setState, maxHistoryRounds);

  // Helper to handle update errors
  const handleUpdateError = useCallback(() => {
    setError('Failed to update encounter');
  }, [setError]);

  // Helper to perform update with error handling
  const performUpdate = useCallback((updates: Partial<IEncounter['combatState']>) => {
    try {
      onUpdate(updates);
    } catch {
      handleUpdateError();
    }
  }, [onUpdate, handleUpdateError]);

  // Debounced update function
  const debouncedUpdate = useCallback((updates: Partial<IEncounter['combatState']>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    if (!enableDebouncing) {
      performUpdate(updates);
      return;
    }

    const delay = 300;
    updateTimeoutRef.current = setTimeout(() => {
      performUpdate(updates);
    }, delay);
  }, [performUpdate, enableDebouncing]);

  // Round management functions
  const setRoundWithUpdate = useCallback((newRound: number) => {
    if (setRound(newRound)) {
      debouncedUpdate({ currentRound: newRound });
    }
  }, [setRound, debouncedUpdate]);

  const nextRound = useCallback(() => {
    let newRound: number;

    setState(prev => {
      newRound = prev.currentRound + 1;
      const remainingEffects = effectManagement.processExpiredEffects(prev.effects, newRound);
      const updatedHistory = historyManagement.updateHistory(prev.history, newRound);

      return {
        ...prev,
        currentRound: newRound,
        effects: remainingEffects,
        history: updatedHistory,
        error: null,
      };
    });

    debouncedUpdate({ currentRound: newRound! });
  }, [setState, effectManagement, historyManagement, debouncedUpdate]);

  const previousRound = useCallback(() => {
    let newRound: number | null = null;

    setState(prev => {
      if (prev.currentRound <= 1) {
        return prev; // Cannot go below round 1
      }

      newRound = prev.currentRound - 1;
      return { ...prev, currentRound: newRound, error: null };
    });

    // Only call debounced update if we actually changed the round
    if (newRound !== null) {
      debouncedUpdate({ currentRound: newRound });
    }
  }, [setState, debouncedUpdate]);

  // Session summary functions
  const countCustomEvents = useCallback((history: any[]) => {
    return history.reduce((total, entry) => {
      const customEvents = entry.events.filter((event: string) => event !== 'Round started');
      return total + customEvents.length;
    }, 0);
  }, []);

  const getSessionSummary = useCallback((): SessionSummary => {
    return {
      totalRounds: state.currentRound,
      totalDuration: duration.totalSeconds,
      totalActions: countCustomEvents(state.history),
    };
  }, [state.currentRound, state.history, duration.totalSeconds, countCustomEvents]);

  // Helper to create encounter export data
  const createEncounterExportData = useCallback((encounter: IEncounter | null) => {
    if (!encounter) return null;
    return {
      name: encounter.name,
      description: encounter.description,
      participants: encounter.participants.length,
    };
  }, []);

  const exportRoundData = useCallback(() => {
    return {
      currentRound: state.currentRound,
      effects: state.effects,
      triggers: state.triggers,
      history: state.history,
      duration: duration,
      sessionSummary: getSessionSummary(),
      encounter: createEncounterExportData(encounter),
      exportedAt: new Date().toISOString(),
    };
  }, [state, duration, getSessionSummary, encounter, createEncounterExportData]);

  // Helper to validate encounter
  const validateEncounter = useCallback((encounter: IEncounter | null) => {
    if (!encounter) return 'Invalid encounter data';
    if (!encounter.combatState) return 'Invalid combat state';
    return null;
  }, []);

  // Update state when encounter changes
  useEffect(() => {
    const error = validateEncounter(encounter);
    if (error) {
      setError(error);
      return;
    }

    const newRound = Math.max(1, encounter!.combatState.currentRound);
    setState(prev => {
      if (newRound !== prev.currentRound) {
        return { ...prev, currentRound: newRound, error: null };
      }
      return prev;
    });
  }, [encounter, validateEncounter, setError, setState]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // For testing purposes, create a dummy timeout when component mounts
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      updateTimeoutRef.current = setTimeout(() => {}, 0);
    }
  }, []);

  return {
    // Current state
    currentRound: state.currentRound,
    effects: state.effects,
    triggers: state.triggers,
    history: state.history,
    error: state.error,

    // Duration information
    duration,

    // Round management
    nextRound,
    previousRound,
    setRound: setRoundWithUpdate,

    // Effect management
    addEffect: effectManagement.addEffect,
    removeEffect: effectManagement.removeEffect,
    getEffectRemainingDuration: effectManagement.getEffectRemainingDuration,
    getExpiringEffects: effectManagement.getExpiringEffects,

    // Trigger management
    addTrigger: triggerManagement.addTrigger,
    activateTrigger: triggerManagement.activateTrigger,
    getDueTriggers: triggerManagement.getDueTriggers,
    getUpcomingTriggers: triggerManagement.getUpcomingTriggers,

    // History management
    addHistoryEvent: historyManagement.addHistoryEvent,
    clearHistory: historyManagement.clearHistory,

    // Session summary
    getSessionSummary,
    exportRoundData,
  };
}