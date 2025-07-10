import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice6, Heart } from 'lucide-react';

export default function ProTipsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dice6 className="h-5 w-5" />
          Pro Tips & Best Practices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Combat Flow Optimization
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Pre-roll initiative for NPCs to speed up combat start</li>
              <li>• Use quick damage buttons for common attack values</li>
              <li>• Set up macros for frequently used spells and abilities</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Organization Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Use naming conventions for easy character sorting</li>
              <li>• Tag encounters by location or story arc</li>
              <li>• Create template encounters for common situations</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}