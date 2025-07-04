import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { EncounterListItem } from '../../types';

export const transformEncounter = (encounter: IEncounter): EncounterListItem => {
  const participantCount = encounter.participants?.length || 0;
  const playerCount = encounter.participants?.filter(p => p.type === 'pc').length || 0;

  return {
    id: encounter._id?.toString() || '',
    ownerId: encounter.ownerId,
    name: encounter.name,
    description: encounter.description,
    tags: encounter.tags,
    difficulty: encounter.difficulty,
    estimatedDuration: encounter.estimatedDuration,
    targetLevel: encounter.targetLevel,
    participants: encounter.participants,
    settings: encounter.settings,
    combatState: encounter.combatState,
    status: encounter.status,
    partyId: encounter.partyId,
    isPublic: encounter.isPublic,
    sharedWith: encounter.sharedWith,
    version: encounter.version,
    createdAt: encounter.createdAt,
    updatedAt: encounter.updatedAt,
    participantCount,
    playerCount,
  };
};