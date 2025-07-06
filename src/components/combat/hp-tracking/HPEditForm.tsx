import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHPTracking } from './useHPTracking';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { HPStatusDisplay } from './HPStatusDisplay';
import { HPValueInputs } from './HPValueInputs';
import { HPQuickActions } from './HPQuickActions';
import { cn } from '@/lib/utils';
import {
  validateHPValues,
  hasValidationErrors,
  HPValidationError,
  HPValues
} from './hp-validation-utils';

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

export function HPEditForm({
  initialValues,
  onSave,
  onCancel,
  className,
}: HPEditFormProps) {
  const [errors, setErrors] = useState<HPValidationError>({});

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
    const newErrors = validateHPValues({
      currentHitPoints: currentHP,
      maxHitPoints: maxHP,
      temporaryHitPoints: tempHP,
    });

    setErrors(newErrors);
    return !hasValidationErrors(newErrors);
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