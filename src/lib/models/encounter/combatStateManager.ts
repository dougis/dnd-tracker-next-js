import { Types } from 'mongoose';
import { IEncounter, ICombatState } from './interfaces';

/**
 * Combat action types for logging
 */
export type CombatActionType =
  | 'combat_started'
  | 'combat_ended'
  | 'combat_paused'
  | 'combat_resumed'
  | 'turn_start'
  | 'turn_end'
  | 'round_start'
  | 'round_end'
  | 'damage_dealt'
  | 'healing_applied'
  | 'condition_added'
  | 'condition_removed'
  | 'initiative_set'
  | 'participant_added'
  | 'participant_removed';

/**
 * Combat action log entry
 */
export interface CombatActionLog {
  action: CombatActionType;
  timestamp: Date;
  round: number;
  turn: number;
  participantId?: Types.ObjectId;
  details?: Record<string, any>;
}

/**
 * Combat phase types
 */
export type CombatPhase = 'inactive' | 'active' | 'paused' | 'ended';

/**
 * Combat state validation result
 */
export interface CombatStateValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * In-memory storage for combat history (in production, this would be database-backed)
 */
const combatHistoryStore = new Map<string, CombatActionLog[]>();

/**
 * In-memory storage for combat state snapshots
 */
const combatStateStore = new Map<string, ICombatState>();

/**
 * Pauses active combat
 */
export function pauseCombat(encounter: IEncounter): boolean {
  if (!encounter.combatState.isActive) {
    return false;
  }

  encounter.combatState.isActive = false;
  encounter.combatState.pausedAt = new Date();
  // Note: status remains 'active' since this is still an ongoing encounter

  // Log the pause action
  logCombatAction(encounter._id.toString(), {
    action: 'combat_paused',
    round: encounter.combatState.currentRound,
    turn: encounter.combatState.currentTurn,
  });

  return true;
}

/**
 * Resumes paused combat
 */
export function resumeCombat(encounter: IEncounter): boolean {
  if (encounter.combatState.isActive || !encounter.combatState.pausedAt) {
    return false;
  }

  encounter.combatState.isActive = true;
  encounter.combatState.pausedAt = undefined;
  // Note: status should already be 'active'

  // Log the resume action
  logCombatAction(encounter._id.toString(), {
    action: 'combat_resumed',
    round: encounter.combatState.currentRound,
    turn: encounter.combatState.currentTurn,
  });

  return true;
}

/**
 * Logs a combat action to the history
 */
export function logCombatAction(
  encounterId: string,
  actionData: Omit<CombatActionLog, 'timestamp'>
): void {
  const action: CombatActionLog = {
    ...actionData,
    timestamp: new Date(),
  };

  if (!combatHistoryStore.has(encounterId)) {
    combatHistoryStore.set(encounterId, []);
  }

  const history = combatHistoryStore.get(encounterId)!;
  history.push(action);
}

/**
 * Gets the complete combat history for an encounter
 */
export function getCombatHistory(encounterId: string): CombatActionLog[] {
  return combatHistoryStore.get(encounterId) || [];
}

/**
 * Clears the combat history for an encounter
 */
export function clearCombatHistory(encounterId: string): void {
  combatHistoryStore.delete(encounterId);
}

/**
 * Clears all stored combat state for an encounter (for testing)
 */
export function clearCombatState(encounterId: string): void {
  combatStateStore.delete(encounterId);
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(`combat_state_${encounterId}`);
  }
}

/**
 * Saves combat state to persistent storage
 */
export function saveCombatState(encounter: IEncounter): boolean {
  try {
    const stateSnapshot: ICombatState = {
      isActive: encounter.combatState.isActive,
      currentRound: encounter.combatState.currentRound,
      currentTurn: encounter.combatState.currentTurn,
      initiativeOrder: [...encounter.combatState.initiativeOrder],
      startedAt: encounter.combatState.startedAt,
      pausedAt: encounter.combatState.pausedAt,
      endedAt: encounter.combatState.endedAt,
      totalDuration: encounter.combatState.totalDuration,
    };

    // Test JSON serialization to catch circular references
    const serialized = JSON.stringify(stateSnapshot);

    // Store in memory (in production, this would save to database)
    combatStateStore.set(encounter._id.toString(), stateSnapshot);

    // Also try to save to localStorage if available (for client-side persistence)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(
        `combat_state_${encounter._id}`,
        serialized
      );
    }

    return true;
  } catch (error) {
    console.error('Failed to save combat state:', error);
    return false;
  }
}

