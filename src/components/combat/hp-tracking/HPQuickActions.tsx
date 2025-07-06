import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';

interface HPQuickActionsProps {
  onApplyDamage: (_damage: number) => void;
  onApplyHealing: (_healing: number) => void;
  errors: {
    damage?: string;
    healing?: string;
  };
  onErrorChange: (_errors: { damage?: string; healing?: string }) => void;
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
    const damage = parseInt(value);
    if (isNaN(damage) || damage < 0) {
      onErrorChange({ ...errors, damage: 'Damage must be at least 0' });
      return false;
    }
    onErrorChange({ ...errors, damage: undefined });
    return true;
  };

  const validateHealing = (value: string): boolean => {
    const healing = parseInt(value);
    if (isNaN(healing) || healing < 0) {
      onErrorChange({ ...errors, healing: 'Healing must be at least 0' });
      return false;
    }
    onErrorChange({ ...errors, healing: undefined });
    return true;
  };

  const handleApplyDamage = () => {
    if (!validateDamage(damageAmount)) return;

    const damage = parseInt(damageAmount);
    onApplyDamage(damage);
    setDamageAmount('');
  };

  const handleApplyHealing = () => {
    if (!validateHealing(healingAmount)) return;

    const healing = parseInt(healingAmount);
    onApplyHealing(healing);
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
            className="px-4"
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
            className="px-4 bg-green-600 hover:bg-green-700 text-white"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}