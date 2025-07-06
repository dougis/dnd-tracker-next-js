import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getButtonSize,
  getButtonSpacing,
  getHPButtonA11yProps,
  DEFAULT_DAMAGE_AMOUNTS,
  DEFAULT_HEALING_AMOUNTS
} from './hp-button-utils';

interface HPQuickButtonsProps {
  onDamage: (_amount: number) => void;
  onHealing: (_amount: number) => void;
  onEdit: () => void;
  damageAmounts?: number[];
  healingAmounts?: number[];
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

export function HPQuickButtons({
  onDamage,
  onHealing,
  onEdit,
  damageAmounts = DEFAULT_DAMAGE_AMOUNTS,
  healingAmounts = DEFAULT_HEALING_AMOUNTS,
  compact = false,
  disabled = false,
  className,
}: HPQuickButtonsProps) {
  const buttonSize = getButtonSize(compact);
  const spacing = getButtonSpacing(compact);

  return (
    <div
      data-testid="hp-quick-buttons"
      className={cn(
        'flex flex-wrap items-center gap-1',
        spacing,
        className
      )}
    >
      {/* Damage buttons */}
      <div className="flex items-center space-x-1">
        {damageAmounts.map((amount) => (
          <Button
            key={`damage-${amount}`}
            variant="destructive"
            size={buttonSize}
            onClick={() => onDamage(amount)}
            disabled={disabled}
            {...getHPButtonA11yProps('damage', amount)}
            className="min-w-[60px]"
          >
            {amount} Damage
          </Button>
        ))}
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Healing buttons */}
      <div className="flex items-center space-x-1">
        {healingAmounts.map((amount) => (
          <Button
            key={`heal-${amount}`}
            variant="default"
            size={buttonSize}
            onClick={() => onHealing(amount)}
            disabled={disabled}
            {...getHPButtonA11yProps('healing', amount)}
            className="min-w-[60px] bg-green-600 hover:bg-green-700 text-white"
          >
            {amount} Heal
          </Button>
        ))}
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Edit button */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={onEdit}
        disabled={disabled}
        {...getHPButtonA11yProps('edit')}
        className="min-w-[70px]"
      >
        Edit HP
      </Button>
    </div>
  );
}