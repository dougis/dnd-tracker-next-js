import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '../constants';

interface SubscriptionSectionProps {
  currentTier: SubscriptionTier;
  onUpgradeClick: () => void;
}

export function SubscriptionSection({
  currentTier,
  onUpgradeClick,
}: SubscriptionSectionProps) {
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div data-testid="current-subscription-tier">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{tierInfo.name}</h4>
                <p className="text-sm text-muted-foreground">{tierInfo.price}/{tierInfo.period}</p>
              </div>
              <Badge variant="secondary">{currentTier === 'free' ? 'Free' : 'Premium'}</Badge>
            </div>
          </div>

          <Separator />

          <div data-testid="subscription-features">
            <p className="font-medium mb-2">Your plan includes:</p>
            <ul className="text-sm space-y-1">
              {tierInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {currentTier === 'free' && (
            <Button onClick={onUpgradeClick}>
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}