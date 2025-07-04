'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Download } from 'lucide-react';
import { ParticipantForm } from './ParticipantForm';
import type { ParticipantFormData } from './hooks/useParticipantForm';

interface ParticipantDialogsProps {
  // Add dialog props
  isAddDialogOpen: boolean;
  onAddDialogOpenChange: (_open: boolean) => void;
  onAddParticipant: () => void;
  isLoading: boolean;
  // Edit dialog props
  isEditDialogOpen: boolean;
  onEditDialogOpenChange: (_open: boolean) => void;
  onUpdateParticipant: () => void;
  // Import dialog props
  isImportDialogOpen: boolean;
  onImportDialogOpenChange: (_open: boolean) => void;
  // Form props
  formData: ParticipantFormData;
  formErrors: Record<string, string>;
  onFormDataChange: (_data: ParticipantFormData) => void;
  onResetForm: () => void;
}

export function AddParticipantDialog({
  isAddDialogOpen,
  onAddDialogOpenChange,
  onAddParticipant,
  isLoading,
  formData,
  formErrors,
  onFormDataChange,
  onResetForm,
}: Pick<ParticipantDialogsProps, 'isAddDialogOpen' | 'onAddDialogOpenChange' | 'onAddParticipant' | 'isLoading' | 'formData' | 'formErrors' | 'onFormDataChange' | 'onResetForm'>) {
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={onAddDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Character
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Add a new character or NPC to the encounter
          </DialogDescription>
        </DialogHeader>
        <ParticipantForm
          formData={formData}
          formErrors={formErrors}
          onFormDataChange={onFormDataChange}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onAddDialogOpenChange(false);
              onResetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={onAddParticipant} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Participant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditParticipantDialog({
  isEditDialogOpen,
  onEditDialogOpenChange,
  onUpdateParticipant,
  isLoading,
  formData,
  formErrors,
  onFormDataChange,
  onResetForm,
}: Pick<ParticipantDialogsProps, 'isEditDialogOpen' | 'onEditDialogOpenChange' | 'onUpdateParticipant' | 'isLoading' | 'formData' | 'formErrors' | 'onFormDataChange' | 'onResetForm'>) {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
          <DialogDescription>
            Update the participant&apos;s information
          </DialogDescription>
        </DialogHeader>
        <ParticipantForm
          formData={formData}
          formErrors={formErrors}
          onFormDataChange={onFormDataChange}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onEditDialogOpenChange(false);
              onResetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={onUpdateParticipant} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Participant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImportParticipantDialog({
  isImportDialogOpen,
  onImportDialogOpenChange,
}: Pick<ParticipantDialogsProps, 'isImportDialogOpen' | 'onImportDialogOpenChange'>) {
  return (
    <Dialog open={isImportDialogOpen} onOpenChange={onImportDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Import from Library
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Characters</DialogTitle>
          <DialogDescription>
            Select characters from your library to add to this encounter
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Character library integration coming soon...
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onImportDialogOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}