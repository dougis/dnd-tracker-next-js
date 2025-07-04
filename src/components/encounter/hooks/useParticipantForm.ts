import { useCallback, useState } from 'react';
import type { IParticipantReference } from '@/lib/models/encounter/interfaces';

export interface ParticipantFormData {
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

const initialFormData: ParticipantFormData = {
  name: '',
  type: 'pc',
  maxHitPoints: 1,
  currentHitPoints: 1,
  temporaryHitPoints: 0,
  armorClass: 10,
  initiative: undefined,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
};

export const useParticipantForm = () => {
  const [formData, setFormData] = useState<ParticipantFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((data: ParticipantFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = 'Name is required';
    }

    if (data.maxHitPoints <= 0) {
      errors.maxHitPoints = 'Hit Points must be greater than 0';
    }

    if (data.armorClass < 0) {
      errors.armorClass = 'Armor Class cannot be negative';
    }

    return errors;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormErrors({});
  }, []);

  const loadParticipantData = useCallback((participant: IParticipantReference) => {
    setFormData({
      name: participant.name,
      type: participant.type,
      maxHitPoints: participant.maxHitPoints,
      currentHitPoints: participant.currentHitPoints,
      temporaryHitPoints: participant.temporaryHitPoints,
      armorClass: participant.armorClass,
      initiative: participant.initiative,
      isPlayer: participant.isPlayer,
      isVisible: participant.isVisible,
      notes: participant.notes,
      conditions: participant.conditions,
    });
  }, []);

  const isFormValid = useCallback((data: ParticipantFormData) => {
    const errors = validateForm(data);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateForm]);

  return {
    formData,
    setFormData,
    formErrors,
    resetForm,
    loadParticipantData,
    isFormValid,
  };
};