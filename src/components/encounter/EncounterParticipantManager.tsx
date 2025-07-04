'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from 'sonner';
import type {
  IEncounter,
  IParticipantReference,
} from '@/lib/models/encounter/interfaces';
import { ParticipantItem } from './ParticipantItem';
import { EmptyParticipantsState } from './EmptyParticipantsState';
import { BatchSelectionBar } from './BatchSelectionBar';
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


  const FormField = useCallback(({ label, children, error, htmlFor }: {
    label: string;
    children: React.ReactNode;
    error?: string;
    htmlFor?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  ), []);

  const renderBasicFields = useCallback(() => (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Character Name" error={formErrors.name} htmlFor="name">
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter character name"
          className={formErrors.name ? 'border-red-500' : ''}
        />
      </FormField>
      <FormField label="Type" htmlFor="type">
        <Select
          name="type"
          value={formData.type}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              type: value as ParticipantFormData['type'],
              isPlayer: value === 'pc',
            })
          }
        >
          <SelectTrigger id="type" aria-label="Type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pc">Player Character</SelectItem>
            <SelectItem value="npc">NPC</SelectItem>
            <SelectItem value="monster">Monster</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  ), [FormField, formData, formErrors.name]);

  const renderStatFields = useCallback(() => (
    <div className="grid grid-cols-3 gap-4">
      <FormField label="Hit Points" error={formErrors.maxHitPoints} htmlFor="maxHitPoints">
        <Input
          id="maxHitPoints"
          type="number"
          min="1"
          value={formData.maxHitPoints}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            const hitPoints = isNaN(value) ? 1 : value;
            setFormData({
              ...formData,
              maxHitPoints: hitPoints,
              currentHitPoints: hitPoints,
            });
          }}
          className={formErrors.maxHitPoints ? 'border-red-500' : ''}
        />
      </FormField>
      <FormField label="Armor Class" error={formErrors.armorClass} htmlFor="armorClass">
        <Input
          id="armorClass"
          type="number"
          min="0"
          value={formData.armorClass}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            const armorClass = isNaN(value) ? 10 : value;
            setFormData({
              ...formData,
              armorClass,
            });
          }}
          className={formErrors.armorClass ? 'border-red-500' : ''}
        />
      </FormField>
      <FormField label="Initiative" htmlFor="initiative">
        <Input
          id="initiative"
          type="number"
          value={formData.initiative || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              initiative: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="Optional"
        />
      </FormField>
    </div>
  ), [FormField, formData, formErrors]);

  const renderParticipantForm = useCallback(() => (
    <div className="space-y-4">
      {renderBasicFields()}
      {renderStatFields()}
      <FormField label="Notes" htmlFor="notes">
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
        />
      </FormField>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isVisible"
          checked={formData.isVisible}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isVisible: !!checked })
          }
        />
        <Label htmlFor="isVisible">Visible to players</Label>
      </div>
    </div>
  ), [FormField, renderBasicFields, renderStatFields, formData]);

  const renderAddDialog = useCallback(() => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
        {renderParticipantForm()}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddParticipant} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Participant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ), [isAddDialogOpen, renderParticipantForm, resetForm, handleAddParticipant, isLoading]);

  const renderImportDialog = useCallback(() => (
    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
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
            onClick={() => setIsImportDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ), [isImportDialogOpen]);

  if (encounter.participants.length === 0) {
    return (
      <EmptyParticipantsState
        renderAddDialog={renderAddDialog}
        renderImportDialog={renderImportDialog}
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
            {renderAddDialog()}
            {renderImportDialog()}
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

      {/* Edit Participant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Participant</DialogTitle>
            <DialogDescription>
              Update the participant&apos;s information
            </DialogDescription>
          </DialogHeader>
          {renderParticipantForm()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingParticipant(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateParticipant} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Participant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}