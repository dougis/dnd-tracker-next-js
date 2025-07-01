/**
 * Central export file for all database models
 */

import User from './User';
import { Character } from './Character';
import { Encounter } from './encounter';

// Export models
export { User, Character, Encounter };

// Export User interfaces
export type {
  IUser,
  UserModel,
  PublicUser,
  CreateUserInput,
  SubscriptionFeature,
} from './User';

// Export Character interfaces
export type {
  ICharacter,
  CharacterModel,
  CharacterSummary,
} from './Character';

// Export Encounter interfaces
export type {
  IEncounter,
  EncounterModel,
  EncounterSummary,
  CreateEncounterInput,
  IParticipantReference,
  IInitiativeEntry,
  IEncounterSettings,
  ICombatState,
  IPosition,
} from './encounter';

// Export subscription limits
export { SUBSCRIPTION_LIMITS } from './User';
