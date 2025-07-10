import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sword } from 'lucide-react';

export default function InitiativeTrackerCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sword className="h-5 w-5" />
          Initiative Tracker
        </CardTitle>
        <CardDescription>
          Advanced combat turn management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Automatic Initiative</h4>
            <p className="text-xs text-muted-foreground">
              Automated initiative rolling with dexterity tiebreaker resolution.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Turn Management</h4>
            <p className="text-xs text-muted-foreground">
              Easy turn progression with action tracking and status management.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Lair Actions</h4>
            <p className="text-xs text-muted-foreground">
              Support for lair actions, legendary actions, and environmental effects.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Combat History</h4>
            <p className="text-xs text-muted-foreground">
              Track combat rounds, actions taken, and damage dealt over time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}