import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ReadinessStatus } from '@/lib/utils/combat-readiness';

interface ReadinessBadgeProps {
  status: ReadinessStatus;
}

const badgeConfig = {
  ready: {
    className: 'bg-green-100 text-green-800',
    text: 'Ready for Combat',
  },
  warning: {
    className: 'bg-yellow-100 text-yellow-800',
    text: 'Review Required',
  },
  error: {
    className: 'bg-red-100 text-red-800',
    text: 'Not Ready',
  },
};

/**
 * Display overall readiness status badge
 */
export function ReadinessBadge({ status }: ReadinessBadgeProps) {
  const config = badgeConfig[status];

  return (
    <Badge className={config.className}>
      {config.text}
    </Badge>
  );
}