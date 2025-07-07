export const WARNING_THRESHOLD = 15000; // 15 seconds
export const CRITICAL_THRESHOLD = 5000; // 5 seconds

export function formatTime(milliseconds: number): string {
  if (milliseconds === 0) return '0:00';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function calculateCombatDuration(
  isActive: boolean,
  localStartedAt: Date | undefined,
  startedAt: Date | undefined,
  shouldIgnoreExternalPause: boolean,
  localPausedAt: Date | undefined,
  pausedAt: Date | undefined,
  currentTime: number
): number {
  if (!isActive) return 0;

  const effectiveStartTime = localStartedAt || startedAt;
  if (!effectiveStartTime) return 0;

  const effectivePausedAt = shouldIgnoreExternalPause ? localPausedAt : (localPausedAt || pausedAt);
  const endTime = effectivePausedAt || new Date(currentTime);

  return Math.max(0, endTime.getTime() - effectiveStartTime.getTime());
}

export function calculateRoundTimeRemaining(
  hasRoundTimer: boolean,
  isActive: boolean,
  startedAt: Date | undefined,
  roundTimeLimit: number | undefined,
  combatDuration: number
): number {
  if (!hasRoundTimer || !isActive || !startedAt || !roundTimeLimit) return 0;
  return Math.max(0, roundTimeLimit - combatDuration);
}

export function getTimerStates(
  hasRoundTimer: boolean,
  roundTimeRemaining: number,
  shouldIgnoreExternalPause: boolean,
  localPausedAt: Date | undefined,
  pausedAt: Date | undefined
) {
  const isPaused = Boolean(shouldIgnoreExternalPause ? localPausedAt : (localPausedAt || pausedAt));

  if (!hasRoundTimer) {
    return { isPaused, isRoundWarning: false, isRoundCritical: false, isRoundExpired: false };
  }

  return {
    isPaused,
    isRoundWarning: roundTimeRemaining <= WARNING_THRESHOLD && roundTimeRemaining > CRITICAL_THRESHOLD,
    isRoundCritical: roundTimeRemaining <= CRITICAL_THRESHOLD && roundTimeRemaining > 0,
    isRoundExpired: roundTimeRemaining === 0
  };
}