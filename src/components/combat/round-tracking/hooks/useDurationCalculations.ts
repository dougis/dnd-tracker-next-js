import { useMemo } from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import {
  calculateAverageRoundDuration,
  formatDuration,
  calculateRemainingDuration,
} from '../round-utils';

interface RoundDuration {
  totalSeconds: number;
  averageRoundDuration: number;
  estimatedRemainingTime: number | null;
  formatted: string;
}

/**
 * Hook for calculating duration and timing information
 */
export function useDurationCalculations(
  encounter: IEncounter | null,
  currentRound: number,
  maxRounds?: number
): RoundDuration {
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
      currentRound
    );
    const estimatedRemainingTime = calculateRemainingDuration(
      currentRound,
      maxRounds,
      averageRoundDuration
    );

    return {
      totalSeconds,
      averageRoundDuration,
      estimatedRemainingTime,
      formatted: formatDuration(totalSeconds),
    };
  }, [encounter?.combatState?.startedAt, currentRound, maxRounds]);

  return duration;
}