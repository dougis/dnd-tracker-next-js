import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SubscriptionTierItemProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  price: string;
  features: string[];
}

export default function SubscriptionTierItem({
  icon: Icon,
  iconColor,
  title,
  price,
  features,
}: SubscriptionTierItemProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h4 className="font-semibold">{title}</h4>
        <Badge variant="secondary">{price}</Badge>
      </div>
      <ul className="text-xs space-y-1 text-muted-foreground">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
    </div>
  );
}