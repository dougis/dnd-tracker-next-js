import { useState, useEffect, useCallback, useRef } from 'react';
import {
  formatTime,
  calculateCombatDuration,
  calculateRoundTimeRemaining,
  getTimerStates,
  WARNING_THRESHOLD,
  CRITICAL_THRESHOLD,
} from './timer-helpers';

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
  // Combat Duration
  combatDuration: number;
  formattedDuration: string;

  // Round Timer
  hasRoundTimer: boolean;
  roundTimeRemaining: number;
  formattedRoundTime: string;
  isRoundWarning: boolean;
  isRoundCritical: boolean;
  isRoundExpired: boolean;

  // Timer State
  isPaused: boolean;

  // Timer Controls
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
  const [localPausedAt, setLocalPausedAt] = useState<Date | undefined>();
  const [localStartedAt, setLocalStartedAt] = useState<Date | undefined>();
  const [shouldIgnoreExternalPause, setShouldIgnoreExternalPause] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const warningTriggeredRef = useRef(false);
  const criticalTriggeredRef = useRef(false);
  const expiredTriggeredRef = useRef(false);

  // Update local state when props change
  useEffect(() => {
    setLocalStartedAt(undefined); // Use prop startedAt unless reset locally
  }, [startedAt]);

  // Update timer every second when active
  useEffect(() => {
    const effectivePausedAt = shouldIgnoreExternalPause ? localPausedAt : (localPausedAt || pausedAt);
    if (isActive && !effectivePausedAt) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, pausedAt, localPausedAt, shouldIgnoreExternalPause]);

  // Calculate combat duration
  const combatDuration = calculateCombatDuration(
    isActive,
    localStartedAt,
    startedAt,
    shouldIgnoreExternalPause,
    localPausedAt,
    pausedAt,
    currentTime
  );

  // Calculate round timer
  const hasRoundTimer = Boolean(roundTimeLimit);
  const roundTimeRemaining = calculateRoundTimeRemaining(
    hasRoundTimer,
    isActive,
    startedAt,
    roundTimeLimit,
    combatDuration
  );

  // Timer states
  const { isPaused, isRoundWarning, isRoundCritical, isRoundExpired } = getTimerStates(
    hasRoundTimer,
    roundTimeRemaining,
    shouldIgnoreExternalPause,
    localPausedAt,
    pausedAt
  );


  // Trigger callbacks for round timer events
  useEffect(() => {
    if (!isPaused) {
      if (isRoundWarning && !warningTriggeredRef.current) {
        onRoundWarning?.();
        warningTriggeredRef.current = true;
      } else if (isRoundCritical && !criticalTriggeredRef.current) {
        onRoundCritical?.();
        criticalTriggeredRef.current = true;
      } else if (isRoundExpired && !expiredTriggeredRef.current) {
        onRoundExpired?.();
        expiredTriggeredRef.current = true;
      }
    }
  }, [isRoundWarning, isRoundCritical, isRoundExpired, isPaused, onRoundWarning, onRoundCritical, onRoundExpired]);

  // Reset warning flags when timer resets or warning states change
  useEffect(() => {
    if (!isRoundWarning) {
      warningTriggeredRef.current = false;
    }
    if (!isRoundCritical) {
      criticalTriggeredRef.current = false;
    }
    if (!isRoundExpired) {
      expiredTriggeredRef.current = false;
    }
  }, [isRoundWarning, isRoundCritical, isRoundExpired]);

  // Timer controls
  const pause = useCallback(() => {
    setLocalPausedAt(new Date());
  }, []);

  const resume = useCallback(() => {
    setLocalPausedAt(undefined);
    if (pausedAt) {
      setShouldIgnoreExternalPause(true);
    }
  }, [pausedAt]);

  const reset = useCallback(() => {
    setLocalStartedAt(new Date());
    setCurrentTime(Date.now());
    setLocalPausedAt(undefined);
    setShouldIgnoreExternalPause(false);
    warningTriggeredRef.current = false;
    criticalTriggeredRef.current = false;
    expiredTriggeredRef.current = false;
  }, []);

  return {
    // Combat Duration
    combatDuration,
    formattedDuration: formatTime(combatDuration),

    // Round Timer
    hasRoundTimer,
    roundTimeRemaining,
    formattedRoundTime: hasRoundTimer ? formatTime(roundTimeRemaining) : '',
    isRoundWarning,
    isRoundCritical,
    isRoundExpired,

    // Timer State
    isPaused,

    // Timer Controls
    pause,
    resume,
    reset,
  };
}