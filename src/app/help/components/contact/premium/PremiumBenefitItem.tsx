import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PremiumBenefitItemProps {
  title: string;
  description: string;
  tier: string;
}

export default function PremiumBenefitItem({
  title,
  description,
  tier,
}: PremiumBenefitItemProps) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">
        {description}
      </p>
      <Badge variant="secondary">{tier}</Badge>
    </div>
  );
}