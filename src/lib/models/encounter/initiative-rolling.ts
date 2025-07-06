import { rollInitiative, sortInitiativeOrder } from './utils';
import { IParticipantReference, IInitiativeEntry } from './interfaces';

/**
 * Result of an initiative roll with breakdown
 */
export interface InitiativeRollResult {
  total: number;
  d20Roll: number;
  modifier: number;
}

/**
 * Extended initiative entry with participant information for rolling
 */
export interface InitiativeEntryWithInfo extends IInitiativeEntry {
  name: string;
  type: 'pc' | 'npc' | 'monster';
}

/**
 * Extended participant interface with ability scores for rolling
 */
export interface IParticipantWithAbilityScores extends IParticipantReference {
  abilityScores: {
    dexterity: number;
    [key: string]: number;
  };
}

/**
 * Calculate dexterity modifier from ability score
 */
export function calculateInitiativeModifier(dexterity: number): number {
  return Math.floor((dexterity - 10) / 2);
}

/**
 * Roll initiative with dexterity modifier
 */
export function rollInitiativeWithModifier(dexterity: number): InitiativeRollResult {
  const d20Roll = rollInitiative();
  const modifier = calculateInitiativeModifier(dexterity);
  const total = Math.max(1, d20Roll + modifier); // Minimum result of 1

  return {
    total,
    d20Roll,
    modifier,
  };
}

/**
 * Generate initiative entries from participants without rolling
 */
export function generateInitiativeEntries(
  participants: IParticipantWithAbilityScores[],
  preserveExisting = false
): IInitiativeEntry[] {
  return participants.map((participant) => ({
    participantId: participant.characterId,
    initiative: preserveExisting ? participant.initiative || 0 : 0,
    dexterity: participant.abilityScores.dexterity,
    isActive: false,
    hasActed: false,
  }));
}

/**
 * Roll initiative for all participants and return sorted entries
 */
export function rollBulkInitiative(
  participants: IParticipantWithAbilityScores[]
): InitiativeEntryWithInfo[] {
  const entries: InitiativeEntryWithInfo[] = participants.map((participant) => {
    const rollResult = rollInitiativeWithModifier(participant.abilityScores.dexterity);

    return {
      participantId: participant.characterId,
      initiative: rollResult.total,
      dexterity: participant.abilityScores.dexterity,
      isActive: false,
      hasActed: false,
      name: participant.name,
      type: participant.type,
    };
  });

  // Sort by initiative value, then by dexterity
  return sortInitiativeOrder(entries) as InitiativeEntryWithInfo[];
}

/**
 * Reroll initiative for specific participant or all participants
 */
export function rerollInitiative(
  currentEntries: IInitiativeEntry[],
  participantId?: string
): IInitiativeEntry[] {
  const entries = currentEntries.map((entry) => {
    // If participantId is provided, only reroll for that participant
    if (participantId && entry.participantId.toString() !== participantId) {
      return entry;
    }

    const rollResult = rollInitiativeWithModifier(entry.dexterity);

    return {
      ...entry,
      initiative: rollResult.total,
    };
  });

  // Sort the updated entries
  return sortInitiativeOrder(entries);
}

/**
 * Roll initiative for a single participant and update their entry
 */
export function rollSingleInitiative(
  currentEntries: IInitiativeEntry[],
  participantId: string,
  dexterity: number
): IInitiativeEntry[] {
  const rollResult = rollInitiativeWithModifier(dexterity);

  const entries = currentEntries.map((entry) => {
    if (entry.participantId.toString() === participantId) {
      return {
        ...entry,
        initiative: rollResult.total,
        dexterity,
      };
    }
    return entry;
  });

  return sortInitiativeOrder(entries);
}

/**
 * Get initiative roll breakdown for display
 */
export function getInitiativeRollBreakdown(
  total: number,
  dexterity: number
): { d20Roll: number; modifier: number } {
  const modifier = calculateInitiativeModifier(dexterity);
  const d20Roll = total - modifier;

  return {
    d20Roll: Math.max(1, Math.min(20, d20Roll)), // Ensure valid d20 range
    modifier,
  };
}

/**
 * Validate initiative preferences
 */
export interface InitiativePreferences {
  autoRollOnCombatStart: boolean;
  showRollBreakdown: boolean;
  allowPlayerRerolls: boolean;
  tiebreakByDexterity: boolean;
}

export function getDefaultInitiativePreferences(): InitiativePreferences {
  return {
    autoRollOnCombatStart: false,
    showRollBreakdown: true,
    allowPlayerRerolls: true,
    tiebreakByDexterity: true,
  };
}

/**
 * Apply initiative preferences to rolling behavior
 */
export function shouldAutoRoll(preferences: InitiativePreferences): boolean {
  return preferences.autoRollOnCombatStart;
}

export function canReroll(
  preferences: InitiativePreferences,
  participantType: 'pc' | 'npc'
): boolean {
  return preferences.allowPlayerRerolls || participantType === 'npc';
}