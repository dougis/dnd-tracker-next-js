import { useState } from 'react';
import { CreatureType, Size, ChallengeRating, VariantType } from '@/types/npc';
import { DEFAULT_ABILITY_SCORES } from '@/lib/services/__tests__/test-helpers';

export interface NPCFormData {
  name: string;
  creatureType: CreatureType;
  size: Size;
  challengeRating: ChallengeRating;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
    hitDice?: string;
  };
  armorClass: number;
  speed: number;
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: string[];
  languages: string[];
  equipment: Array<{ name: string; type?: 'weapon' | 'armor' | 'tool' | 'misc'; quantity?: number; magical?: boolean }>;
  spells: Array<{ name: string; level: number }>;
  actions: Array<{
    name: string;
    type: 'action' | 'bonus_action' | 'reaction' | 'legendary_action' | 'lair_action';
    description: string;
    attackBonus?: number;
    damage?: string;
    range?: string;
    recharge?: string;
    uses?: number;
    maxUses?: number;
  }>;
  isSpellcaster: boolean;
  personality?: string;
  motivations?: string;
  tactics?: string;
  isVariant: boolean;
  variantType?: VariantType;
}

const initialFormData: NPCFormData = {
  name: '',
  creatureType: 'humanoid',
  size: 'medium',
  challengeRating: 0.5,
  abilityScores: { ...DEFAULT_ABILITY_SCORES },
  hitPoints: {
    maximum: 1,
    current: 1,
    temporary: 0,
  },
  armorClass: 10,
  speed: 30,
  damageVulnerabilities: [],
  damageResistances: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: [],
  languages: [],
  equipment: [],
  spells: [],
  actions: [],
  isSpellcaster: false,
  isVariant: false,
};

export function useNPCForm() {
  const [formData, setFormData] = useState<NPCFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (updates: Partial<NPCFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    validateBasicFields(formData, newErrors);
    validateAbilityScores(formData.abilityScores, newErrors);
    validateHitPoints(formData.hitPoints, newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBasicFields = (data: NPCFormData, errors: Record<string, string>) => {
    if (!data.name.trim()) {
      errors.name = 'NPC name is required';
    }

    if (!data.creatureType) {
      errors.creatureType = 'Creature type is required';
    }

    if (data.challengeRating === undefined) {
      errors.challengeRating = 'Challenge rating is required';
    } else if (data.challengeRating < 0 || data.challengeRating > 30) {
      errors.challengeRating = 'Challenge rating must be between 0 and 30';
    }
  };

  const validateAbilityScores = (abilityScores: Record<string, number>, errors: Record<string, string>) => {
    Object.entries(abilityScores).forEach(([ability, score]) => {
      if (score < 1 || score > 30) {
        errors[ability] = `${ability.charAt(0).toUpperCase() + ability.slice(1)} must be between 1 and 30`;
      }
    });
  };

  const validateHitPoints = (hitPoints: { maximum: number }, errors: Record<string, string>) => {
    if (hitPoints.maximum < 1) {
      errors.hitPoints = 'Hit points must be at least 1';
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateFormData,
    validateForm,
    resetForm,
  };
}