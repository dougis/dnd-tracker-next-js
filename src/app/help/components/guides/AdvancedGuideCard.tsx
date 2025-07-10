import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

export default function AdvancedGuideCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced Features
        </CardTitle>
        <CardDescription>
          Customize and optimize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">Custom Rules and Homebrew</h4>
            <p className="text-xs text-muted-foreground">
              Configure custom rules, homebrew creatures, and variant rule systems.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Automation Settings</h4>
            <p className="text-xs text-muted-foreground">
              Set up automated dice rolling, damage calculation, and turn progression.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Campaign Management</h4>
            <p className="text-xs text-muted-foreground">
              Organize multiple campaigns, track long-term character progression.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Advanced</Badge>
        </div>
      </CardContent>
    </Card>
  );
}