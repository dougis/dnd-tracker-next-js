import React from 'react';
import { HPStatus } from './useHPTracking';

interface HPStatusDisplayProps {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  effectiveHP: number;
  hpStatus: HPStatus;
}

const HP_STATUS_CONFIG = {
  unconscious: { icon: '💀', text: 'Unconscious', className: 'text-red-600 font-medium' },
  critical: { icon: '⚠️', text: 'Critical HP Level', className: 'text-orange-600 font-medium' },
  injured: { icon: '🩹', text: 'Injured', className: 'text-yellow-600 font-medium' },
  healthy: { icon: '💚', text: 'Healthy', className: 'text-green-600 font-medium' },
} as const;

export function HPStatusDisplay({
  currentHP,
  maxHP,
  tempHP,
  effectiveHP,
  hpStatus,
}: HPStatusDisplayProps) {
  const statusConfig = HP_STATUS_CONFIG[hpStatus];
  const statusDisplay = statusConfig ? (
    <span className={statusConfig.className}>
      {statusConfig.icon} {statusConfig.text}
    </span>
  ) : null;

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Current Status</span>
        {statusDisplay}
      </div>
      <div className="text-lg font-mono">
        Status: {currentHP}/{maxHP} {tempHP > 0 && `(+${tempHP})`} = {effectiveHP} effective HP
      </div>
    </div>
  );
}