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
  onRoundWarning,
  onRoundCritical,
  onRoundExpired,
}: CombatTimerProps): CombatTimerReturn {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [localPausedAt, setLocalPausedAt] = useState<Date | undefined | null>(undefined);
  const [localStartedAt, setLocalStartedAt] = useState<Date | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout>();
  const callbacksTriggered = useRef({ warning: false, critical: false, expired: false });

  // Handle effective pause state: local overrides external
  const effectivePausedAt = localPausedAt === null ? undefined : (localPausedAt || pausedAt);
  const effectiveStartedAt = localStartedAt || startedAt;

  useEffect(() => {
    if (isActive && !effectivePausedAt) {
      intervalRef.current = setInterval(() => setCurrentTime(Date.now()), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, effectivePausedAt]);

  let combatDuration = 0;
  if (isActive && effectiveStartedAt) {
    const endTime = effectivePausedAt || new Date(currentTime);
    combatDuration = Math.max(0, endTime.getTime() - effectiveStartedAt.getTime());
  }

  const hasRoundTimer = Boolean(roundTimeLimit);
  let roundTimeRemaining = 0;
  if (hasRoundTimer && roundTimeLimit) {
    roundTimeRemaining = Math.max(0, roundTimeLimit - combatDuration);
  }

  // Calculate warning/critical states
  const warningThreshold = hasRoundTimer && roundTimeLimit ? roundTimeLimit * 0.25 : 0; // 25% remaining
  const criticalThreshold = hasRoundTimer && roundTimeLimit ? roundTimeLimit * 0.1 : 0; // 10% remaining

  const isRoundWarning = hasRoundTimer && roundTimeRemaining <= warningThreshold && roundTimeRemaining > criticalThreshold;
  const isRoundCritical = hasRoundTimer && roundTimeRemaining <= criticalThreshold && roundTimeRemaining > 0;
  const isRoundExpired = hasRoundTimer && roundTimeRemaining === 0;

  const isPaused = Boolean(effectivePausedAt);

  // Trigger callbacks based on thresholds
  useEffect(() => {
    if (!isActive || isPaused) return;

    if (isRoundExpired && !callbacksTriggered.current.expired) {
      onRoundExpired?.();
      callbacksTriggered.current.expired = true;
    } else if (isRoundCritical && !callbacksTriggered.current.critical) {
      onRoundCritical?.();
      callbacksTriggered.current.critical = true;
    } else if (isRoundWarning && !callbacksTriggered.current.warning) {
      onRoundWarning?.();
      callbacksTriggered.current.warning = true;
    }
  }, [isRoundWarning, isRoundCritical, isRoundExpired, isActive, isPaused, onRoundWarning, onRoundCritical, onRoundExpired]);

  const pause = useCallback(() => {
    if (!isPaused && isActive) {
      setLocalPausedAt(new Date());
    }
  }, [isPaused, isActive]);

  const resume = useCallback(() => {
    if (isPaused && isActive) {
      setLocalPausedAt(null); // null means "override external pausedAt to be undefined"
    }
  }, [isPaused, isActive]);

  const reset = useCallback(() => {
    setLocalStartedAt(new Date());
    setLocalPausedAt(undefined);
    setCurrentTime(Date.now());
    callbacksTriggered.current = { warning: false, critical: false, expired: false };
  }, []);

  return {
    combatDuration,
    formattedDuration: formatTime(combatDuration),
    hasRoundTimer,
    roundTimeRemaining,
    formattedRoundTime: hasRoundTimer ? formatTime(roundTimeRemaining) : '',
    isRoundWarning,
    isRoundCritical,
    isRoundExpired,
    isPaused,
    pause,
    resume,
    reset,
  };
}