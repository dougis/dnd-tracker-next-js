import React from 'react';
import { FormModal } from '@/components/modals/FormModal';
import { HPEditForm, HPValues } from './HPEditForm';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';

interface HPEditModalProps {
  participant: IParticipantReference;
  isOpen: boolean;
  onSave: (_values: HPValues) => void;
  onCancel: () => void;
}

export function HPEditModal({
  participant,
  isOpen,
  onSave,
  onCancel,
}: HPEditModalProps) {
  if (!isOpen) {
    return null;
  }

  const initialValues = {
    currentHitPoints: participant.currentHitPoints,
    maxHitPoints: participant.maxHitPoints,
    temporaryHitPoints: participant.temporaryHitPoints,
  };

  return (
    <FormModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
      config={{
        title: `Edit HP: ${participant.name}`,
        size: 'lg',
        showCancelButton: false, // HPEditForm handles its own buttons
      }}
    >
      <HPEditForm
        initialValues={initialValues}
        onSave={onSave}
        onCancel={onCancel}
      />
    </FormModal>
  );
}