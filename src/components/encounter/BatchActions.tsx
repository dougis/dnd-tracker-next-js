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

  const handleBulkDuplicate = async () => {
    try {
      // TODO: Implement bulk duplicate functionality
      console.log('Bulk duplicate encounters');
      toast({
        title: 'Encounters duplicated',
        description: `${selectedCount} encounters have been duplicated.`,
      });
      onClearSelection();
      onRefetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate encounters. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkArchive = async () => {
    try {
      // TODO: Implement bulk archive functionality
      console.log('Bulk archive encounters');
      toast({
        title: 'Encounters archived',
        description: `${selectedCount} encounters have been archived.`,
      });
      onClearSelection();
      onRefetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive encounters. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement bulk delete functionality
      console.log('Bulk delete encounters');
      toast({
        title: 'Encounters deleted',
        description: `${selectedCount} encounters have been deleted.`,
      });
      onClearSelection();
      onRefetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete encounters. Please try again.',
        variant: 'destructive',
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
            {selectedCount} encounter{selectedCount !== 1 ? 's' : ''} selected
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
              Are you sure you want to delete {selectedCount} encounter{selectedCount !== 1 ? 's' : ''}? 
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