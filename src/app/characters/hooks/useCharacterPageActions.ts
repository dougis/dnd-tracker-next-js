import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useConfirmationDialog } from '@/components/modals/ConfirmationDialog';
import { CharacterService } from '@/lib/services/CharacterService';
import type { ICharacter } from '@/lib/models/Character';

/**
 * Custom hook for managing character page actions
 * Reduces complexity by centralizing character action handlers
 */
export function useCharacterPageActions() {
  const router = useRouter();
  const { data: session } = useSession();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const navigationActions = {
    selectCharacter: (character: ICharacter) => {
      router.push(`/characters/${character._id}`);
    },

    editCharacter: (character: ICharacter) => {
      router.push(`/characters/${character._id}`);
    },
  };

  const characterActions = {
    deleteCharacter: async (character: ICharacter) => {
      if (!session?.user?.id) {
        return;
      }

      try {
        const confirmed = await confirm({
          title: 'Delete Character',
          description: `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          variant: 'destructive',
          loading: isDeleting,
          onConfirm: () => {},
        });

        if (confirmed) {
          setIsDeleting(true);
          try {
            const result = await CharacterService.deleteCharacter(
              character._id,
              session.user.id
            );

            if (!result.success) {
              console.error('Failed to delete character:', result.error);
              // TODO: Show error toast notification
            }
          } catch (error) {
            console.error('Error deleting character:', error);
            // TODO: Show error toast notification
          } finally {
            setIsDeleting(false);
          }
        }

        return confirmed;
      } catch (error) {
        console.error('Error in delete confirmation:', error);
      }
    },

    duplicateCharacter: async (character: ICharacter) => {
      if (!session?.user?.id) {
        return;
      }

      // Simple prompt for character name
      const newName = prompt(`Enter name for the duplicate character:`, `${character.name} (Copy)`);

      if (!newName) {
        return false; // User cancelled
      }

      setIsDuplicating(true);
      try {
        const result = await CharacterService.cloneCharacter(
          character._id,
          session.user.id,
          newName
        );

        if (result.success) {
          // TODO: Show success toast notification
          if (result.data?._id) {
            router.push(`/characters/${result.data._id}`);
          }
          return true;
        } else {
          console.error('Failed to duplicate character:', result.error);
          // TODO: Show error toast notification
          return false;
        }
      } catch (error) {
        console.error('Error duplicating character:', error);
        // TODO: Show error toast notification
        return false;
      } finally {
        setIsDuplicating(false);
      }
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
    isDeleting,
    isDuplicating,
    ConfirmationDialog,
    ...navigationActions,
    ...characterActions,
    ...formActions,
  };
}