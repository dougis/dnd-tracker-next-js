import React from 'react';
import { CheckCircleIcon, AlertCircleIcon, XCircleIcon } from 'lucide-react';
import type { ReadinessCheck } from '@/lib/utils/combat-readiness';

interface ReadinessCheckProps {
  check: ReadinessCheck;
}

const statusIcons = {
  ready: CheckCircleIcon,
  warning: AlertCircleIcon,
  error: XCircleIcon,
};

const statusColors = {
  ready: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
};

/**
 * Display a single readiness check item
 */
export function ReadinessCheckItem({ check }: ReadinessCheckProps) {
  const IconComponent = statusIcons[check.status];
  const colorClass = statusColors[check.status];

  return (
    <div className="flex items-start space-x-3">
      <IconComponent className={`h-4 w-4 ${colorClass}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{check.category}</span>
        </div>
        <p className="text-xs text-muted-foreground">{check.message}</p>
        {check.details && (
          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
        )}
      </div>
    </div>
  );
}