'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { X, Trash2, Copy, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createSuccessHandler, createErrorHandler } from './actions/errorUtils';
import { getEncounterText } from './BatchActions/utils';

interface BatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRefetch: () => void;
}

export function BatchActions({
  selectedCount,
  onClearSelection,
  onRefetch,
}: BatchActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSuccess = createSuccessHandler(toast);
  const handleError = createErrorHandler(toast);

  const executeAction = async (action: string, operation: () => Promise<void> | void) => {
    try {
      await operation();
      handleSuccess(action, `${selectedCount} encounters`);
      onClearSelection();
      onRefetch();
    } catch {
      handleError(action, `${selectedCount} encounters`);
    }
  };

  const handleBulkDuplicate = () => executeAction('duplicate', () => {
    // TODO: Implement bulk duplicate functionality
    console.log('Bulk duplicate encounters');
  });

  const handleBulkArchive = () => executeAction('archive', () => {
    // TODO: Implement bulk archive functionality
    console.log('Bulk archive encounters');
  });

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await executeAction('delete', () => {
        // TODO: Implement bulk delete functionality
        console.log('Bulk delete encounters');
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {getEncounterText(selectedCount)} selected
          </span>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Selection
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Encounters</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {getEncounterText(selectedCount)}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}