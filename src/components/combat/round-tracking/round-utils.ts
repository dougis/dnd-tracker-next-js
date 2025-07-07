/**
 * Utility functions for round tracking functionality
 * Provides calculations and formatting for round-based combat mechanics
 */

// Type definitions for round tracking
export interface Effect {
  id: string;
  name: string;
  participantId: any;
  duration: number;
  startRound: number;
  description: string;
}

export interface Trigger {
  id: string;
  name: string;
  triggerRound: number;
  description: string;
  isActive: boolean;
  triggeredRound?: number;
}

export interface SessionSummary {
  totalRounds: number;
  totalDuration: number;
  totalActions?: number;
  damageDealt?: number;
  healingApplied?: number;
  participantActions?: number;
}

/**
 * Formats duration in seconds to human-readable string
 */
export function formatDuration(totalSeconds: number): string {
  // Handle invalid inputs
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0s';
  }

  const seconds = Math.ceil(totalSeconds);
  
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSecondsAfterHours = remainingSeconds;

  let result = `${hours}h`;
  if (remainingMinutes > 0) {
    result += ` ${remainingMinutes}m`;
  }
  if (remainingSecondsAfterHours > 0) {
    result += ` ${remainingSecondsAfterHours}s`;
  }

  return result;
}

/**
 * Calculates estimated remaining duration based on current progress
 */
export function calculateRemainingDuration(
  currentRound: number,
  maxRounds: number | undefined,
  averageRoundDuration: number
): number | null {
  if (maxRounds === undefined) {
    return null;
  }

  const remainingRounds = Math.max(0, maxRounds - currentRound);
  return remainingRounds * Math.max(0, averageRoundDuration);
}

/**
 * Checks if an effect is expiring (1 round remaining)
 */
export function isEffectExpiring(effect: Effect, currentRound: number): boolean {
  const remainingDuration = calculateEffectRemainingDuration(effect, currentRound);
  return remainingDuration === 1;
}

/**
 * Calculates average round duration from start time and round count
 */
export function calculateAverageRoundDuration(
  startTime: Date | undefined,
  currentRound: number
): number {
  if (!startTime || currentRound <= 0) {
    return 0;
  }

  const elapsedTime = Date.now() - startTime.getTime();
  return Math.floor(elapsedTime / 1000 / currentRound);
}

/**
 * Validates that a round number is positive integer
 */
export function validateRoundNumber(round: number): boolean {
  return Number.isInteger(round) && round >= 1 && Number.isFinite(round);
}

/**
 * Calculates remaining duration for a specific effect
 */
export function calculateEffectRemainingDuration(effect: Effect, currentRound: number): number {
  // Handle invalid effect data
  if (effect.duration <= 0) {
    return 0;
  }

  // Handle invalid round data  
  if (currentRound < effect.startRound) {
    return effect.duration; // Effect hasn't started yet
  }

  const elapsedRounds = currentRound - effect.startRound;
  const remaining = effect.duration - elapsedRounds;
  
  return Math.max(0, remaining);
}

/**
 * Sorts triggers by trigger round (ascending)
 */
export function sortTriggersByRound(triggers: Trigger[] | undefined): Trigger[] {
  if (!Array.isArray(triggers)) {
    return [];
  }

  return [...triggers].sort((a, b) => a.triggerRound - b.triggerRound);
}

/**
 * Filters triggers to only active ones
 */
export function filterActiveTriggers(triggers: Trigger[] | undefined): Trigger[] {
  if (!Array.isArray(triggers)) {
    return [];
  }

  return triggers.filter(trigger => trigger.isActive);
}

/**
 * Formats session summary into human-readable string
 */
export function formatRoundSummary(summary: SessionSummary): string {
  const parts: string[] = [];

  // Basic round and duration info
  parts.push(`${summary.totalRounds} rounds`);
  parts.push(`${formatDuration(summary.totalDuration)} total`);

  // Calculate average round duration
  if (summary.totalRounds > 0) {
    const avgDuration = summary.totalDuration / summary.totalRounds;
    parts.push(`${formatDuration(avgDuration)}/round avg`);
  }

  // Optional action count
  if (summary.totalActions !== undefined) {
    parts.push(`${summary.totalActions} actions`);
  }

  // Optional damage and healing
  if (summary.damageDealt !== undefined) {
    parts.push(`${summary.damageDealt} damage`);
  }

  if (summary.healingApplied !== undefined) {
    parts.push(`${summary.healingApplied} healing`);
  }

  return parts.join(' • ');
}

