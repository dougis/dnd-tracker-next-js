'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { ParticipantItem } from './ParticipantItem';

interface ParticipantListProps {
  participants: IParticipantReference[];
  selectedParticipants: Set<string>;
  onSelectionChange: (_participantId: string, _checked: boolean) => void;
  onEdit: (_participant: IParticipantReference) => void;
  onRemove: (_participantId: string) => void;
  onReorder: (_participantIds: string[]) => void;
}

export function ParticipantList({
  participants,
  selectedParticipants,
  onSelectionChange,
  onEdit,
  onRemove,
  onReorder,
}: ParticipantListProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [localParticipants, setLocalParticipants] = React.useState(participants);

  React.useEffect(() => {
    setLocalParticipants(participants);
  }, [participants]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const { oldIndex, newIndex } = findDragIndices(active.id, over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      performReorder(oldIndex, newIndex);
    }
  };

  const findDragIndices = (activeId: string | number, overId: string | number) => {
    const oldIndex = localParticipants.findIndex(
      (p) => p.characterId.toString() === activeId
    );
    const newIndex = localParticipants.findIndex(
      (p) => p.characterId.toString() === overId
    );
    return { oldIndex, newIndex };
  };

  const performReorder = (oldIndex: number, newIndex: number) => {
    const reorderedParticipants = arrayMove(localParticipants, oldIndex, newIndex);
    setLocalParticipants(reorderedParticipants);

    // Call the reorder callback with the new order
    const participantIds = reorderedParticipants.map(p => p.characterId.toString());
    onReorder(participantIds);
  };

  const findActiveParticipant = (activeId: string | null) => {
    return activeId ? localParticipants.find(
      (p) => p.characterId.toString() === activeId
    ) : null;
  };

  const activeParticipant = findActiveParticipant(activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={localParticipants.map((p) => p.characterId.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {localParticipants.map((participant) => (
            <ParticipantItem
              key={participant.characterId.toString()}
              participant={participant}
              isSelected={selectedParticipants.has(participant.characterId.toString())}
              onSelectionChange={onSelectionChange}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeParticipant && (
          <ParticipantItem
            participant={activeParticipant}
            isSelected={selectedParticipants.has(activeParticipant.characterId.toString())}
            onSelectionChange={() => {}}
            onEdit={() => {}}
            onRemove={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}