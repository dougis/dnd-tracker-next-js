import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

interface EncounterSettingsProps {
  encounter: IEncounter;
}

/**
 * Display and allow editing of encounter settings and configuration
 */
export function EncounterSettings({ encounter }: EncounterSettingsProps) {
  const settings = encounter.settings;

  const handleSettingChange = (key: string, value: boolean) => {
    // TODO: Implement settings update
    console.log(`Setting ${key} changed to:`, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounter Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Combat Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-roll-initiative" className="text-sm">
              Auto-roll Initiative
            </Label>
            <Switch
              id="auto-roll-initiative"
              checked={settings.autoRollInitiative}
              onCheckedChange={(checked) => handleSettingChange('autoRollInitiative', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="track-resources" className="text-sm">
              Track Resources
            </Label>
            <Switch
              id="track-resources"
              checked={settings.trackResources}
              onCheckedChange={(checked) => handleSettingChange('trackResources', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enable-lair-actions" className="text-sm">
              Enable Lair Actions
            </Label>
            <Switch
              id="enable-lair-actions"
              checked={settings.enableLairActions}
              onCheckedChange={(checked) => handleSettingChange('enableLairActions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="player-visibility" className="text-sm">
              Allow Player Visibility
            </Label>
            <Switch
              id="player-visibility"
              checked={settings.allowPlayerVisibility}
              onCheckedChange={(checked) => handleSettingChange('allowPlayerVisibility', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="grid-movement" className="text-sm">
              Enable Grid Movement
            </Label>
            <Switch
              id="grid-movement"
              checked={settings.enableGridMovement}
              onCheckedChange={(checked) => handleSettingChange('enableGridMovement', checked)}
            />
          </div>
        </div>

        {/* Additional Settings Information */}
        <div className="pt-3 border-t space-y-2">
          {settings.gridSize && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Grid Size:</span>
              <span className="text-sm">{settings.gridSize} ft</span>
            </div>
          )}

          {settings.lairActionInitiative && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lair Action Initiative:</span>
              <span className="text-sm">{settings.lairActionInitiative}</span>
            </div>
          )}

          {settings.roundTimeLimit && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Round Time Limit:</span>
              <span className="text-sm">{settings.roundTimeLimit}s</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}