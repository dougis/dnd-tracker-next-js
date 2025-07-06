import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { useHPTracking, HPValues } from './useHPTracking';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';
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
  const [damageAmount, setDamageAmount] = useState('');
  const [healingAmount, setHealingAmount] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Create a mock participant for the HP tracking hook
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

  const validateDamage = (value: string): boolean => {
    const damage = parseInt(value);
    if (isNaN(damage) || damage < 0) {
      setErrors(prev => ({ ...prev, damage: 'Damage must be at least 0' }));
      return false;
    }
    setErrors(prev => ({ ...prev, damage: undefined }));
    return true;
  };

  const validateHealing = (value: string): boolean => {
    const healing = parseInt(value);
    if (isNaN(healing) || healing < 0) {
      setErrors(prev => ({ ...prev, healing: 'Healing must be at least 0' }));
      return false;
    }
    setErrors(prev => ({ ...prev, healing: undefined }));
    return true;
  };

  const handleApplyDamage = () => {
    if (!validateDamage(damageAmount)) return;

    const damage = parseInt(damageAmount);
    applyDamage(damage);
    setDamageAmount('');
  };

  const handleApplyHealing = () => {
    if (!validateHealing(healingAmount)) return;

    const healing = parseInt(healingAmount);
    applyHealing(healing);
    setHealingAmount('');
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      currentHitPoints: currentHP,
      maxHitPoints: maxHP,
      temporaryHitPoints: tempHP,
    });
  };

  const getHPStatusDisplay = () => {
    switch (hpStatus) {
      case 'unconscious':
        return <span className="text-red-600 font-medium">💀 Unconscious</span>;
      case 'critical':
        return <span className="text-orange-600 font-medium">⚠️ Critical HP Level</span>;
      case 'injured':
        return <span className="text-yellow-600 font-medium">🩹 Injured</span>;
      case 'healthy':
        return <span className="text-green-600 font-medium">💚 Healthy</span>;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* HP Status Display */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Current Status</span>
          {getHPStatusDisplay()}
        </div>
        <div className="text-lg font-mono">
          Status: {currentHP}/{maxHP} {tempHP > 0 && `(+${tempHP})`} = {effectiveHP} effective HP
        </div>
      </div>

      {/* HP Value Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <FormInput
          label="Current HP"
          type="number"
          value={currentHP}
          onChange={(e) => setCurrentHP(parseInt(e.target.value) || 0)}
          error={errors.currentHitPoints}
          min={0}
          max={maxHP}
        />
        <FormInput
          label="Maximum HP"
          type="number"
          value={maxHP}
          onChange={(e) => setMaxHP(parseInt(e.target.value) || 1)}
          error={errors.maxHitPoints}
          min={1}
        />
        <FormInput
          label="Temporary HP"
          type="number"
          value={tempHP}
          onChange={(e) => setTemporaryHP(parseInt(e.target.value) || 0)}
          error={errors.temporaryHitPoints}
          min={0}
        />
      </div>

      {/* Quick Actions */}
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

      {/* Action Buttons */}
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