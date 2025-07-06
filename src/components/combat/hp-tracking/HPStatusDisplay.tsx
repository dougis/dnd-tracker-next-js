import React from 'react';
import { HPStatus } from './useHPTracking';

interface HPStatusDisplayProps {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  effectiveHP: number;
  hpStatus: HPStatus;
}

export function HPStatusDisplay({
  currentHP,
  maxHP,
  tempHP,
  effectiveHP,
  hpStatus,
}: HPStatusDisplayProps) {
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
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Current Status</span>
        {getHPStatusDisplay()}
      </div>
      <div className="text-lg font-mono">
        Status: {currentHP}/{maxHP} {tempHP > 0 && `(+${tempHP})`} = {effectiveHP} effective HP
      </div>
    </div>
  );
}