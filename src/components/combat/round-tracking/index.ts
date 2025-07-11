/**
 * Round tracking system for D&D combat encounters
 *
 * This module provides comprehensive round tracking functionality including:
 * - Round counter with increment/decrement controls
 * - Round-based effect tracking and expiration
 * - Round duration estimation and timing features
 * - Round history and milestone tracking
 * - Round-based triggers and reminders
 * - Round export and session summary features
 */

export { RoundTracker } from './RoundTracker';
export { RoundHistory } from './RoundHistory';
export { useRoundTracking } from './useRoundTracking';
export * from './round-utils';
export * from './history-utils';
export * from './tracker-hooks';
export * from './history-hooks';
export * from './TrackerComponents';
export * from './HistoryComponents';

// Type exports
export type {
  Effect,
  Trigger,
  SessionSummary,
} from './round-utils';

export type {
  HistoryEvent,
  HistoryEntry,
  HistoryStats,
} from './history-utils';