'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Play,
  Share,
  Eye
} from 'lucide-react';
import { EncounterService } from '@/lib/services/EncounterService';
import { useToast } from '@/hooks/use-toast';
import type { EncounterActionButtonsProps } from './types';

export function EncounterActionButtons({
  encounter,
  onRefetch,
}: EncounterActionButtonsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleView = () => {
    // TODO: Navigate to encounter detail view
    console.log('View encounter:', encounter.id);
  };

  const handleEdit = () => {
    // TODO: Navigate to encounter edit page
    console.log('Edit encounter:', encounter.id);
  };

  const handleDuplicate = async () => {
    try {
      const result = await EncounterService.duplicateEncounter(encounter.id);
      if (result.success) {
        toast({
          title: 'Encounter duplicated',
          description: `"${encounter.name}" has been duplicated successfully.`,
        });
        onRefetch?.();
      } else {
        throw new Error(result.error || 'Failed to duplicate encounter');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate encounter. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStartCombat = () => {
    // TODO: Navigate to combat interface with this encounter
    console.log('Start combat for encounter:', encounter.id);
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Share encounter:', encounter.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await EncounterService.deleteEncounter(encounter.id);
      if (result.success) {
        toast({
          title: 'Encounter deleted',
          description: `"${encounter.name}" has been deleted.`,
        });
        onRefetch?.();
      } else {
        throw new Error(result.error || 'Failed to delete encounter');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete encounter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const canStartCombat = encounter.status === 'draft' || encounter.status === 'completed';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Encounter
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>

          {canStartCombat && (
            <DropdownMenuItem onClick={handleStartCombat}>
              <Play className="h-4 w-4 mr-2" />
              Start Combat
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={handleDelete}
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