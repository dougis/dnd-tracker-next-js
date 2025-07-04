import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { EncounterListItem } from '../types';

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
  encounter: EncounterListItem;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  isOpen,
  onOpenChange,
  encounter,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Encounter</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{encounter.name}&rdquo;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}