/**
 * Loads saved state from storage
 */
function loadSavedState(encounterId: string): ICombatState | null {
  // First try to load from memory store
  if (combatStateStore.has(encounterId)) {
    return combatStateStore.get(encounterId)!;
  }

  // Fall back to localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(`combat_state_${encounterId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (parseError) {
        console.warn('Failed to parse saved combat state:', parseError);
        return null;
      }
    }
  }

  return null;
}

/**
 * Validates saved state structure
 */
function isValidSavedState(savedState: any): savedState is ICombatState {
  return (
    typeof savedState === 'object' &&
    typeof savedState.isActive === 'boolean' &&
    typeof savedState.currentRound === 'number' &&
    typeof savedState.currentTurn === 'number' &&
    Array.isArray(savedState.initiativeOrder)
  );
}

/**
 * Applies saved state to encounter
 */
function applySavedState(encounter: IEncounter, savedState: ICombatState): void {
  encounter.combatState.isActive = savedState.isActive;
  encounter.combatState.currentRound = savedState.currentRound;
  encounter.combatState.currentTurn = savedState.currentTurn;
  encounter.combatState.initiativeOrder = savedState.initiativeOrder;
  encounter.combatState.startedAt = savedState.startedAt;
  encounter.combatState.pausedAt = savedState.pausedAt;
  encounter.combatState.endedAt = savedState.endedAt;
  encounter.combatState.totalDuration = savedState.totalDuration;
}

/**
 * Loads combat state from persistent storage
 */
export function loadCombatState(encounter: IEncounter): boolean {
  try {
    const savedState = loadSavedState(encounter._id.toString());
    if (!savedState) {
      return false;
    }

    if (!isValidSavedState(savedState)) {
      console.warn('Saved combat state has invalid structure');
      return false;
    }

    // Validate the loaded state
    const tempEncounter = { ...encounter, combatState: savedState } as IEncounter;
    const validation = validateCombatState(tempEncounter);
    if (!validation.isValid) {
      console.warn('Loaded combat state is invalid:', validation.errors);
      return false;
    }

    applySavedState(encounter, savedState);
    return true;
  } catch (error) {
    console.error('Failed to load combat state:', error);
    return false;
  }
}

/**
 * Gets the current combat phase
 */
export function getCombatPhase(encounter: IEncounter): CombatPhase {
  if (encounter.combatState.endedAt || encounter.status === 'completed') {
    return 'ended';
  }

  if (encounter.combatState.pausedAt && !encounter.combatState.isActive) {
    return 'paused';
  }

  if (encounter.combatState.isActive) {
    return 'active';
  }

  return 'inactive';
}

/**
 * Validates round and turn values
 */
function validateRoundAndTurn(combatState: ICombatState, errors: string[]): void {
  if (combatState.currentRound < 0) {
    errors.push('Current round cannot be negative');
  }

  if (combatState.currentTurn < 0) {
    errors.push('Current turn cannot be negative');
  }

  if (combatState.initiativeOrder.length > 0 &&
      combatState.currentTurn >= combatState.initiativeOrder.length) {
    errors.push('Current turn index is out of bounds');
  }
}

/**
 * Validates active participant state
 */
function validateActiveParticipants(combatState: ICombatState, errors: string[]): void {
  const activeParticipants = combatState.initiativeOrder.filter(entry => entry.isActive);

  if (activeParticipants.length > 1) {
    errors.push('Multiple participants marked as active');
  }

  if (combatState.isActive && activeParticipants.length === 0 &&
      combatState.initiativeOrder.length > 0) {
    errors.push('No participant marked as active during active combat');
  }
}

/**
 * Validates timestamp consistency
 */
function validateTimestamps(combatState: ICombatState, errors: string[]): void {
  if (combatState.startedAt && combatState.endedAt &&
      combatState.startedAt > combatState.endedAt) {
    errors.push('Start time cannot be after end time');
  }

  if (combatState.startedAt && combatState.pausedAt &&
      combatState.startedAt > combatState.pausedAt) {
    errors.push('Start time cannot be after pause time');
  }
}

/**
 * Validates initiative order values
 */
