import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function EncounterBuilderCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Encounter Builder
        </CardTitle>
        <CardDescription>
          Design balanced and engaging combat encounters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">CR Calculation</h4>
            <p className="text-xs text-muted-foreground">
              Automatic encounter difficulty calculation based on party composition.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Creature Library</h4>
            <p className="text-xs text-muted-foreground">
              Access to comprehensive creature database with custom creature support.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Environmental Factors</h4>
            <p className="text-xs text-muted-foreground">
              Add terrain, weather, and special conditions to encounters.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Encounter Templates</h4>
            <p className="text-xs text-muted-foreground">
              Save and reuse encounter setups for different campaigns.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}