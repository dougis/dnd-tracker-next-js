import { useState, useEffect, useCallback, useRef } from 'react';

function formatTime(milliseconds: number): string {
  if (milliseconds === 0) return '0:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface CombatTimerProps {
  startedAt?: Date;
  pausedAt?: Date;
  isActive: boolean;
  roundTimeLimit?: number;
  onRoundWarning?: () => void;
  onRoundCritical?: () => void;
  onRoundExpired?: () => void;
}

interface CombatTimerReturn {
  combatDuration: number;
  formattedDuration: string;
  hasRoundTimer: boolean;
  roundTimeRemaining: number;
  formattedRoundTime: string;
  isRoundWarning: boolean;
  isRoundCritical: boolean;
  isRoundExpired: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useCombatTimer({
  startedAt,
  pausedAt,
  isActive,
  roundTimeLimit,
}: CombatTimerProps): CombatTimerReturn {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && !pausedAt) {
      intervalRef.current = setInterval(() => setCurrentTime(Date.now()), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, pausedAt]);

  let combatDuration = 0;
  if (isActive && startedAt) {
    const endTime = pausedAt || new Date(currentTime);
    combatDuration = Math.max(0, endTime.getTime() - startedAt.getTime());
  }

  const hasRoundTimer = Boolean(roundTimeLimit);
  let roundTimeRemaining = 0;
  if (hasRoundTimer && roundTimeLimit) {
    roundTimeRemaining = Math.max(0, roundTimeLimit - combatDuration);
  }

  const isPaused = Boolean(pausedAt);

  return {
    combatDuration,
    formattedDuration: formatTime(combatDuration),
    hasRoundTimer,
    roundTimeRemaining,
    formattedRoundTime: hasRoundTimer ? formatTime(roundTimeRemaining) : '',
    isRoundWarning: false,
    isRoundCritical: false,
    isRoundExpired: false,
    isPaused,
    pause: useCallback(() => {}, []),
    resume: useCallback(() => {}, []),
    reset: useCallback(() => {}, []),
  };
}