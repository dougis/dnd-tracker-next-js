import { useCallback, useState } from 'react';
import { Types } from 'mongoose';
import { EncounterService } from '@/lib/services/EncounterService';
import type { IEncounter } from '@/lib/models/encounter/interfaces';
import { handleServiceOperation } from '../utils/serviceOperationUtils';

interface ParticipantFormData {
  name: string;
  type: 'pc' | 'npc' | 'monster';
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  armorClass: number;
  initiative?: number;
  isPlayer: boolean;
  isVisible: boolean;
  notes: string;
  conditions: string[];
}

export const useParticipantOperations = (
  encounter: IEncounter,
  onUpdate?: (_updatedEncounter: IEncounter) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const createParticipantData = useCallback((data: ParticipantFormData) => ({
    ...data,
    characterId: new Types.ObjectId().toString(),
    currentHitPoints: data.maxHitPoints,
  }), []);

  const executeWithLoading = useCallback(async (operation: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await operation();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addParticipant = useCallback(async (
    formData: ParticipantFormData,
    onSuccess: () => void
  ) => {
    await executeWithLoading(async () => {
      const participantData = createParticipantData(formData);
      await handleServiceOperation(
        () => EncounterService.addParticipant(encounter._id.toString(), participantData),
        'Participant added successfully',
        (data) => {
          onUpdate?.(data!);
          onSuccess();
        }
      );
    });
  }, [encounter._id, createParticipantData, executeWithLoading, onUpdate]);

  const updateParticipant = useCallback(async (
    participantId: string,
    formData: ParticipantFormData,
    onSuccess: () => void
  ) => {
    await executeWithLoading(async () => {
      // For updates, don't include characterId as it shouldn't be changed
      const { characterId: _characterId, ...updateData } = createParticipantData(formData);
      await handleServiceOperation(
        () => EncounterService.updateParticipant(encounter._id.toString(), participantId, updateData),
        'Participant updated successfully',
        (data) => {
          onUpdate?.(data!);
          onSuccess();
        }
      );
    });
  }, [encounter._id, createParticipantData, executeWithLoading, onUpdate]);

  const removeParticipant = useCallback(async (participantId: string) => {
    await executeWithLoading(async () => {
      await handleServiceOperation(
        () => EncounterService.removeParticipant(encounter._id.toString(), participantId),
        'Participant removed successfully',
        (data) => onUpdate?.(data!)
      );
    });
  }, [encounter._id, executeWithLoading, onUpdate]);

  return {
    isLoading,
    addParticipant,
    updateParticipant,
    removeParticipant,
  };
};