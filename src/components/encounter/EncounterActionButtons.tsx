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
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Play,
  Share,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeleteDialog } from './actions/DeleteDialog';
import { createNavigationHandlers, createServiceHandlers, canStartCombat } from './actions/actionHandlers';
import type { EncounterActionButtonsProps } from './types';

export function EncounterActionButtons({
  encounter,
  onRefetch,
}: EncounterActionButtonsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const navigationHandlers = createNavigationHandlers(encounter);
  const { handleDuplicate, handleDelete: deleteService } = createServiceHandlers(encounter, onRefetch, toast);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteService();
    if (success) {
      setIsDeleteDialogOpen(false);
    }
    setIsDeleting(false);
  };

  const combatEnabled = canStartCombat(encounter);

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
          <DropdownMenuItem onClick={navigationHandlers.handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={navigationHandlers.handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Encounter
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>

          {combatEnabled && (
            <DropdownMenuItem onClick={navigationHandlers.handleStartCombat}>
              <Play className="h-4 w-4 mr-2" />
              Start Combat
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={navigationHandlers.handleShare}>
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

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        encounter={encounter}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}