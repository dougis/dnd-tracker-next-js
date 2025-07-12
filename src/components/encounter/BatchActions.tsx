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
import { createSuccessHandler } from './actions/errorUtils';
import { getEncounterText } from './BatchActions/utils';

interface BatchActionsProps {
  selectedCount: number;
  selectedEncounters?: string[];
  onClearSelection: () => void;
  onRefetch: () => void;
}

export function BatchActions({
  selectedCount,
  selectedEncounters = [],
  onClearSelection,
  onRefetch,
}: BatchActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSuccess = createSuccessHandler(toast);

  const callBatchApi = async (operation: string, options: Record<string, any> = {}) => {
    if (!selectedEncounters || selectedEncounters.length === 0) {
      throw new Error(`No encounters selected for ${operation}.`);
    }

    const response = await fetch('/api/encounters/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        encounterIds: selectedEncounters,
        options,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Failed to ${operation} encounters`);
    }

    return await response.json();
  };

  const executeAction = async (action: string, operation: () => Promise<void> | void) => {
    try {
      await operation();
      handleSuccess(action, `${selectedCount} encounters`);
      onClearSelection();
      onRefetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} encounters. Please try again.`;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleApiResponse = (response: any, action: string) => {
    const { results = [], errors = [], summary } = response;

    if (errors.length === 0) {
      // Complete success
      toast({
        title: `Encounters ${action}d`,
        description: `${summary.successful} encounters have been ${action}d successfully.`,
      });
    } else if (results.length > 0) {
      // Partial success
      toast({
        title: 'Partial Success',
        description: `${summary.successful} encounters ${action}d successfully, ${summary.failed} failed.`,
      });
    } else {
      // Complete failure
      throw new Error(`Failed to ${action} encounters.`);
    }
  };

  const handleBulkDuplicate = () => executeAction('duplicate', async () => {
    const response = await callBatchApi('duplicate');
    handleApiResponse(response, 'duplicate');
  });

  const handleBulkArchive = () => executeAction('archive', async () => {
    const response = await callBatchApi('archive');
    handleApiResponse(response, 'archive');
  });

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await executeAction('delete', async () => {
        const response = await callBatchApi('delete');
        handleApiResponse(response, 'delete');
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