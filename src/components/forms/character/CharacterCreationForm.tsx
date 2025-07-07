'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FormModal } from '@/components/modals/FormModal';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { AbilityScoresSection } from './sections/AbilityScoresSection';
import { ClassesSection } from './sections/ClassesSection';
import { CombatStatsSection } from './sections/CombatStatsSection';
import { CharacterPreview } from './CharacterPreview';
import { useCharacterForm } from './hooks/useCharacterForm';
import { useCharacterSubmit } from './hooks/useCharacterSubmit';
import { CharacterCreation } from '@/lib/validations/character';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


interface CharacterCreationFormProps {
  ownerId: string;
  onSuccess?: (_character: any) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function CharacterCreationForm({
  ownerId,
  onSuccess,
  onCancel,
  isOpen,
}: CharacterCreationFormProps) {
  const router = useRouter();
  const {
    formData,
    errors,
    updateBasicInfo,
    updateAbilityScores,
    updateClasses,
    updateCombatStats,
    validateForm,
    isFormValid,
  } = useCharacterForm();

  const {
    submitCharacter,
    isSubmitting,
    submitError,
  } = useCharacterSubmit({
    ownerId,
    onSuccess: (_character) => {
      onSuccess?.(_character);
      router.push(`/characters/${_character.id}` as any);
    },
  });

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const characterData: CharacterCreation = {
      name: formData.basicInfo.name,
      type: formData.basicInfo.type,
      race: formData.basicInfo.race === 'custom' ? 'custom' : (formData.basicInfo.race as any),
      customRace: formData.basicInfo.race === 'custom' ? formData.basicInfo.customRace : undefined,
      size: formData.basicInfo.size,
      classes: formData.classes.map(cls => ({
        class: cls.class,
        level: cls.level,
        hitDie: cls.hitDie,
      })),
      abilityScores: formData.abilityScores,
      hitPoints: {
        maximum: formData.combatStats.hitPoints.maximum,
        current: formData.combatStats.hitPoints.current,
        temporary: formData.combatStats.hitPoints.temporary || 0,
      },
      armorClass: formData.combatStats.armorClass,
      speed: formData.combatStats.speed || 30,
      proficiencyBonus: formData.combatStats.proficiencyBonus || 2,
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: false,
        wisdom: false,
        charisma: false,
      },
      skills: {},
      equipment: [],
      spells: [],
    };

    await submitCharacter(characterData);
  };

  return (
    <FormModal
      open={isOpen}
      onOpenChange={(open) => { if (!open) onCancel?.(); }}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      config={{
        title: "Create Character",
        description: "Build your character for your next adventure",
        size: "4xl",
        submitText: isSubmitting ? 'Creating Character...' : 'Create Character',
        cancelText: "Cancel",
      }}
    >
      <div className="space-y-8">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError.message || 'Failed to create character. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BasicInfoSection
              value={formData.basicInfo}
              onChange={updateBasicInfo}
              errors={errors.basicInfo}
            />

            <AbilityScoresSection
              value={formData.abilityScores}
              onChange={updateAbilityScores}
              errors={errors.abilityScores}
            />

            <ClassesSection
              value={formData.classes}
              onChange={updateClasses}
              errors={errors.classes}
            />

            <CombatStatsSection
              value={formData.combatStats}
              onChange={updateCombatStats}
              errors={errors.combatStats}
              abilityScores={formData.abilityScores}
              classes={formData.classes}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CharacterPreview
                basicInfo={formData.basicInfo}
                abilityScores={formData.abilityScores}
                classes={formData.classes}
                combatStats={formData.combatStats}
                isValid={isFormValid}
              />
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}