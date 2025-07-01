'use client';

import { useState } from 'react';
import { CharacterService } from '@/lib/services/CharacterService';
import { CharacterCreation } from '@/lib/validations/character';

interface UseCharacterSubmitProps {
  ownerId: string;
  onSuccess?: (_character: any) => void;
  onError?: (_error: any) => void;
}

interface SubmitError {
  code: string;
  message: string;
  details?: string;
}

export function useCharacterSubmit({ ownerId, onSuccess, onError }: UseCharacterSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);

  const submitCharacter = async (characterData: CharacterCreation) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await CharacterService.createCharacter(ownerId, characterData);

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        const error: SubmitError = {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
        };
        setSubmitError(error);
        onError?.(error);
      }
    } catch (error) {
      const submitError: SubmitError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      setSubmitError(submitError);
      onError?.(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setSubmitError(null);
  };

  return {
    submitCharacter,
    isSubmitting,
    submitError,
    clearError,
  };
}