/**
 * Groups effects by participant for display
 */
export function groupEffectsByParticipant(effects: Effect[]): Record<string, Effect[]> {
  return effects.reduce((groups, effect) => {
    const participantId = effect.participantId.toString();
    if (!groups[participantId]) {
      groups[participantId] = [];
    }
    groups[participantId].push(effect);
    return groups;
  }, {} as Record<string, Effect[]>);
}

/**
 * Gets effects that are expiring this round or next round
 */
export function getExpiringEffects(effects: Effect[], currentRound: number): Effect[] {
  return effects.filter(effect => {
    const remaining = calculateEffectRemainingDuration(effect, currentRound);
    return remaining <= 1 && remaining > 0;
  });
}

/**
 * Gets effects that have already expired
 */
export function getExpiredEffects(effects: Effect[], currentRound: number): Effect[] {
  return effects.filter(effect => {
    const remaining = calculateEffectRemainingDuration(effect, currentRound);
    return remaining <= 0;
  });
}

/**
 * Gets triggers that are due this round
 */
export function getDueTriggers(triggers: Trigger[], currentRound: number): Trigger[] {
  return triggers.filter(trigger => 
    trigger.isActive && trigger.triggerRound === currentRound
  );
}

/**
 * Gets upcoming triggers (future rounds)
 */
export function getUpcomingTriggers(triggers: Trigger[], currentRound: number): Trigger[] {
  return triggers
    .filter(trigger => trigger.isActive && trigger.triggerRound > currentRound)
    .sort((a, b) => a.triggerRound - b.triggerRound);
}

/**
 * Determines if combat is overtime (past max rounds)
 */
export function isOvertime(currentRound: number, maxRounds?: number): boolean {
  return maxRounds !== undefined && currentRound > maxRounds;
}

/**
 * Calculates combat phase based on round and max rounds
 */
export function getCombatPhase(currentRound: number, maxRounds?: number): string {
  if (maxRounds === undefined) {
    return 'ongoing';
  }

  const progress = currentRound / maxRounds;
  
  if (progress <= 0.33) {
    return 'early';
  } else if (progress <= 0.66) {
    return 'middle';
  } else if (progress <= 1.0) {
    return 'late';
  } else {
    return 'overtime';
  }
}

/**
 * Formats time remaining until next trigger
 */
export function formatTimeUntilTrigger(
  trigger: Trigger,
  currentRound: number,
  averageRoundDuration: number
): string {
  if (trigger.triggerRound <= currentRound) {
    return 'Now';
  }

  const roundsUntil = trigger.triggerRound - currentRound;
  if (averageRoundDuration === 0) {
    return `${roundsUntil} rounds`;
  }

  const timeUntil = roundsUntil * averageRoundDuration;
  return `${roundsUntil} rounds (~${formatDuration(timeUntil)})`;
}

/**
 * Creates a round history entry
 */
export function createHistoryEntry(round: number, events: string[] = []): { round: number; events: string[] } {
  return {
    round,
    events: [...events],
  };
}

/**
 * Limits history to a maximum number of rounds to prevent memory issues
 */
export function limitHistorySize(
  history: { round: number; events: string[] }[],
  maxRounds: number
): { round: number; events: string[] }[] {
  if (history.length <= maxRounds) {
    return history;
  }

  // Keep the most recent rounds
  return history.slice(-maxRounds);
}

/**
 * Searches history for events matching a query
 */
export function searchHistory(
  history: { round: number; events: string[] }[],
  query: string
): { round: number; events: string[] }[] {
  if (!query.trim()) {
    return history;
  }

  const lowerQuery = query.toLowerCase();
  return history
    .map(entry => ({
      ...entry,
      events: entry.events.filter(event => 
        event.toLowerCase().includes(lowerQuery)
      ),
    }))
    .filter(entry => entry.events.length > 0);
}

/**
 * Validates effect data structure
 */
export function validateEffect(effect: Effect): boolean {
  return (
    typeof effect.id === 'string' &&
    typeof effect.name === 'string' &&
    typeof effect.duration === 'number' &&
    effect.duration > 0 &&
    typeof effect.startRound === 'number' &&
    effect.startRound >= 1
  );
}

/**
 * Validates trigger data structure
 */
export function validateTrigger(trigger: Trigger): boolean {
  return (
    typeof trigger.id === 'string' &&
    typeof trigger.name === 'string' &&
    typeof trigger.triggerRound === 'number' &&
    trigger.triggerRound >= 1 &&
    typeof trigger.isActive === 'boolean'
  );
}