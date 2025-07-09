/**
 * Utility functions for round tracking functionality
 * Refactored for reduced complexity and improved maintainability
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

// Constants for combat phase calculation
const COMBAT_PHASE_THRESHOLDS = {
  EARLY: 0.33,
  MIDDLE: 0.66,
  LATE: 1.0
} as const;

// Helper functions for formatDuration
function formatSeconds(seconds: number): string {
  return `${seconds}s`;
}

function formatMinutes(minutes: number, seconds: number): string {
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function formatHours(hours: number, minutes: number, seconds: number): string {
  let result = `${hours}h`;
  if (minutes > 0) result += ` ${minutes}m`;
  if (seconds > 0) result += ` ${seconds}s`;
  return result;
}

/**
 * Formats duration in seconds to human-readable string
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0s';
  }

  const seconds = Math.ceil(totalSeconds);

  if (seconds < 60) {
    return formatSeconds(seconds);
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return formatMinutes(minutes, remainingSeconds);
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return formatHours(hours, remainingMinutes, remainingSeconds);
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
  // Average duration is total elapsed time divided by current round
  // This gives us the average time per round including the current round
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
  if (effect.duration <= 0) {
    return 0;
  }

  if (currentRound < effect.startRound) {
    return effect.duration;
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

// Helper functions for formatRoundSummary
function addBasicSummaryParts(summary: SessionSummary): string[] {
  const parts: string[] = [];
  parts.push(`${summary.totalRounds} rounds`);
  parts.push(`${formatDuration(summary.totalDuration)} total`);
  return parts;
}

function addAverageDurationPart(summary: SessionSummary): string | null {
  if (summary.totalRounds > 0) {
    const avgDuration = summary.totalDuration / summary.totalRounds;
    return `${formatDuration(avgDuration)}/round avg`;
  }
  return null;
}

function addOptionalSummaryParts(summary: SessionSummary): string[] {
  const parts: string[] = [];

  if (summary.totalActions !== undefined) {
    parts.push(`${summary.totalActions} actions`);
  }

  if (summary.damageDealt !== undefined) {
    parts.push(`${summary.damageDealt} damage`);
  }

  if (summary.healingApplied !== undefined) {
    parts.push(`${summary.healingApplied} healing`);
  }

  return parts;
}

/**
 * Formats session summary into human-readable string
 */
export function formatRoundSummary(summary: SessionSummary): string {
  const parts = [
    ...addBasicSummaryParts(summary),
    addAverageDurationPart(summary),
    ...addOptionalSummaryParts(summary)
  ].filter(Boolean);

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

// Helper functions for getCombatPhase
function calculateCombatProgress(currentRound: number, maxRounds: number): number {
  return currentRound / maxRounds;
}

function determinePhaseFromProgress(progress: number): string {
  if (progress <= COMBAT_PHASE_THRESHOLDS.EARLY) {
    return 'early';
  }

  if (progress <= COMBAT_PHASE_THRESHOLDS.MIDDLE) {
    return 'middle';
  }

  if (progress <= COMBAT_PHASE_THRESHOLDS.LATE) {
    return 'late';
  }

  return 'overtime';
}

/**
 * Calculates combat phase based on round and max rounds
 */
export function getCombatPhase(currentRound: number, maxRounds?: number): string {
  if (maxRounds === undefined) {
    return 'ongoing';
  }

  const progress = calculateCombatProgress(currentRound, maxRounds);
  return determinePhaseFromProgress(progress);
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

  return history.slice(-maxRounds);
}

// Helper functions for searchHistory
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

function filterEventsByQuery(events: string[], query: string): string[] {
  return events.filter(event =>
    event.toLowerCase().includes(query)
  );
}

function filterHistoryEntry(
  entry: { round: number; events: string[] },
  query: string
): { round: number; events: string[] } | null {
  const filteredEvents = filterEventsByQuery(entry.events, query);

  if (filteredEvents.length === 0) {
    return null;
  }

  return {
    ...entry,
    events: filteredEvents
  };
}

/**
 * Searches history for events matching a query
 */
export function searchHistory(
  history: { round: number; events: string[] }[],
  query: string
): { round: number; events: string[] }[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return history;
  }

  return history
    .map(entry => filterHistoryEntry(entry, normalizedQuery))
    .filter(entry => entry !== null);
}

// Helper functions for validation
function validateStringField(value: any): boolean {
  return typeof value === 'string' && value.length > 0;
}

function validatePositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0;
}

function validateNonNegativeInteger(value: any): boolean {
  return typeof value === 'number' && value >= 1 && Number.isInteger(value);
}

/**
 * Validates effect data structure
 */
export function validateEffect(effect: Effect): boolean {
  return (
    validateStringField(effect.id) &&
    validateStringField(effect.name) &&
    validatePositiveNumber(effect.duration) &&
    validateNonNegativeInteger(effect.startRound)
  );
}

/**
 * Validates trigger data structure
 */
export function validateTrigger(trigger: Trigger): boolean {
  return (
    validateStringField(trigger.id) &&
    validateStringField(trigger.name) &&
    validateNonNegativeInteger(trigger.triggerRound) &&
    typeof trigger.isActive === 'boolean'
  );
}