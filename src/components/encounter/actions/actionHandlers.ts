import { EncounterService } from '@/lib/services/EncounterService';
import { createErrorHandler, createSuccessHandler, extractErrorMessage, type ToastFunction } from './errorUtils';
import type { EncounterListItem } from '../types';

export const createNavigationHandlers = (encounter: EncounterListItem) => {
  return {
    handleView: () => {
      // TODO: Navigate to encounter detail view
      console.log('View encounter:', encounter.id);
    },

    handleEdit: () => {
      // TODO: Navigate to encounter edit page
      console.log('Edit encounter:', encounter.id);
    },

    handleStartCombat: () => {
      // TODO: Navigate to combat interface with this encounter
      console.log('Start combat for encounter:', encounter.id);
    },

    handleShare: () => {
      // TODO: Implement sharing functionality
      console.log('Share encounter:', encounter.id);
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