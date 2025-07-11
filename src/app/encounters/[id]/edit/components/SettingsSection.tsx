'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UpdateEncounter } from '@/lib/validations/encounter';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Eye, Zap, Shield, MapPin, Clock, Trophy } from 'lucide-react';

interface SettingsSectionProps {
  form: UseFormReturn<UpdateEncounter>;
}

export function SettingsSection({ form }: SettingsSectionProps) {
  const { control, watch } = form;
  const settings = watch('settings');
  
  const enableLairActions = settings?.enableLairActions || false;
  const enableGridMovement = settings?.enableGridMovement || false;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Settings className="h-4 w-4" />
        <span>Configure combat mechanics and behavior settings</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Combat Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Combat Mechanics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Player Visibility */}
            <FormField
              control={control}
              name="settings.allowPlayerVisibility"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="allow-player-visibility" className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Allow Player Visibility</span>
                    </FormLabel>
                    <FormDescription>
                      Players can see encounter information and participant status
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="allow-player-visibility"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-describedby="allow-player-visibility-error"
                    />
                  </FormControl>
                  <FormMessage id="allow-player-visibility-error" />
                </FormItem>
              )}
            />

            {/* Auto-roll Initiative */}
            <FormField
              control={control}
              name="settings.autoRollInitiative"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="auto-roll-initiative" className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Auto-roll Initiative</span>
                    </FormLabel>
                    <FormDescription>
                      Automatically roll initiative for all participants when combat starts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="auto-roll-initiative"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-describedby="auto-roll-initiative-error"
                    />
                  </FormControl>
                  <FormMessage id="auto-roll-initiative-error" />
                </FormItem>
              )}
            />

            {/* Track Resources */}
            <FormField
              control={control}
              name="settings.trackResources"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="track-resources" className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4" />
                      <span>Track Resources</span>
                    </FormLabel>
                    <FormDescription>
                      Monitor spell slots, abilities, and other limited resources
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="track-resources"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-describedby="track-resources-error"
                    />
                  </FormControl>
                  <FormMessage id="track-resources-error" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Advanced Options</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lair Actions */}
            <FormField
              control={control}
              name="settings.enableLairActions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="enable-lair-actions" className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Enable Lair Actions</span>
                    </FormLabel>
                    <FormDescription>
                      Add lair actions that occur at specific initiative counts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="enable-lair-actions"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-describedby="enable-lair-actions-error"
                    />
                  </FormControl>
                  <FormMessage id="enable-lair-actions-error" />
                </FormItem>
              )}
            />

            {/* Lair Action Initiative */}
            {enableLairActions && (
              <FormField
                control={control}
                name="settings.lairActionInitiative"
                render={({ field }) => (
                  <FormItem className="ml-4">
                    <FormLabel htmlFor="lair-action-initiative">Lair Action Initiative</FormLabel>
                    <FormControl>
                      <Input
                        id="lair-action-initiative"
                        type="number"
                        min="1"
                        max="30"
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        aria-describedby="lair-action-initiative-error"
                      />
                    </FormControl>
                    <FormDescription>
                      Initiative count when lair actions occur (typically 20)
                    </FormDescription>
                    <FormMessage id="lair-action-initiative-error" />
                  </FormItem>
                )}
              />
            )}

            {/* Grid Movement */}
            <FormField
              control={control}
              name="settings.enableGridMovement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="enable-grid-movement" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Enable Grid Movement</span>
                    </FormLabel>
                    <FormDescription>
                      Track participant positions on a battle grid
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="enable-grid-movement"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-describedby="enable-grid-movement-error"
                    />
                  </FormControl>
                  <FormMessage id="enable-grid-movement-error" />
                </FormItem>
              )}
            />

            {/* Grid Size */}
            {enableGridMovement && (
              <FormField
                control={control}
                name="settings.gridSize"
                render={({ field }) => (
                  <FormItem className="ml-4">
                    <FormLabel htmlFor="grid-size">Grid Size (feet)</FormLabel>
                    <FormControl>
                      <Input
                        id="grid-size"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                        aria-describedby="grid-size-error"
                      />
                    </FormControl>
                    <FormDescription>
                      Size of each grid square in feet (typically 5)
                    </FormDescription>
                    <FormMessage id="grid-size-error" />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Optional Settings */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Optional Timers & Limits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Round Time Limit */}
            <FormField
              control={control}
              name="settings.roundTimeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="round-time-limit">Round Time Limit (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      id="round-time-limit"
                      type="number"
                      min="30"
                      max="600"
                      placeholder="Leave empty for no limit"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      aria-describedby="round-time-limit-error"
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum time players have to take their turn
                  </FormDescription>
                  <FormMessage id="round-time-limit-error" />
                </FormItem>
              )}
            />

            {/* Experience Threshold */}
            <FormField
              control={control}
              name="settings.experienceThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="experience-threshold">Experience Threshold</FormLabel>
                  <FormControl>
                    <Input
                      id="experience-threshold"
                      type="number"
                      min="0"
                      placeholder="Leave empty for automatic calculation"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      aria-describedby="experience-threshold-error"
                    />
                  </FormControl>
                  <FormDescription>
                    Custom XP reward for completing this encounter
                  </FormDescription>
                  <FormMessage id="experience-threshold-error" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}