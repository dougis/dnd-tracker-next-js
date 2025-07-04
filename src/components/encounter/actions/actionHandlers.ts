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

  const handleDuplicate = async () => {
    try {
      const result = await EncounterService.cloneEncounter(encounter.id);
      if (result.success) {
        showSuccess('duplicate', encounter.name);
        onRefetch?.();
      } else {
        throw new Error(extractErrorMessage(result.error) || 'Failed to duplicate encounter');
      }
    } catch {
      showError('duplicate', encounter.name);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await EncounterService.deleteEncounter(encounter.id);
      if (result.success) {
        showSuccess('delete', encounter.name);
        onRefetch?.();
        return true;
      } else {
        throw new Error(extractErrorMessage(result.error) || 'Failed to delete encounter');
      }
    } catch {
      showError('delete', encounter.name);
      return false;
    }
  };

  return { handleDuplicate, handleDelete };
};

export const canStartCombat = (encounter: EncounterListItem): boolean => {
  return encounter.status === 'draft' || encounter.status === 'completed';
};