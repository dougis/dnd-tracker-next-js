import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function HPTrackingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-red-500" />
          HP & Damage Tracking
        </CardTitle>
        <CardDescription>
          Real-time health and status management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Damage Application</h4>
            <p className="text-xs text-muted-foreground">
              Quick damage entry with resistance/vulnerability calculations.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Healing & Temporary HP</h4>
            <p className="text-xs text-muted-foreground">
              Manage healing spells, potions, and temporary hit points.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Death Saving Throws</h4>
            <p className="text-xs text-muted-foreground">
              Track death saving throws with automatic stabilization.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Condition Tracking</h4>
            <p className="text-xs text-muted-foreground">
              Monitor status effects, spell durations, and ongoing conditions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}