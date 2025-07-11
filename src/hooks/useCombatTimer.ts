import { useState, useEffect, useCallback, useRef } from 'react';

// Round timer warning thresholds in milliseconds
const WARNING_THRESHOLD = 15000; // 15 seconds
const CRITICAL_THRESHOLD = 5000; // 5 seconds

function formatTime(milliseconds: number): string {
  if (milliseconds === 0) return '0:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to calculate combat duration
function calculateCombatDuration(isActive: boolean, startedAt?: Date, pausedAt?: Date, currentTime?: number): number {
  if (!isActive || !startedAt) return 0;
  const endTime = pausedAt || new Date(currentTime || Date.now());
  return Math.max(0, endTime.getTime() - startedAt.getTime());
}

// Helper function to calculate round time remaining
function calculateRoundTimeRemaining(hasRoundTimer: boolean, roundTimeLimit?: number, combatDuration?: number): number {
  if (!hasRoundTimer || !roundTimeLimit) return 0;
  return Math.max(0, roundTimeLimit - (combatDuration || 0));
}

// Helper function to calculate threshold states
function calculateThresholdStates(hasRoundTimer: boolean, roundTimeLimit?: number, roundTimeRemaining?: number) {
  if (!hasRoundTimer || !roundTimeLimit) {
    return { isRoundWarning: false, isRoundCritical: false, isRoundExpired: false };
  }

  const remaining = roundTimeRemaining || 0;

  return {
    isRoundWarning: remaining <= WARNING_THRESHOLD && remaining > CRITICAL_THRESHOLD,
    isRoundCritical: remaining <= CRITICAL_THRESHOLD && remaining > 0,
    isRoundExpired: remaining === 0
  };
}

// Helper function to handle callback triggering
function useCallbackTrigger({
  isActive,
  isPaused,
  isRoundWarning,
  isRoundCritical,
  isRoundExpired,
  onRoundWarning,
  onRoundCritical,
  onRoundExpired,
  callbacksTriggered
}: {
  isActive: boolean;
  isPaused: boolean;
  isRoundWarning: boolean;
  isRoundCritical: boolean;
  isRoundExpired: boolean;
  onRoundWarning?: () => void;
  onRoundCritical?: () => void;
  onRoundExpired?: () => void;
  callbacksTriggered: React.MutableRefObject<{ warning: boolean; critical: boolean; expired: boolean }>;
}) {
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
  }, [isRoundWarning, isRoundCritical, isRoundExpired, isActive, isPaused, onRoundWarning, onRoundCritical, onRoundExpired, callbacksTriggered]);
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
  const isPaused = Boolean(effectivePausedAt);

  // Timer interval management
  useEffect(() => {
    if (isActive && !effectivePausedAt) {
      intervalRef.current = setInterval(() => setCurrentTime(Date.now()), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, effectivePausedAt]);

  // Calculate durations and states
  const combatDuration = calculateCombatDuration(isActive, effectiveStartedAt, effectivePausedAt, currentTime);
  const hasRoundTimer = Boolean(roundTimeLimit);
  const roundTimeRemaining = calculateRoundTimeRemaining(hasRoundTimer, roundTimeLimit, combatDuration);
  const { isRoundWarning, isRoundCritical, isRoundExpired } = calculateThresholdStates(hasRoundTimer, roundTimeLimit, roundTimeRemaining);

  // Handle callback triggering
  useCallbackTrigger({
    isActive,
    isPaused,
    isRoundWarning,
    isRoundCritical,
    isRoundExpired,
    onRoundWarning,
    onRoundCritical,
    onRoundExpired,
    callbacksTriggered
  });

  // Control functions
  const pause = useCallback(() => {
    if (!isPaused && isActive) {
      setLocalPausedAt(new Date());
    }
  }, [isPaused, isActive]);

  const resume = useCallback(() => {
    if (isPaused && isActive) {
      setLocalPausedAt(null);
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