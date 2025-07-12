import { EncounterService } from '@/lib/services/EncounterService';
import { createErrorHandler, createSuccessHandler, extractErrorMessage, type ToastFunction } from './errorUtils';
import type { EncounterListItem } from '../types';

export const createNavigationHandlers = (encounter: EncounterListItem, router?: any) => {
  return {
    handleView: () => {
      if (router) {
        router.push(`/encounters/${encounter.id}`);
      }
    },

    handleEdit: () => {
      if (router) {
        router.push(`/encounters/${encounter.id}/edit`);
      }
    },

    handleStartCombat: () => {
      if (router) {
        router.push(`/combat?encounter=${encounter.id}`);
      }
    },

    handleShare: async () => {
      try {
        const shareData = {
          title: encounter.name,
          text: `Check out this D&D encounter: ${encounter.name}`,
          url: `${window.location.origin}/encounters/${encounter.id}`,
        };

        // Try Web Share API first
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareData.url);
        } else {
          throw new Error('Sharing not supported');
        }
      } catch (error) {
        console.error('Error sharing encounter:', error);
      }
    },
  };
};

export const createServiceHandlers = (
  encounter: EncounterListItem,
  onRefetch?: () => void,
  toast?: ToastFunction
) => {
  const showError = createErrorHandler(toast);
  const showSuccess = createSuccessHandler(toast);

  const handleServiceOperation = async (
    operation: () => Promise<any>,
    action: string,
    defaultErrorMsg: string
  ): Promise<boolean> => {
    try {
      const result = await operation();
      if (result.success) {
        showSuccess(action, encounter.name);
        onRefetch?.();
        return true;
      } else {
        throw new Error(extractErrorMessage(result.error) || defaultErrorMsg);
      }
    } catch {
      showError(action, encounter.name);
      return false;
    }
  };

  const handleDuplicate = async () => {
    return handleServiceOperation(
      () => EncounterService.cloneEncounter(encounter.id),
      'duplicate',
      'Failed to duplicate encounter'
    );
  };

  const handleDelete = async () => {
    return handleServiceOperation(
      () => EncounterService.deleteEncounter(encounter.id),
      'delete',
      'Failed to delete encounter'
    );
  };

  return { handleDuplicate, handleDelete };
};

export const canStartCombat = (encounter: EncounterListItem): boolean => {
  return encounter.status === 'draft' || encounter.status === 'completed';
};