import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { EncounterListItem } from '../../types';

const calculateParticipantCounts = (encounter: IEncounter) => {
  const participantCount = encounter.participants?.length || 0;
  const playerCount = encounter.participants?.filter(p => p.type === 'pc').length || 0;
  return { participantCount, playerCount };
};

const copyBasicFields = (encounter: IEncounter) => ({
  id: encounter._id?.toString() || '',
  ownerId: encounter.ownerId,
  name: encounter.name,
  description: encounter.description,
  tags: encounter.tags,
  difficulty: encounter.difficulty,
  estimatedDuration: encounter.estimatedDuration,
  targetLevel: encounter.targetLevel,
});

const copyComplexFields = (encounter: IEncounter) => ({
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
});

export const transformEncounter = (encounter: IEncounter): EncounterListItem => {
  const basicFields = copyBasicFields(encounter);
  const complexFields = copyComplexFields(encounter);
  const counts = calculateParticipantCounts(encounter);

  return {
    ...basicFields,
    ...complexFields,
    ...counts,
  };
};