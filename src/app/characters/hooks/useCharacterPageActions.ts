import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ICharacter } from '@/lib/models/Character';

/**
 * Custom hook for managing character page actions
 * Reduces complexity by centralizing character action handlers
 */
export function useCharacterPageActions() {
  const router = useRouter();
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);

  const navigationActions = {
    selectCharacter: (character: ICharacter) => {
      router.push(`/characters/${character._id}`);
    },

    editCharacter: (character: ICharacter) => {
      router.push(`/characters/${character._id}`);
    },
  };

  const characterActions = {
    deleteCharacter: (character: ICharacter) => {
      // TODO: Implement character deletion confirmation dialog
      console.log('Delete character:', character._id);
    },

    duplicateCharacter: (character: ICharacter) => {
      // TODO: Implement character duplication
      console.log('Duplicate character:', character._id);
    },
  };

  const formActions = {
    openCreationForm: () => setIsCreationFormOpen(true),
    closeCreationForm: () => setIsCreationFormOpen(false),

    handleCreationSuccess: (character: any) => {
      setIsCreationFormOpen(false);
      if (character?._id) {
        router.push(`/characters/${character._id}`);
      }
    },
  };

  return {
    isCreationFormOpen,
    ...navigationActions,
    ...characterActions,
    ...formActions,
  };
}