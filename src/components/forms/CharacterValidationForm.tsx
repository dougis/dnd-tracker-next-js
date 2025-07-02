'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  enhancedCharacterCreationSchema,
  RealtimeValidator,
  CharacterConsistencyChecker,
  CHARACTER_VALIDATION_MESSAGES,
  type EnhancedCharacterCreation,
  type ConsistencyWarning,
} from '@/lib/validations/character-enhanced';
import {
  CharacterDataRecovery,
  useCharacterAutoSave,
  type ValidationErrorWithFix,
} from '@/lib/validations/error-recovery';
import { FormInput, FormSelect, FormTextarea } from '@/components/forms';
import { AlertTriangle, CheckCircle, Info, Save, RotateCcw } from 'lucide-react';

interface CharacterValidationFormProps {
  initialData?: Partial<EnhancedCharacterCreation>;
  characterId?: string;
  onSubmit: (_data: EnhancedCharacterCreation) => Promise<void>;
  onValidationChange?: (_isValid: boolean, _errors: ValidationErrorWithFix[]) => void;
  showConsistencyWarnings?: boolean;
  enableAutoSave?: boolean;
}

export function CharacterValidationForm({
  initialData = {},
  characterId,
  onSubmit,
  onValidationChange,
  showConsistencyWarnings = true,
  enableAutoSave = true,
}: CharacterValidationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consistencyWarnings, setConsistencyWarnings] = useState<ConsistencyWarning[]>([]);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [hasRecoveryData, setHasRecoveryData] = useState(false);

  const form = useForm<EnhancedCharacterCreation>({
    resolver: zodResolver(enhancedCharacterCreationSchema),
    defaultValues: {
      name: '',
      type: 'pc',
      race: 'human',
      size: 'medium',
      classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      hitPoints: { maximum: 10, current: 10, temporary: 0 },
      armorClass: 10,
      speed: 30,
      proficiencyBonus: 2,
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
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedValues = useWatch({ control: form.control });

  // Auto-save functionality
  const cleanupAutoSave = useCharacterAutoSave(watchedValues, characterId, {
    enableAutoSave,
    autoSaveInterval: 30000, // 30 seconds
  });

  // Check for recovery data on mount
  useEffect(() => {
    const autoSaved = CharacterDataRecovery.getAutoSavedData();
    if (autoSaved && autoSaved.characterId === characterId) {
      setHasRecoveryData(true);
    }
  }, [characterId]);

  // Real-time validation and consistency checking
  useEffect(() => {
    const validationResult = RealtimeValidator.validateCharacterData(watchedValues);

    if (onValidationChange) {
      const errors: ValidationErrorWithFix[] = validationResult.errors?.map(error => ({
        ...error,
        suggestedFix: getSuggestedFix(error.field, error.message),
      })) || [];

      onValidationChange(validationResult.success, errors);
    }

    // Update consistency warnings
    if (showConsistencyWarnings && validationResult.success) {
      const warnings = CharacterConsistencyChecker.checkConsistency(validationResult.data);
      setConsistencyWarnings(warnings);
    }

    // Update auto-save timestamp
    if (enableAutoSave) {
      setLastAutoSave(new Date());
    }
  }, [watchedValues, onValidationChange, showConsistencyWarnings, enableAutoSave]);

  // Cleanup auto-save on unmount
  useEffect(() => {
    return cleanupAutoSave;
  }, [cleanupAutoSave]);

  const getSuggestedFix = (field: string | undefined, _message: string): string => {
    if (!field) return 'Please check the value and try again';

    if (field.includes('name')) {
      return CHARACTER_VALIDATION_MESSAGES.name.tooShort;
    }
    if (field.includes('abilityScores')) {
      return 'Ability scores should be between 1 and 30 (8-15 is typical for most characters)';
    }
    if (field.includes('hitPoints')) {
      return 'Hit points should be positive and current HP should not exceed maximum';
    }
    if (field.includes('armorClass')) {
      return 'Armor class should be at least 10 (10 + Dex modifier + armor bonus)';
    }

    return 'Please verify this field meets the requirements';
  };

  const handleSubmit = async (data: EnhancedCharacterCreation) => {
    setIsSubmitting(true);
    try {
      // Create backup before submission
      CharacterDataRecovery.createBackup(data, 'pre-operation', characterId);

      await onSubmit(data);

      // Clear auto-save data after successful submission
      CharacterDataRecovery.clearAutoSavedData();
      setHasRecoveryData(false);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverData = () => {
    const autoSaved = CharacterDataRecovery.getAutoSavedData();
    if (autoSaved?.data) {
      form.reset({ ...form.getValues(), ...autoSaved.data });
      setHasRecoveryData(false);
    }
  };

  const handleCreateBackup = () => {
    const currentData = form.getValues();
    CharacterDataRecovery.createBackup(currentData, 'manual', characterId);
  };

  const race = form.watch('race');
  const isCustomRace = race === 'custom';

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Recovery Alert */}
        {hasRecoveryData && (
          <Alert>
            <Save className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Auto-saved data found. Would you like to recover your previous work?</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRecoverData}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Recover
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setHasRecoveryData(false)}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-save Status */}
        {enableAutoSave && lastAutoSave && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Auto-saved at {lastAutoSave.toLocaleTimeString()}
          </div>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="abilities">Abilities</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="combat">Combat Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Character identity and background details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  name="name"
                  label="Character Name"
                  placeholder="Enter character name"
                  form={form}
                  validation={{
                    required: CHARACTER_VALIDATION_MESSAGES.name.required,
                    maxLength: {
                      value: 100,
                      message: CHARACTER_VALIDATION_MESSAGES.name.tooLong,
                    },
                  }}
                />

                <FormSelect
                  name="type"
                  label="Character Type"
                  form={form}
                  options={[
                    { value: 'pc', label: 'Player Character (PC)' },
                    { value: 'npc', label: 'Non-Player Character (NPC)' },
                  ]}
                />

                <FormSelect
                  name="race"
                  label="Race"
                  form={form}
                  options={[
                    { value: 'human', label: 'Human' },
                    { value: 'elf', label: 'Elf' },
                    { value: 'dwarf', label: 'Dwarf' },
                    { value: 'halfling', label: 'Halfling' },
                    { value: 'dragonborn', label: 'Dragonborn' },
                    { value: 'gnome', label: 'Gnome' },
                    { value: 'half-elf', label: 'Half-Elf' },
                    { value: 'half-orc', label: 'Half-Orc' },
                    { value: 'tiefling', label: 'Tiefling' },
                    { value: 'custom', label: 'Custom Race' },
                  ]}
                />

                {isCustomRace && (
                  <FormInput
                    name="customRace"
                    label="Custom Race Name"
                    placeholder="Enter custom race name"
                    form={form}
                    validation={{
                      required: CHARACTER_VALIDATION_MESSAGES.race.customRequired,
                    }}
                  />
                )}

                <FormSelect
                  name="size"
                  label="Size"
                  form={form}
                  options={[
                    { value: 'tiny', label: 'Tiny' },
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                    { value: 'huge', label: 'Huge' },
                    { value: 'gargantuan', label: 'Gargantuan' },
                  ]}
                />

                <FormTextarea
                  name="backstory"
                  label="Backstory"
                  placeholder="Character background and history..."
                  form={form}
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ability Scores</CardTitle>
                <CardDescription>
                  Set your character&apos;s six core ability scores (typically 8-15 for most characters)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'strength', label: 'Strength' },
                  { key: 'dexterity', label: 'Dexterity' },
                  { key: 'constitution', label: 'Constitution' },
                  { key: 'intelligence', label: 'Intelligence' },
                  { key: 'wisdom', label: 'Wisdom' },
                  { key: 'charisma', label: 'Charisma' },
                ].map(({ key, label }) => (
                  <FormInput
                    key={key}
                    name={`abilityScores.${key}`}
                    label={label}
                    type="number"
                    form={form}
                    validation={{
                      min: {
                        value: 1,
                        message: CHARACTER_VALIDATION_MESSAGES.abilityScores.tooLow,
                      },
                      max: {
                        value: 30,
                        message: CHARACTER_VALIDATION_MESSAGES.abilityScores.tooHigh,
                      },
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Character Classes</CardTitle>
                <CardDescription>
                  Define your character&apos;s class levels (multiclassing supported)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This would be a more complex component for managing class arrays */}
                <div className="text-muted-foreground">
                  Class management component would go here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="combat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Combat Statistics</CardTitle>
                <CardDescription>
                  Hit points, armor class, and other combat-related stats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="hitPoints.maximum"
                    label="Maximum Hit Points"
                    type="number"
                    form={form}
                    validation={{
                      min: {
                        value: 1,
                        message: CHARACTER_VALIDATION_MESSAGES.hitPoints.maximumTooLow,
                      },
                    }}
                  />

                  <FormInput
                    name="hitPoints.current"
                    label="Current Hit Points"
                    type="number"
                    form={form}
                    validation={{
                      min: {
                        value: 0,
                        message: CHARACTER_VALIDATION_MESSAGES.hitPoints.currentTooLow,
                      },
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="armorClass"
                    label="Armor Class"
                    type="number"
                    form={form}
                    validation={{
                      min: {
                        value: 1,
                        message: CHARACTER_VALIDATION_MESSAGES.armorClass.tooLow,
                      },
                      max: {
                        value: 30,
                        message: CHARACTER_VALIDATION_MESSAGES.armorClass.tooHigh,
                      },
                    }}
                  />

                  <FormInput
                    name="speed"
                    label="Speed (feet)"
                    type="number"
                    form={form}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Consistency Warnings */}
        {showConsistencyWarnings && consistencyWarnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Character Consistency Checks
              </CardTitle>
              <CardDescription>
                These warnings help ensure your character build is balanced and functional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {consistencyWarnings.map((warning, index) => (
                <Alert key={index} variant={warning.severity === 'warning' ? 'destructive' : 'default'}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {warning.severity === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 mt-0.5" />
                      )}
                      <div>
                        <AlertDescription>{warning.message}</AlertDescription>
                        {warning.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Suggestion: {warning.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={warning.severity === 'warning' ? 'destructive' : 'secondary'}>
                      {warning.severity}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCreateBackup}
            >
              <Save className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? 'Saving...' : 'Save Character'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}