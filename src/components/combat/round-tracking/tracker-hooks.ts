import { useState, useMemo, useCallback } from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import {
  Effect,
  Trigger,
  formatDuration,
  groupEffectsByParticipant,
  getExpiringEffects,
  getDueTriggers,
  getUpcomingTriggers,
  isOvertime,
  getCombatPhase,
} from './round-utils';

/**
 * Hook for managing round editing state
 */
export function useRoundState(
  currentRound: number,
  onRoundChange: (_round: number) => void
) {
  const [isEditingRound, setIsEditingRound] = useState(false);
  const [editRoundValue, setEditRoundValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleEditRound = useCallback(() => {
    setEditRoundValue(currentRound.toString());
    setEditError(null);
    setIsEditingRound(true);
  }, [currentRound]);

  const handleSaveRound = useCallback(() => {
    const newRound = parseInt(editRoundValue, 10);
    if (isNaN(newRound) || newRound < 1) {
      setEditError('Round must be at least 1');
      return;
    }
    onRoundChange(newRound);
    setIsEditingRound(false);
    setEditError(null);
  }, [editRoundValue, onRoundChange]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingRound(false);
    setEditError(null);
  }, []);

  return {
    isEditingRound,
    editRoundValue,
    editError,
    handleEditRound,
    handleSaveRound,
    handleCancelEdit,
    setEditRoundValue,
  };
}

/**
 * Hook for duration calculations
 */
export function useDurationCalculations(
  encounter: IEncounter | null,
  currentRound: number,
  maxRounds?: number,
  estimatedRoundDuration?: number
) {
  return useMemo(() => {
    if (!encounter?.combatState?.startedAt) {
      return {
        total: 0,
        average: 0,
        remaining: null,
        formatted: '0s',
      };
    }

    const startedAt = encounter.combatState.startedAt;
    const totalSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const averageSeconds = totalSeconds / currentRound;
    const remainingSeconds = maxRounds && estimatedRoundDuration
      ? (maxRounds - currentRound) * (estimatedRoundDuration || averageSeconds)
      : null;

    return {
      total: totalSeconds,
      average: averageSeconds,
      remaining: remainingSeconds,
      formatted: formatDuration(totalSeconds),
    };
  }, [encounter?.combatState?.startedAt, currentRound, maxRounds, estimatedRoundDuration]);
}

/**
 * Hook for effect processing
 */
export function useEffectProcessing(effects: Effect[], currentRound: number) {
  const effectsByParticipant = useMemo(() => {
    return groupEffectsByParticipant(effects);
  }, [effects]);

  const expiringEffects = useMemo(() => {
    return getExpiringEffects(effects, currentRound);
  }, [effects, currentRound]);

  return {
    effectsByParticipant,
    expiringEffects,
  };
}

/**
 * Hook for trigger processing
 */
export function useTriggerProcessing(
  triggers: Trigger[],
  currentRound: number,
  maxRounds?: number
) {
  const dueTriggers = useMemo(() => {
    return getDueTriggers(triggers, currentRound);
  }, [triggers, currentRound]);

  const upcomingTriggers = useMemo(() => {
    return getUpcomingTriggers(triggers, currentRound);
  }, [triggers, currentRound]);

  const combatPhase = useMemo(() => {
    return getCombatPhase(currentRound, maxRounds);
  }, [currentRound, maxRounds]);

  const isInOvertime = useMemo(() => {
    return isOvertime(currentRound, maxRounds);
  }, [currentRound, maxRounds]);

  return {
    dueTriggers,
    upcomingTriggers,
    combatPhase,
    isInOvertime,
  };
}