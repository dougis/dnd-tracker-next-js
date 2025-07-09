'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Edit, Trash2, GripVertical } from 'lucide-react';
import type { IParticipantReference } from '@/lib/models/encounter/interfaces';

interface ParticipantItemProps {
  participant: IParticipantReference;
  isSelected: boolean;
  onSelectionChange: (_participantId: string, _checked: boolean) => void;
  onEdit: (_participant: IParticipantReference) => void;
  onRemove: (_participantId: string) => void;
}

const ParticipantTypeBadge = ({ type }: { type: string }) => {
  const variants = { pc: 'default', npc: 'secondary', monster: 'destructive' } as const;
  const labels = { pc: 'PC', npc: 'NPC', monster: 'Monster' };
  return (
    <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
      {labels[type as keyof typeof labels] || type}
    </Badge>
  );
};

const ParticipantInfo = ({ participant }: { participant: IParticipantReference }) => (
  <div>
    <div className="flex items-center space-x-2">
      <h4 className="font-medium">{participant.name}</h4>
      <ParticipantTypeBadge type={participant.type} />
    </div>
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      <span>HP: {participant.currentHitPoints}/{participant.maxHitPoints}</span>
      <span>AC: {participant.armorClass}</span>
      {participant.initiative && <span>Initiative: {participant.initiative}</span>}
    </div>
    {participant.notes && <p className="text-sm text-gray-600 mt-1">{participant.notes}</p>}
  </div>
);

export function ParticipantItem({
  participant,
  isSelected,
  onSelectionChange,
  onEdit,
  onRemove,
}: ParticipantItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: participant.characterId.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={participant.characterId.toString()}
      data-testid="participant-item"
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200"
          data-testid="drag-handle"
          aria-label={`Drag to reorder ${participant.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </Button>

        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onSelectionChange(participant.characterId.toString(), !!checked)
          }
        />

        <ParticipantInfo participant={participant} />
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(participant)}
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
                onClick={() => onRemove(participant.characterId.toString())}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}