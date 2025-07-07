'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { characterCreationSchema, CharacterCreation } from '@/lib/validations/character';
import { useFormValidation } from '@/lib/validations/form-integration';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { BasicInfoValidationSection } from './sections/BasicInfoValidationSection';
import { AbilityScoresValidationSection } from './sections/AbilityScoresValidationSection';
import { ClassesValidationSection } from './sections/ClassesValidationSection';
import { CombatStatsValidationSection } from './sections/CombatStatsValidationSection';
import { CharacterPreview } from './CharacterPreview';
import { useCharacterSubmit } from './hooks/useCharacterSubmit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_CHARACTER_VALUES } from './constants';
import { transformToPreviewFormat } from './utils';

interface CharacterValidationFormProps {
  ownerId: string;
  onSuccess?: (_character: any) => void;
  onCancel?: () => void;
  isOpen: boolean;
  initialValues?: Partial<CharacterCreation>;
}

export function CharacterValidationForm({
  ownerId,
  onSuccess,
  onCancel,
  isOpen,
  initialValues,
}: CharacterValidationFormProps) {
  // Use the project's form validation utilities
  const { resolver } = useFormValidation(characterCreationSchema);

  const defaultValues: CharacterCreation = {
    ...DEFAULT_CHARACTER_VALUES,
    ...initialValues,
  };

  const form = useForm<CharacterCreation>({
    resolver,
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const {
    submitCharacter,
    isSubmitting,
    submitError,
  } = useCharacterSubmit({
    ownerId,
    onSuccess: (_character) => {
      onSuccess?.(_character);
    },
  });

  const onSubmit = async (data: CharacterCreation) => {
    await submitCharacter(data);
  };

  const handleFormSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const isFormValid = form.formState.isValid;
  const formValues = form.watch();

  return (
    <FormModal
      open={isOpen}
      onOpenChange={(open) => { if (!open) onCancel?.(); }}
      onSubmit={isFormValid ? handleFormSubmit : undefined}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      config={{
        title: "Create Character",
        description: "Build your character with real-time validation",
        submitText: "Create Character",
        cancelText: "Cancel",
        size: "xl",
      }}
    >
      <Form {...form}>
        <div className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to create character: {submitError.message}
                {submitError.details && (
                  <div className="text-xs mt-1">
                    Details: {submitError.details}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BasicInfoValidationSection
                form={form}
              />

              <AbilityScoresValidationSection
                form={form}
              />

              <ClassesValidationSection
                form={form}
              />

              <CombatStatsValidationSection
                form={form}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <CharacterPreview
                  {...transformToPreviewFormat(formValues)}
                  isValid={isFormValid}
                />
              </div>
            </div>
          </div>

          {/* Form validation status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Form Status: {isFormValid ? 'Valid' : 'Invalid'}
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(form.formState.errors).length} errors
              </div>
            </div>

            {Object.keys(form.formState.errors).length > 0 && (
              <div className="mt-2 text-sm text-destructive">
                Please fix the errors above to continue
              </div>
            )}
          </div>
        </div>
      </Form>
    </FormModal>
  );
}