import React from 'react';
import { FormInput } from '@/components/forms/FormInput';

interface HPValueInputsProps {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  onCurrentHPChange: (_value: number) => void;
  onMaxHPChange: (_value: number) => void;
  onTempHPChange: (_value: number) => void;
  errors: {
    currentHitPoints?: string;
    maxHitPoints?: string;
    temporaryHitPoints?: string;
  };
}

export function HPValueInputs({
  currentHP,
  maxHP,
  tempHP,
  onCurrentHPChange,
  onMaxHPChange,
  onTempHPChange,
  errors,
}: HPValueInputsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <FormInput
        label="Current HP"
        type="number"
        value={currentHP}
        onChange={(e) => onCurrentHPChange(parseInt(e.target.value) || 0)}
        error={errors.currentHitPoints}
        min={0}
        max={maxHP}
      />
      <FormInput
        label="Maximum HP"
        type="number"
        value={maxHP}
        onChange={(e) => onMaxHPChange(parseInt(e.target.value) || 1)}
        error={errors.maxHitPoints}
        min={1}
      />
      <FormInput
        label="Temporary HP"
        type="number"
        value={tempHP}
        onChange={(e) => onTempHPChange(parseInt(e.target.value) || 0)}
        error={errors.temporaryHitPoints}
        min={0}
      />
    </div>
  );
}