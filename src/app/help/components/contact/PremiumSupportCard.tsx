import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

export default function PremiumSupportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Premium Support Benefits
        </CardTitle>
        <CardDescription>
          Enhanced support features for paid subscribers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Priority Queue</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Your support tickets get priority handling with faster response times.
            </p>
            <Badge variant="secondary">Expert & Above</Badge>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Live Chat Access</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Access to live chat support during business hours for immediate help.
            </p>
            <Badge variant="secondary">Expert & Above</Badge>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Phone Support</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Direct phone support for complex issues and detailed troubleshooting.
            </p>
            <Badge variant="secondary">Guild Master</Badge>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Screen Sharing</h4>
            <p className="text-xs text-muted-foreground mb-3">
              One-on-one screen sharing sessions for complex setup and configuration.
            </p>
            <Badge variant="secondary">Guild Master</Badge>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Dedicated Support</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Assigned support representative who knows your setup and history.
            </p>
            <Badge variant="secondary">Guild Master</Badge>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Feature Requests</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Direct input on new features and priority consideration for your requests.
            </p>
            <Badge variant="secondary">All Paid Tiers</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}