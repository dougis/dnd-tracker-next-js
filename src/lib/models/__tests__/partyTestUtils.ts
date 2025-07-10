import { Character } from '../Character';
import User from '../User';
import { Party } from '../Party';
import { Types } from 'mongoose';

// Test data generators
export async function createTestUser(overrides?: Partial<{
  email: string;
  name: string;
}>): Promise<any> {
  return await User.create({
    email: overrides?.email || 'dm@example.com',
    password: 'password123',
    name: overrides?.name || 'Dungeon Master',
    isEmailVerified: true,
  });
}

export async function createTestParty(ownerId: Types.ObjectId, overrides?: Partial<{
  name: string;
  description: string;
}>): Promise<any> {
  return await Party.create({
    ownerId,
    name: overrides?.name || 'Test Party',
    description: overrides?.description || 'Test party description',
  });
}

export async function createTestCharacter(
  ownerId: Types.ObjectId,
  partyId: Types.ObjectId,
  type: 'pc' | 'npc' = 'pc',
  overrides?: Partial<{
    name: string;
    race: string;
    level: number;
  }>
): Promise<any> {
  const baseCharacter = {
    ownerId,
    name: overrides?.name || 'Test Character',
    type,
    race: overrides?.race || 'Human',
    classes: [{ class: 'Fighter', level: overrides?.level || 5, hitDie: 10 }],
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    armorClass: 18,
    hitPointsCurrent: 45,
    hitPointsMax: 45,
    proficiencyBonus: 3,
    savingThrowProficiencies: {
      strength: true,
      dexterity: false,
      constitution: true,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    backstory: 'A brave fighter',
    notes: 'Test character',
    partyId,
  };

  return await Character.create(baseCharacter);
}

export async function createTestCharacterWithLevel(
  ownerId: Types.ObjectId,
  partyId: Types.ObjectId,
  level: number,
  className = 'Fighter'
): Promise<any> {
  return await createTestCharacter(ownerId, partyId, 'pc', {
    name: `${className} Level ${level}`,
    level,
  });
}

// Cleanup helpers
export async function cleanupTestData(): Promise<void> {
  await Character.deleteMany({});
  await Party.deleteMany({});
  await User.deleteMany({});
}