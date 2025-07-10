import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword } from 'lucide-react';

export default function CombatGuideCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sword className="h-5 w-5" />
          Combat Tracking
        </CardTitle>
        <CardDescription>
          Master initiative, HP tracking, and turn management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">How to Manage Initiative</h4>
            <p className="text-xs text-muted-foreground">
              Roll initiative, handle tiebreakers, and manage turn order during combat.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">How to Track HP and Damage</h4>
            <p className="text-xs text-muted-foreground">
              Apply damage, healing, and temporary HP with automated calculations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Managing Conditions and Effects</h4>
            <p className="text-xs text-muted-foreground">
              Track status effects, spell durations, and ongoing conditions.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Essential</Badge>
        </div>
      </CardContent>
    </Card>
  );
}