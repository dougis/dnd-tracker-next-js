'use client';

import { IParticipantReference } from '@/lib/models/encounter/interfaces';

/**
 * Helper function to find participant by character ID
 */
export function findParticipantById(
  participants: IParticipantReference[],
  participantId: string
): IParticipantReference | undefined {
  return participants.find(p =>
    p.characterId.toString() === participantId.toString()
  );
}