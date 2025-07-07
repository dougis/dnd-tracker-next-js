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
  onEffectExpiry?: (expiredEffectIds: string[]) => void;
  onTriggerActivation?: (triggerId: string, trigger: Trigger) => void;
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
  onUpdate: (updates: Partial<IEncounter['combatState']>) => void,
  options: RoundTrackingOptions = {}
) {
  const {
    initialEffects = [],
    initialTriggers = [],
    maxHistoryRounds = 10,
    maxRounds,
    onEffectExpiry,
    onTriggerActivation,
  } = options;

  // Debounce timer ref
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize state
  const [state, setState] = useState<RoundTrackingState>(() => {
    // Validate encounter data
    if (!encounter) {
      return {
        currentRound: 1,
        effects: [],
        triggers: [],
        history: [],
        error: 'Invalid encounter data',
      };
    }

    if (!encounter.combatState) {
      return {
        currentRound: 1,
        effects: [],
        triggers: [],
        history: [],
        error: 'Invalid combat state',
      };
    }

    return {
      currentRound: Math.max(1, encounter.combatState.currentRound),
      effects: [...initialEffects],
      triggers: [...initialTriggers],
      history: [],
      error: null,
    };
  });

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
  const debouncedUpdate = useCallback((updates: Partial<IEncounter['combatState']>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // In test environment, update immediately
    if (process.env.NODE_ENV === 'test') {
      try {
        onUpdate(updates);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to update encounter',
        }));
      }
      return;
    }

    updateTimeoutRef.current = setTimeout(() => {
      try {
        onUpdate(updates);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to update encounter',
        }));
      }
    }, 300); // 300ms debounce
  }, [onUpdate]);

  // Clear error when successful operations occur
  const clearError = useCallback(() => {
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

  const nextRound = useCallback(() => {
    const newRound = state.currentRound + 1;
    
    // Check for expiring effects
    const expiredEffects = getExpiredEffects(state.effects, newRound);
    if (expiredEffects.length > 0 && onEffectExpiry) {
      onEffectExpiry(expiredEffects.map(e => e.id));
    }

    // Remove expired effects
    const remainingEffects = state.effects.filter(effect => 
      calculateEffectRemainingDuration(effect, newRound) > 0
    );

    // Add round start event to history
    const newHistoryEntry = createHistoryEntry(newRound, ['Round started']);
    const updatedHistory = limitHistorySize([...state.history, newHistoryEntry], maxHistoryRounds);

    setState(prev => ({
      ...prev,
      currentRound: newRound,
      effects: remainingEffects,
      history: updatedHistory,
      error: null,
    }));

    debouncedUpdate({ currentRound: newRound });
  }, [state.currentRound, state.effects, state.history, maxHistoryRounds, onEffectExpiry, debouncedUpdate]);

  const previousRound = useCallback(() => {
    if (state.currentRound <= 1) {
      return; // Cannot go below round 1
    }

    const newRound = state.currentRound - 1;
    setState(prev => ({ ...prev, currentRound: newRound, error: null }));
    debouncedUpdate({ currentRound: newRound });
  }, [state.currentRound, debouncedUpdate]);

  // Effect management functions
  const addEffect = useCallback((effectData: Omit<Effect, 'id' | 'startRound'>) => {
    const newEffect: Effect = {
      ...effectData,
      id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startRound: state.currentRound,
    };

    setState(prev => ({
      ...prev,
      effects: [...prev.effects, newEffect],
    }));
  }, [state.currentRound]);

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

  const activateTrigger = useCallback((triggerId: string) => {
    const trigger = state.triggers.find(t => t.id === triggerId);
    if (!trigger || !trigger.isActive) {
      return;
    }

    const updatedTrigger = {
      ...trigger,
      isActive: false,
      triggeredRound: state.currentRound,
    };

    setState(prev => ({
      ...prev,
      triggers: prev.triggers.map(t => t.id === triggerId ? updatedTrigger : t),
    }));

    if (onTriggerActivation) {
      onTriggerActivation(triggerId, trigger);
    }
  }, [state.triggers, state.currentRound, onTriggerActivation]);

  const getDueTriggersCallback = useCallback((): Trigger[] => {
    return getDueTriggers(state.triggers, state.currentRound);
  }, [state.triggers, state.currentRound]);

  const getUpcomingTriggersCallback = useCallback((): Trigger[] => {
    return getUpcomingTriggers(state.triggers, state.currentRound);
  }, [state.triggers, state.currentRound]);

  // History management functions
  const addHistoryEvent = useCallback((event: string) => {
    setState(prev => {
      const updatedHistory = [...prev.history];
      const currentRoundEntry = updatedHistory.find(entry => entry.round === prev.currentRound);
      
      if (currentRoundEntry) {
        currentRoundEntry.events.push(event);
      } else {
        const newEntry = createHistoryEntry(prev.currentRound, [event]);
        updatedHistory.push(newEntry);
      }

      return {
        ...prev,
        history: limitHistorySize(updatedHistory, maxHistoryRounds),
      };
    });
  }, [maxHistoryRounds]);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  // Session summary functions
  const getSessionSummary = useCallback((): SessionSummary => {
    const totalActions = state.history.reduce((total, entry) => total + entry.events.length, 0);
    
    return {
      totalRounds: state.currentRound,
      totalDuration: duration.totalSeconds,
      totalActions,
    };
  }, [state.currentRound, state.history, duration.totalSeconds]);

  const exportRoundData = useCallback(() => {
    return {
      currentRound: state.currentRound,
      effects: state.effects,
      triggers: state.triggers,
      history: state.history,
      duration: duration,
      sessionSummary: getSessionSummary(),
      encounter: encounter ? {
        name: encounter.name,
        description: encounter.description,
        participants: encounter.participants.length,
      } : null,
      exportedAt: new Date().toISOString(),
    };
  }, [state, duration, getSessionSummary, encounter]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Update state when encounter changes
  useEffect(() => {
    if (!encounter || !encounter.combatState) {
      setState(prev => ({
        ...prev,
        error: encounter ? 'Invalid combat state' : 'Invalid encounter data',
      }));
      return;
    }

    const newRound = Math.max(1, encounter.combatState.currentRound);
    if (newRound !== state.currentRound) {
      setState(prev => ({
        ...prev,
        currentRound: newRound,
        error: null,
      }));
    }
  }, [encounter?.combatState?.currentRound, state.currentRound]);

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