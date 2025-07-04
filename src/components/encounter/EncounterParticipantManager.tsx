'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  IEncounter,
  IParticipantReference,
} from '@/lib/models/encounter/interfaces';
import { ParticipantItem } from './ParticipantItem';
import { EmptyParticipantsState } from './EmptyParticipantsState';
import { BatchSelectionBar } from './BatchSelectionBar';
import { AddParticipantDialog, EditParticipantDialog, ImportParticipantDialog } from './ParticipantDialogs';
import { useParticipantOperations } from './hooks/useParticipantOperations';
import { useParticipantForm } from './hooks/useParticipantForm';

interface EncounterParticipantManagerProps {
  encounter: IEncounter;
  onUpdate?: (_updatedEncounter: IEncounter) => void;
}


export function EncounterParticipantManager({
  encounter,
  onUpdate,
}: EncounterParticipantManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<IParticipantReference | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

  const { isLoading, addParticipant, updateParticipant, removeParticipant } = useParticipantOperations(encounter, onUpdate);
  const { formData, setFormData, formErrors, resetForm, loadParticipantData, isFormValid } = useParticipantForm();


  const handleAddParticipant = useCallback(async () => {
    if (!isFormValid(formData)) return;

    await addParticipant(formData, () => {
      setIsAddDialogOpen(false);
      resetForm();
    });
  }, [formData, isFormValid, addParticipant, resetForm]);

  const handleEditParticipant = useCallback((participant: IParticipantReference) => {
    setEditingParticipant(participant);
    loadParticipantData(participant);
    setIsEditDialogOpen(true);
  }, [loadParticipantData]);

  const handleUpdateParticipant = useCallback(async () => {
    if (!editingParticipant || !isFormValid(formData)) return;

    await updateParticipant(editingParticipant.characterId.toString(), formData, () => {
      setIsEditDialogOpen(false);
      setEditingParticipant(null);
      resetForm();
    });
  }, [editingParticipant, formData, isFormValid, updateParticipant, resetForm]);

  const handleRemoveParticipant = useCallback(async (participantId: string) => {
    await removeParticipant(participantId);
  }, [removeParticipant]);

  const handleBatchRemove = useCallback(async () => {
    for (const participantId of Array.from(selectedParticipants)) {
      await removeParticipant(participantId);
    }
    setSelectedParticipants(new Set());
  }, [selectedParticipants, removeParticipant]);

  const handleParticipantSelection = useCallback((participantId: string, checked: boolean) => {
    const newSelection = new Set(selectedParticipants);
    if (checked) {
      newSelection.add(participantId);
    } else {
      newSelection.delete(participantId);
    }
    setSelectedParticipants(newSelection);
  }, [selectedParticipants]);


  const handleEditCancel = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingParticipant(null);
    resetForm();
  }, [resetForm]);

  const _handleAddCancel = useCallback(() => {
    setIsAddDialogOpen(false);
    resetForm();
  }, [resetForm]);

  if (encounter.participants.length === 0) {
    return (
      <EmptyParticipantsState
        renderAddDialog={() => (
          <AddParticipantDialog
            isAddDialogOpen={isAddDialogOpen}
            onAddDialogOpenChange={setIsAddDialogOpen}
            onAddParticipant={handleAddParticipant}
            isLoading={isLoading}
            formData={formData}
            formErrors={formErrors}
            onFormDataChange={setFormData}
            onResetForm={resetForm}
          />
        )}
        renderImportDialog={() => (
          <ImportParticipantDialog
            isImportDialogOpen={isImportDialogOpen}
            onImportDialogOpenChange={setIsImportDialogOpen}
          />
        )}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Encounter Participants</CardTitle>
            <CardDescription>
              Manage characters and NPCs in this encounter
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <AddParticipantDialog
              isAddDialogOpen={isAddDialogOpen}
              onAddDialogOpenChange={setIsAddDialogOpen}
              onAddParticipant={handleAddParticipant}
              isLoading={isLoading}
              formData={formData}
              formErrors={formErrors}
              onFormDataChange={setFormData}
              onResetForm={resetForm}
            />
            <ImportParticipantDialog
              isImportDialogOpen={isImportDialogOpen}
              onImportDialogOpenChange={setIsImportDialogOpen}
            />
          </div>
        </div>

        <BatchSelectionBar
          selectedCount={selectedParticipants.size}
          onBatchRemove={handleBatchRemove}
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {encounter.participants.map((participant) => (
            <ParticipantItem
              key={participant.characterId.toString()}
              participant={participant}
              isSelected={selectedParticipants.has(participant.characterId.toString())}
              onSelectionChange={handleParticipantSelection}
              onEdit={handleEditParticipant}
              onRemove={handleRemoveParticipant}
            />
          ))}
        </div>
      </CardContent>

      <EditParticipantDialog
        isEditDialogOpen={isEditDialogOpen}
        onEditDialogOpenChange={setIsEditDialogOpen}
        onUpdateParticipant={handleUpdateParticipant}
        isLoading={isLoading}
        formData={formData}
        formErrors={formErrors}
        onFormDataChange={setFormData}
        onResetForm={handleEditCancel}
      />
    </Card>
  );
}