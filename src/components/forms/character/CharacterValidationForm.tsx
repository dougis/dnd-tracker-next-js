'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { characterCreationSchema, CharacterCreation } from '@/lib/validations/character';
import { useFormValidation } from '@/lib/validations/form-integration';
import { Form } from '@/components/ui/form';
import { Modal } from '@/components/modals/Modal';
import { Button } from '@/components/ui/button';
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

interface FormError {
  message: string;
  details?: string;
}

function ErrorAlert({ error }: { error: FormError }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to create character: {error.message}
        {error.details && (
          <div className="text-xs mt-1">
            Details: {error.details}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function FormStatus({ isValid, errorCount }: { isValid: boolean; errorCount: number }) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Form Status: {isValid ? 'Valid' : 'Invalid'}
        </div>
        <div className="text-xs text-muted-foreground">
          {errorCount} errors
        </div>
      </div>

      {errorCount > 0 && (
        <div className="mt-2 text-sm text-destructive">
          Please fix the errors above to continue
        </div>
      )}
    </div>
  );
}

function FormActions({
  onCancel,
  onSubmit,
  isSubmitting,
  isValid
}: {
  onCancel?: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Character'}
      </Button>
    </div>
  );
}

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

  const errorCount = Object.keys(form.formState.errors).length;

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => { if (!open) onCancel?.(); }}
      size="xl"
      title="Create Character"
      description="Build your character with real-time validation"
    >
      <div className="space-y-6">
        <Form {...form}>
          <div className="space-y-6">
            {submitError && <ErrorAlert error={submitError} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BasicInfoValidationSection form={form} />
                <AbilityScoresValidationSection form={form} />
                <ClassesValidationSection form={form} />
                <CombatStatsValidationSection form={form} />
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

            <FormStatus isValid={isFormValid} errorCount={errorCount} />
          </div>
        </Form>

        <FormActions
          onCancel={onCancel}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          isValid={isFormValid}
        />
      </div>
    </Modal>
  );
}