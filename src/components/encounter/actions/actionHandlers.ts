import { EncounterService } from '@/lib/services/EncounterService';
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
  toast?: (_options: any) => void
) => {
  const handleDuplicate = async () => {
    try {
      const result = await EncounterService.cloneEncounter(encounter.id);
      if (result.success) {
        toast?.({
          title: 'Encounter duplicated',
          description: `"${encounter.name}" has been duplicated successfully.`,
        });
        onRefetch?.();
      } else {
        throw new Error(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to duplicate encounter');
      }
    } catch {
      toast?.({
        title: 'Error',
        description: 'Failed to duplicate encounter. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await EncounterService.deleteEncounter(encounter.id);
      if (result.success) {
        toast?.({
          title: 'Encounter deleted',
          description: `"${encounter.name}" has been deleted.`,
        });
        onRefetch?.();
        return true;
      } else {
        throw new Error(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete encounter');
      }
    } catch {
      toast?.({
        title: 'Error',
        description: 'Failed to delete encounter. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { handleDuplicate, handleDelete };
};

export const canStartCombat = (encounter: EncounterListItem): boolean => {
  return encounter.status === 'draft' || encounter.status === 'completed';
};