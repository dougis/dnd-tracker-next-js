'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Star,
  Heart,
  Dice6,
  Zap,
  Settings,
  UserPlus,
  XCircle,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  handler: () => void;
}

interface CustomActionsGroupProps {
  customActions: QuickAction[];
  disabled: boolean;
}

const IconMap = {
  star: Star,
  heart: Heart,
  dice: Dice6,
  zap: Zap,
  settings: Settings,
  'user-plus': UserPlus,
  'x-circle': XCircle,
};

export function CustomActionsGroup({
  customActions,
  disabled,
}: CustomActionsGroupProps) {
  if (customActions.length === 0) return null;

  const renderIcon = (iconName: string, className: string = 'h-4 w-4') => {
    const IconComponent = IconMap[iconName as keyof typeof IconMap] || Star;
    return <IconComponent className={className} data-testid={`${iconName}-icon`} />;
  };

  return (
    <div className="col-span-3 grid grid-cols-3 gap-2" data-testid="custom-actions-group">
      {customActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={action.handler}
          disabled={disabled}
          title={action.label}
          aria-label={action.label}
        >
          {renderIcon(action.icon, 'h-4 w-4 mr-1')}
          {action.label}
        </Button>
      ))}
    </div>
  );
}