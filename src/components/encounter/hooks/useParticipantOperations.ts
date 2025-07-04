import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { EncounterService } from '@/lib/services/EncounterService';
import type { IEncounter, IParticipantReference } from '@/lib/models/encounter/interfaces';

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
  onUpdate?: (updatedEncounter: IEncounter) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceResult = useCallback((result: any, successMessage: string, onSuccess: () => void) => {
    if (result.success) {
      toast.success(successMessage);
      onUpdate?.(result.data!);
      onSuccess();
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Operation failed');
    }
  }, [onUpdate]);

  const createParticipantData = useCallback((data: ParticipantFormData) => ({
    ...data,
    characterId: new Date().getTime().toString(),
    currentHitPoints: data.maxHitPoints,
  }), []);

  const addParticipant = useCallback(async (
    formData: ParticipantFormData,
    onSuccess: () => void
  ) => {
    try {
      setIsLoading(true);
      const participantData = createParticipantData(formData);
      const result = await EncounterService.addParticipant(
        encounter._id.toString(),
        participantData
      );
      handleServiceResult(result, 'Participant added successfully', onSuccess);
    } catch (error) {
      toast.error('An error occurred while adding participant');
      console.error('Add participant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, createParticipantData, handleServiceResult]);

  const updateParticipant = useCallback(async (
    participantId: string,
    formData: ParticipantFormData,
    onSuccess: () => void
  ) => {
    try {
      setIsLoading(true);
      const result = await EncounterService.updateParticipant(
        encounter._id.toString(),
        participantId,
        formData
      );
      handleServiceResult(result, 'Participant updated successfully', onSuccess);
    } catch (error) {
      toast.error('An error occurred while updating participant');
      console.error('Update participant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, handleServiceResult]);

  const removeParticipant = useCallback(async (participantId: string) => {
    try {
      setIsLoading(true);
      const result = await EncounterService.removeParticipant(
        encounter._id.toString(),
        participantId
      );
      handleServiceResult(result, 'Participant removed successfully', () => {});
    } catch (error) {
      toast.error('An error occurred while removing participant');
      console.error('Remove participant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, handleServiceResult]);

  return {
    isLoading,
    addParticipant,
    updateParticipant,
    removeParticipant,
  };
};