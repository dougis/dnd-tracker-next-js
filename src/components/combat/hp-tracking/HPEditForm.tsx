import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHPTracking, HPValues } from './useHPTracking';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { HPStatusDisplay } from './HPStatusDisplay';
import { HPValueInputs } from './HPValueInputs';
import { HPQuickActions } from './HPQuickActions';
import { cn } from '@/lib/utils';

interface HPEditFormProps {
  initialValues: {
    currentHitPoints: number;
    maxHitPoints: number;
    temporaryHitPoints: number;
  };
  onSave: (_values: HPValues) => void;
  onCancel: () => void;
  className?: string;
}

interface FormErrors {
  currentHitPoints?: string;
  maxHitPoints?: string;
  temporaryHitPoints?: string;
  damage?: string;
  healing?: string;
}

export function HPEditForm({
  initialValues,
  onSave,
  onCancel,
  className,
}: HPEditFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  const mockParticipant: IParticipantReference = {
    characterId: '' as any,
    name: '',
    type: 'pc',
    maxHitPoints: initialValues.maxHitPoints,
    currentHitPoints: initialValues.currentHitPoints,
    temporaryHitPoints: initialValues.temporaryHitPoints,
    armorClass: 0,
    initiative: undefined,
    isPlayer: true,
    isVisible: true,
    notes: '',
    conditions: [],
  };

  const {
    currentHP,
    maxHP,
    tempHP,
    effectiveHP,
    hpStatus,
    applyDamage,
    applyHealing,
    setTemporaryHP,
    setCurrentHP,
    setMaxHP,
  } = useHPTracking(mockParticipant, () => {});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (currentHP < 0) {
      newErrors.currentHitPoints = 'Current HP must be at least 0';
    }

    if (maxHP < 1) {
      newErrors.maxHitPoints = 'Maximum HP must be at least 1';
    }

    if (tempHP < 0) {
      newErrors.temporaryHitPoints = 'Temporary HP must be at least 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      currentHitPoints: currentHP,
      maxHitPoints: maxHP,
      temporaryHitPoints: tempHP,
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <HPStatusDisplay
        currentHP={currentHP}
        maxHP={maxHP}
        tempHP={tempHP}
        effectiveHP={effectiveHP}
        hpStatus={hpStatus}
      />

      <HPValueInputs
        currentHP={currentHP}
        maxHP={maxHP}
        tempHP={tempHP}
        onCurrentHPChange={setCurrentHP}
        onMaxHPChange={setMaxHP}
        onTempHPChange={setTemporaryHP}
        errors={errors}
      />

      <HPQuickActions
        onApplyDamage={applyDamage}
        onApplyHealing={applyHealing}
        errors={errors}
        onErrorChange={setErrors}
      />

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

export type { HPValues };