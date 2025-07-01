import { Types } from 'mongoose';
import { IParticipantReference, IInitiativeEntry } from '../interfaces';

/**
 * Shared test helper functions to eliminate code duplication
 */

export const createTestParticipant = (overrides?: Partial<IParticipantReference>): IParticipantReference => ({
  characterId: new Types.ObjectId(),
  name: 'Test Character',
  type: 'pc',
  maxHitPoints: 100,
  currentHitPoints: 80,
  temporaryHitPoints: 0,
  armorClass: 15,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
  ...overrides,
});

export const createTestInitiativeEntry = (overrides?: Partial<IInitiativeEntry>): IInitiativeEntry => ({
  participantId: new Types.ObjectId(),
  initiative: 15,
  dexterity: 14,
  isActive: false,
  hasActed: false,
  ...overrides,
});

export const createMockConstructorSetup = () => {
  const mockInstance = {
    save: jest.fn().mockResolvedValue(true),
  };
  const MockConstructor = jest.fn().mockReturnValue(mockInstance);
  return { mockInstance, MockConstructor };
};