function validateInitiativeValues(combatState: ICombatState, errors: string[]): void {
  for (const entry of combatState.initiativeOrder) {
    if (entry.initiative < 0) {
      errors.push(`Participant ${entry.participantId} has negative initiative`);
    }
    if (entry.dexterity < 0) {
      errors.push(`Participant ${entry.participantId} has negative dexterity`);
    }
  }

  // Check for duplicates
  const participantIds = combatState.initiativeOrder.map(entry => entry.participantId.toString());
  const uniqueIds = new Set(participantIds);
  if (participantIds.length !== uniqueIds.size) {
    errors.push('Duplicate participants found in initiative order');
  }
}

/**
 * Validates the integrity of combat state
 */
export function validateCombatState(encounter: IEncounter): CombatStateValidation {
  const errors: string[] = [];
  const { combatState } = encounter;

  validateRoundAndTurn(combatState, errors);
  validateActiveParticipants(combatState, errors);
  validateTimestamps(combatState, errors);
  validateInitiativeValues(combatState, errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Enhanced combat state management functions that integrate with existing methods
 */

/**
 * Enhanced start combat with logging
 */
export function enhancedStartCombat(
  encounter: IEncounter,
  autoRollInitiative = false
): void {
  // Clear previous combat history
  clearCombatHistory(encounter._id.toString());

  // Log the combat start
  logCombatAction(encounter._id.toString(), {
    action: 'combat_started',
    round: 1,
    turn: 0,
    details: { autoRollInitiative, participantCount: encounter.participants.length },
  });

  // Save initial state
  saveCombatState(encounter);
}

/**
 * Enhanced end combat with logging
 */
export function enhancedEndCombat(encounter: IEncounter): void {
  // Log the combat end
  logCombatAction(encounter._id.toString(), {
    action: 'combat_ended',
    round: encounter.combatState.currentRound,
    turn: encounter.combatState.currentTurn,
    details: {
      totalRounds: encounter.combatState.currentRound,
      totalDuration: encounter.combatState.totalDuration
    },
  });

  // Clear the saved state since combat is over
  combatStateStore.delete(encounter._id.toString());
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(`combat_state_${encounter._id}`);
  }
}

/**
 * Logs turn end for current participant
 */
function logCurrentTurnEnd(encounter: IEncounter, currentRound: number, currentTurn: number): void {
  if (encounter.combatState.initiativeOrder.length > 0) {
    const currentEntry = encounter.combatState.initiativeOrder[currentTurn];
    if (currentEntry) {
      logCombatAction(encounter._id.toString(), {
        action: 'turn_end',
        round: currentRound,
        turn: currentTurn,
        participantId: currentEntry.participantId,
      });
    }
  }
}

/**
 * Logs round transitions
 */
function logRoundTransition(encounterId: string, willStartNewRound: boolean,
                           currentRound: number, currentTurn: number,
                           newCurrentRound: number, newCurrentTurn: number): void {
  if (willStartNewRound) {
    logCombatAction(encounterId, {
      action: 'round_end',
      round: currentRound,
      turn: currentTurn,
    });

    logCombatAction(encounterId, {
      action: 'round_start',
      round: newCurrentRound,
      turn: newCurrentTurn,
    });
  }
}

/**
 * Logs turn start for new participant
 */
function logNewTurnStart(encounter: IEncounter, newCurrentRound: number, newCurrentTurn: number): void {
  if (encounter.combatState.initiativeOrder.length > 0) {
    const nextEntry = encounter.combatState.initiativeOrder[newCurrentTurn];
    if (nextEntry) {
      logCombatAction(encounter._id.toString(), {
        action: 'turn_start',
        round: newCurrentRound,
        turn: newCurrentTurn,
        participantId: nextEntry.participantId,
      });
    }
  }
}

/**
 * Enhanced next turn with logging
 */
export function enhancedNextTurn(encounter: IEncounter): boolean {
  const currentRound = encounter.combatState.currentRound;
  const currentTurn = encounter.combatState.currentTurn;
  const encounterId = encounter._id.toString();

  logCurrentTurnEnd(encounter, currentRound, currentTurn);

  // Check if we're about to start a new round
  const willStartNewRound = (currentTurn + 1) >= encounter.combatState.initiativeOrder.length;
  const newCurrentTurn = willStartNewRound ? 0 : currentTurn + 1;
  const newCurrentRound = willStartNewRound ? currentRound + 1 : currentRound;

  logRoundTransition(encounterId, willStartNewRound, currentRound, currentTurn,
                    newCurrentRound, newCurrentTurn);
  logNewTurnStart(encounter, newCurrentRound, newCurrentTurn);

  // Save state after turn change
  saveCombatState(encounter);
  return true;
}