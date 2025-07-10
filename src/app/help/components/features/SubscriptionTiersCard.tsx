import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Sword, Gem } from 'lucide-react';

export default function SubscriptionTiersCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Subscription Tiers
        </CardTitle>
        <CardDescription>
          Feature availability across different subscription levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-green-500" />
              <h4 className="font-semibold">Free Adventurer</h4>
              <Badge variant="secondary">$0/month</Badge>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• 1 Party (up to 6 characters)</li>
              <li>• 3 Saved Encounters</li>
              <li>• 10 Custom Creatures</li>
              <li>• Basic Combat Tracking</li>
              <li>• Standard Support</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sword className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold">Expert Dungeon Master</h4>
              <Badge variant="secondary">$9.99/month</Badge>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• 10 Parties</li>
              <li>• 50 Saved Encounters</li>
              <li>• 200 Custom Creatures</li>
              <li>• Advanced Combat Features</li>
              <li>• Campaign Management</li>
              <li>• Priority Support</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gem className="h-4 w-4 text-purple-500" />
              <h4 className="font-semibold">Guild Master</h4>
              <Badge variant="secondary">$39.99/month</Badge>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Unlimited Everything</li>
              <li>• Multi-Campaign Management</li>
              <li>• Team Collaboration</li>
              <li>• Advanced Analytics</li>
              <li>• API Access</li>
              <li>• White-label Options</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}