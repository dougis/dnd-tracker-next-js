import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export default function EncounterGuideCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Encounter Building
        </CardTitle>
        <CardDescription>
          Design balanced and engaging combat encounters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">Encounter Difficulty Calculation</h4>
            <p className="text-xs text-muted-foreground">
              Use CR calculations and party level balancing to create appropriate challenges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Adding Environmental Factors</h4>
            <p className="text-xs text-muted-foreground">
              Include terrain, weather, and special conditions that affect combat.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Lair Actions & Legendary Actions</h4>
            <p className="text-xs text-muted-foreground">
              Configure complex creature abilities and environmental effects.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Intermediate</Badge>
        </div>
      </CardContent>
    </Card>
  );
}