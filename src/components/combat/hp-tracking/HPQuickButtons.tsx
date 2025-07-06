import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  damageAmounts = [1, 5, 10],
  healingAmounts = [1, 5, 10],
  compact = false,
  disabled = false,
  className,
}: HPQuickButtonsProps) {
  const buttonSize = compact ? 'sm' : 'default';
  const spacing = compact ? 'space-x-1' : 'space-x-2';

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
            aria-label={`Apply ${amount} damage`}
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
            aria-label={`Apply ${amount} healing`}
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
        aria-label="Edit HP values"
        className="min-w-[70px]"
      >
        Edit HP
      </Button>
    </div>
  );
}