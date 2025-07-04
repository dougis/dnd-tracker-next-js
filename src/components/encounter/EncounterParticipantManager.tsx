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
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import type {
  IEncounter,
  IParticipantReference,
} from '@/lib/models/encounter/interfaces';
import { EncounterService } from '@/lib/services/EncounterService';

interface EncounterParticipantManagerProps {
  encounter: IEncounter;
  onUpdate?: (_updatedEncounter: IEncounter) => void;
}

interface ParticipantFormData {
  name: string;
  type: 'pc' | 'npc' | 'monster';
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  armorClass: number;
  initiative?: number;
  isPlayer: boolean;
  isVisible: boolean;
  notes: string;
  conditions: string[];
}

const initialFormData: ParticipantFormData = {
  name: '',
  type: 'pc',
  maxHitPoints: 1,
  currentHitPoints: 1,
  temporaryHitPoints: 0,
  armorClass: 10,
  initiative: undefined,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
};

export function EncounterParticipantManager({
  encounter,
  onUpdate,
}: EncounterParticipantManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<IParticipantReference | null>(null);
  const [formData, setFormData] = useState<ParticipantFormData>(initialFormData);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((data: ParticipantFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = 'Name is required';
    }

    if (data.maxHitPoints <= 0) {
      errors.maxHitPoints = 'Hit Points must be greater than 0';
    }

    if (data.armorClass < 0) {
      errors.armorClass = 'Armor Class cannot be negative';
    }

    return errors;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormErrors({});
  }, []);

  const handleAddParticipant = useCallback(async () => {
    try {
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setIsLoading(true);
      const result = await EncounterService.addParticipant(
        encounter._id.toString(),
        {
          ...formData,
          characterId: new Date().getTime().toString(), // Temporary ID for testing
          currentHitPoints: formData.maxHitPoints,
        }
      );

      if (result.success) {
        toast.success('Participant added successfully');
        onUpdate?.(result.data!);
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to add participant');
      }
    } catch (error) {
      toast.error('An error occurred while adding participant');
      console.error('Add participant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, formData, validateForm, onUpdate, resetForm]);

  const handleEditParticipant = useCallback((participant: IParticipantReference) => {
    setEditingParticipant(participant);
    setFormData({
      name: participant.name,
      type: participant.type,
      maxHitPoints: participant.maxHitPoints,
      currentHitPoints: participant.currentHitPoints,
      temporaryHitPoints: participant.temporaryHitPoints,
      armorClass: participant.armorClass,
      initiative: participant.initiative,
      isPlayer: participant.isPlayer,
      isVisible: participant.isVisible,
      notes: participant.notes,
      conditions: participant.conditions,
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateParticipant = useCallback(async () => {
    if (!editingParticipant) return;

    try {
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setIsLoading(true);
      const result = await EncounterService.updateParticipant(
        encounter._id.toString(),
        editingParticipant.characterId.toString(),
        formData
      );

      if (result.success) {
        toast.success('Participant updated successfully');
        onUpdate?.(result.data!);
        setIsEditDialogOpen(false);
        setEditingParticipant(null);
        resetForm();
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to update participant');
      }
    } catch (error) {
      toast.error('An error occurred while updating participant');
      console.error('Update participant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, editingParticipant, formData, validateForm, onUpdate, resetForm]);

  const handleRemoveParticipant = useCallback(async (participantId: string) => {
    try {
      setIsLoading(true);
      const result = await EncounterService.removeParticipant(
        encounter._id.toString(),
        participantId
      );

      if (result.success) {
        toast.success('Participant removed successfully');
        onUpdate?.(result.data!);
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to remove participant');
      }
    } catch (error) {
      toast.error('An error occurred while removing participant');
      console.error('Remove participant error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, onUpdate]);

  const handleBatchRemove = useCallback(async () => {
    try {
      setIsLoading(true);

      for (const participantId of Array.from(selectedParticipants)) {
        await EncounterService.removeParticipant(
          encounter._id.toString(),
          participantId
        );
      }

      toast.success('Selected participants removed successfully');
      setSelectedParticipants(new Set());
      // Note: In a real implementation, we'd want to batch these operations
    } catch (error) {
      toast.error('An error occurred while removing participants');
      console.error('Batch remove error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, selectedParticipants]);

  const handleParticipantSelection = useCallback((participantId: string, checked: boolean) => {
    const newSelection = new Set(selectedParticipants);
    if (checked) {
      newSelection.add(participantId);
    } else {
      newSelection.delete(participantId);
    }
    setSelectedParticipants(newSelection);
  }, [selectedParticipants]);

  const getParticipantTypeBadge = useCallback((type: string) => {
    const variants = {
      pc: 'default',
      npc: 'secondary',
      monster: 'destructive',
    } as const;

    const labels = {
      pc: 'PC',
      npc: 'NPC',
      monster: 'Monster',
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  }, []);

  const renderParticipantForm = useCallback(() => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Character Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter character name"
            className={formErrors.name ? 'border-red-500' : ''}
          />
          {formErrors.name && (
            <p className="text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxHitPoints">Hit Points</Label>
          <Input
            id="maxHitPoints"
            type="number"
            min="1"
            value={formData.maxHitPoints}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxHitPoints: parseInt(e.target.value) || 1,
                currentHitPoints: parseInt(e.target.value) || 1,
              })
            }
            className={formErrors.maxHitPoints ? 'border-red-500' : ''}
          />
          {formErrors.maxHitPoints && (
            <p className="text-sm text-red-500">{formErrors.maxHitPoints}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="armorClass">Armor Class</Label>
          <Input
            id="armorClass"
            type="number"
            min="0"
            value={formData.armorClass}
            onChange={(e) =>
              setFormData({
                ...formData,
                armorClass: parseInt(e.target.value) || 10,
              })
            }
            className={formErrors.armorClass ? 'border-red-500' : ''}
          />
          {formErrors.armorClass && (
            <p className="text-sm text-red-500">{formErrors.armorClass}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initiative">Initiative</Label>
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
        />
      </div>

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
  ), [formData, formErrors]);

  if (encounter.participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Encounter Participants</CardTitle>
          <CardDescription>
            Add characters and NPCs to your encounter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No participants added yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first character or NPC
            </p>
            <div className="mt-6 space-x-2">
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
            </div>
          </div>
        </CardContent>
      </Card>
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
          </div>
        </div>

        {selectedParticipants.size > 0 && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {selectedParticipants.size} participants selected
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Remove Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Selected Participants</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove {selectedParticipants.size} selected participants? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBatchRemove}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {encounter.participants.map((participant) => (
            <div
              key={participant.characterId.toString()}
              data-testid="participant-item"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedParticipants.has(participant.characterId.toString())}
                  onCheckedChange={(checked) =>
                    handleParticipantSelection(
                      participant.characterId.toString(),
                      !!checked
                    )
                  }
                />

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{participant.name}</h4>
                    {getParticipantTypeBadge(participant.type)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>HP: {participant.currentHitPoints}/{participant.maxHitPoints}</span>
                    <span>AC: {participant.armorClass}</span>
                    {participant.initiative && (
                      <span>Initiative: {participant.initiative}</span>
                    )}
                  </div>
                  {participant.notes && (
                    <p className="text-sm text-gray-600 mt-1">{participant.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditParticipant(participant)}
                  aria-label={`Edit participant ${participant.name}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Remove participant ${participant.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Participant</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {participant.name} from this encounter?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveParticipant(participant.characterId.toString())}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
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