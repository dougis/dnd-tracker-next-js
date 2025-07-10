import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function KeyFeaturesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Features Overview</CardTitle>
        <CardDescription>
          Essential features to help you run better D&D sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Initiative Tracking</h4>
            <p className="text-sm text-muted-foreground">
              Automated initiative rolling with dexterity tiebreakers and turn management.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">HP & Damage Management</h4>
            <p className="text-sm text-muted-foreground">
              Real-time HP tracking with damage, healing, and temporary HP support.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Character Library</h4>
            <p className="text-sm text-muted-foreground">
              Complete character sheets with multiclass support and equipment tracking.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Encounter Planning</h4>
            <p className="text-sm text-muted-foreground">
              CR calculation, difficulty balancing, and environmental factor management.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}