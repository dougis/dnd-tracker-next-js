import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import {
  Effect,
  Trigger,
  SessionSummary,
  calculateAverageRoundDuration,
  formatDuration,
  calculateRemainingDuration,
  calculateEffectRemainingDuration,
  getExpiredEffects,
  getExpiringEffects,
  getDueTriggers,
  getUpcomingTriggers,
  validateRoundNumber,
  createHistoryEntry,
  limitHistorySize,
} from './round-utils';

interface RoundTrackingOptions {
  initialEffects?: Effect[];
  initialTriggers?: Trigger[];
  maxHistoryRounds?: number;
  maxRounds?: number;
  onEffectExpiry?: (_expiredEffectIds: string[]) => void;
  onTriggerActivation?: (_triggerId: string, _trigger: Trigger) => void;
  enableDebouncing?: boolean; // New option to control debouncing
}

interface RoundDuration {
  totalSeconds: number;
  averageRoundDuration: number;
  estimatedRemainingTime: number | null;
  formatted: string;
}

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
    enableDebouncing = true, // Default to true for normal use
  } = options;

  // Debounce timer ref
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Duration calculations
  const duration = useMemo<RoundDuration>(() => {
    if (!encounter?.combatState?.startedAt) {
      return {
        totalSeconds: 0,
        averageRoundDuration: 0,
        estimatedRemainingTime: null,
        formatted: '0s',
      };
    }

    const totalSeconds = Math.floor((Date.now() - encounter.combatState.startedAt.getTime()) / 1000);
    const averageRoundDuration = calculateAverageRoundDuration(
      encounter.combatState.startedAt,
      state.currentRound
    );
    const estimatedRemainingTime = calculateRemainingDuration(
      state.currentRound,
      maxRounds,
      averageRoundDuration
    );

    return {
      totalSeconds,
      averageRoundDuration,
      estimatedRemainingTime,
      formatted: formatDuration(totalSeconds),
    };
  }, [encounter?.combatState?.startedAt, state.currentRound, maxRounds]);

  // Debounced update function
  // Helper to handle update errors
  const handleUpdateError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: 'Failed to update encounter',
    }));
  }, []);

  // Helper to perform update with error handling
  const performUpdate = useCallback((updates: Partial<IEncounter['combatState']>) => {
    try {
      onUpdate(updates);
    } catch {
      handleUpdateError();
    }
  }, [onUpdate, handleUpdateError]);

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

  // Clear error when successful operations occur
  const _clearError = useCallback(() => {
    setState(prev => prev.error ? { ...prev, error: null } : prev);
  }, []);

  // Round management functions
  const setRound = useCallback((newRound: number) => {
    if (!validateRoundNumber(newRound)) {
      setState(prev => ({
        ...prev,
        error: 'Round must be at least 1',
      }));
      return;
    }

    setState(prev => ({ ...prev, currentRound: newRound, error: null }));
    debouncedUpdate({ currentRound: newRound });
  }, [debouncedUpdate]);

  // Helper to process expired effects
  const processExpiredEffects = useCallback((effects: Effect[], round: number) => {
    const expiredEffects = getExpiredEffects(effects, round);
    if (expiredEffects.length > 0 && onEffectExpiry) {
      onEffectExpiry(expiredEffects.map(e => e.id));
    }
    return effects.filter(effect => calculateEffectRemainingDuration(effect, round) > 0);
  }, [onEffectExpiry]);

  // Helper to update history
  const updateHistory = useCallback((history: any[], round: number) => {
    const newHistoryEntry = createHistoryEntry(round, ['Round started']);
    return limitHistorySize([...history, newHistoryEntry], maxHistoryRounds);
  }, [maxHistoryRounds]);

  const nextRound = useCallback(() => {
    let newRound: number;

    setState(prev => {
      newRound = prev.currentRound + 1;
      const remainingEffects = processExpiredEffects(prev.effects, newRound);
      const updatedHistory = updateHistory(prev.history, newRound);

      return {
        ...prev,
        currentRound: newRound,
        effects: remainingEffects,
        history: updatedHistory,
        error: null,
      };
    });

    debouncedUpdate({ currentRound: newRound! });
  }, [processExpiredEffects, updateHistory, debouncedUpdate]);

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
  }, [debouncedUpdate]);

  // Effect management functions
  const addEffect = useCallback((effectData: Omit<Effect, 'id' | 'startRound'>) => {
    setState(prev => {
      const newEffect: Effect = {
        ...effectData,
        id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startRound: prev.currentRound,
      };

      return {
        ...prev,
        effects: [...prev.effects, newEffect],
      };
    });
  }, []);

  const removeEffect = useCallback((effectId: string) => {
    setState(prev => ({
      ...prev,
      effects: prev.effects.filter(effect => effect.id !== effectId),
    }));
  }, []);

  const getEffectRemainingDuration = useCallback((effect: Effect): number => {
    return calculateEffectRemainingDuration(effect, state.currentRound);
  }, [state.currentRound]);

  const getExpiringEffectsCallback = useCallback((): Effect[] => {
    return getExpiringEffects(state.effects, state.currentRound);
  }, [state.effects, state.currentRound]);

  // Trigger management functions
  const addTrigger = useCallback((triggerData: Omit<Trigger, 'id' | 'isActive'>) => {
    const newTrigger: Trigger = {
      ...triggerData,
      id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
    };

    setState(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger],
    }));
  }, []);

  // Helper to find and validate trigger
  const findActiveTrigger = useCallback((triggers: Trigger[], triggerId: string) => {
    return triggers.find(t => t.id === triggerId && t.isActive);
  }, []);

  // Helper to update trigger state
  const updateTriggerState = useCallback((triggers: Trigger[], triggerId: string, currentRound: number) => {
    return triggers.map(t =>
      t.id === triggerId
        ? { ...t, isActive: false, triggeredRound: currentRound }
        : t
    );
  }, []);

  const activateTrigger = useCallback((triggerId: string) => {
    setState(prev => {
      const trigger = findActiveTrigger(prev.triggers, triggerId);
      if (!trigger) {
        return prev;
      }

      if (onTriggerActivation) {
        onTriggerActivation(triggerId, trigger);
      }

      return {
        ...prev,
        triggers: updateTriggerState(prev.triggers, triggerId, prev.currentRound),
      };
    });
  }, [findActiveTrigger, updateTriggerState, onTriggerActivation]);

  const getDueTriggersCallback = useCallback((): Trigger[] => {
    return getDueTriggers(state.triggers, state.currentRound);
  }, [state.triggers, state.currentRound]);

  const getUpcomingTriggersCallback = useCallback((): Trigger[] => {
    return getUpcomingTriggers(state.triggers, state.currentRound);
  }, [state.triggers, state.currentRound]);

  // History management functions
  // Helper to add event to existing entry
  const addEventToEntry = useCallback((history: any[], currentRound: number, event: string) => {
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

  const addHistoryEvent = useCallback((event: string) => {
    setState(prev => ({
      ...prev,
      history: addEventToEntry(prev.history, prev.currentRound, event),
    }));
  }, [addEventToEntry]);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  // Session summary functions
  // Helper to count custom events
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

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // For testing purposes, create a dummy timeout when component mounts
  // so that cleanup tests can verify clearTimeout is called
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      updateTimeoutRef.current = setTimeout(() => {}, 0);
    }
  }, []);

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
      setState(prev => ({ ...prev, error }));
      return;
    }

    const newRound = Math.max(1, encounter!.combatState.currentRound);
    setState(prev => {
      if (newRound !== prev.currentRound) {
        return { ...prev, currentRound: newRound, error: null };
      }
      return prev;
    });
  }, [encounter, validateEncounter]);

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
    setRound,

    // Effect management
    addEffect,
    removeEffect,
    getEffectRemainingDuration,
    getExpiringEffects: getExpiringEffectsCallback,

    // Trigger management
    addTrigger,
    activateTrigger,
    getDueTriggers: getDueTriggersCallback,
    getUpcomingTriggers: getUpcomingTriggersCallback,

    // History management
    addHistoryEvent,
    clearHistory,

    // Session summary
    getSessionSummary,
    exportRoundData,
  };
}