import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { validateDamageInput, validateHealingInput, HPValidationError } from './hp-validation-utils';
import { HP_BUTTON_STYLES, getHPButtonA11yProps } from './hp-button-utils';

interface HPQuickActionsProps {
  onApplyDamage: (_damage: number) => void;
  onApplyHealing: (_healing: number) => void;
  errors: {
    damage?: string;
    healing?: string;
  };
  onErrorChange: (_errors: Pick<HPValidationError, 'damage' | 'healing'>) => void;
}

export function HPQuickActions({
  onApplyDamage,
  onApplyHealing,
  errors,
  onErrorChange,
}: HPQuickActionsProps) {
  const [damageAmount, setDamageAmount] = useState('');
  const [healingAmount, setHealingAmount] = useState('');

  const validateDamage = (value: string): boolean => {
    const { isValid, error } = validateDamageInput(value);
    onErrorChange({ ...errors, damage: error });
    return isValid;
  };

  const validateHealing = (value: string): boolean => {
    const { isValid, error } = validateHealingInput(value);
    onErrorChange({ ...errors, healing: error });
    return isValid;
  };

  const handleApplyDamage = () => {
    if (!validateDamage(damageAmount)) return;

    const { parsed } = validateDamageInput(damageAmount);
    onApplyDamage(parsed);
    setDamageAmount('');
  };

  const handleApplyHealing = () => {
    if (!validateHealing(healingAmount)) return;

    const { parsed } = validateHealingInput(healingAmount);
    onApplyHealing(parsed);
    setHealingAmount('');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Damage Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Apply Damage</label>
        <div className="flex space-x-2">
          <FormInput
            label="Damage Amount"
            type="number"
            value={damageAmount}
            onChange={(e) => setDamageAmount(e.target.value)}
            error={errors.damage}
            min={0}
            placeholder="0"
            className="flex-1"
          />
          <Button
            onClick={handleApplyDamage}
            variant="destructive"
            className={HP_BUTTON_STYLES.applyDamage}
            {...getHPButtonA11yProps('damage')}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Healing Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Apply Healing</label>
        <div className="flex space-x-2">
          <FormInput
            label="Healing Amount"
            type="number"
            value={healingAmount}
            onChange={(e) => setHealingAmount(e.target.value)}
            error={errors.healing}
            min={0}
            placeholder="0"
            className="flex-1"
          />
          <Button
            onClick={handleApplyHealing}
            className={HP_BUTTON_STYLES.applyHealing}
            {...getHPButtonA11yProps('healing')}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}