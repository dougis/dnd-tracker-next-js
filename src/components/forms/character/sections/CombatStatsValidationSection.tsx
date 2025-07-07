'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/forms/FormGroup';

interface CombatStatsValidationSectionProps {
  form: UseFormReturn<CharacterCreation>;
}

export function CombatStatsValidationSection({ form }: CombatStatsValidationSectionProps) {
  const hitPoints = form.watch('hitPoints');
  const armorClass = form.watch('armorClass');
  const speed = form.watch('speed');
  const proficiencyBonus = form.watch('proficiencyBonus');

  return (
    <div className="space-y-4" data-testid="combat-stats-validation-section">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Combat Statistics
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure your character&apos;s combat-related statistics with validation
        </p>
      </div>

      {/* Hit Points Section */}
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <h4 className="text-sm font-medium">Hit Points</h4>

        <FormGroup direction="row" spacing="md">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="hitPoints.maximum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum HP *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={form.control}
              name="hitPoints.current"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current HP *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={hitPoints?.maximum || 1000}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Max: {hitPoints?.maximum || 0}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={form.control}
              name="hitPoints.temporary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary HP</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Optional
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </FormGroup>
      </div>

      {/* Other Combat Stats */}
      <FormGroup direction="row" spacing="md">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="armorClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Armor Class *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Current AC: {armorClass || 0}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1">
          <FormField
            control={form.control}
            name="speed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Speed (feet) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Walking speed: {speed || 30} ft
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1">
          <FormField
            control={form.control}
            name="proficiencyBonus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proficiency Bonus *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={6}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Bonus: +{proficiencyBonus || 2}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      </FormGroup>

      {/* Combat Summary */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm font-medium mb-2">Combat Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">HP:</span>{' '}
            {hitPoints?.current || 0}/{hitPoints?.maximum || 0}
            {(hitPoints?.temporary || 0) > 0 && ` (+${hitPoints.temporary})`}
          </div>
          <div>
            <span className="text-muted-foreground">AC:</span>{' '}
            {armorClass || 0}
          </div>
          <div>
            <span className="text-muted-foreground">Speed:</span>{' '}
            {speed || 30} ft
          </div>
          <div>
            <span className="text-muted-foreground">Prof:</span>{' '}
            +{proficiencyBonus || 2}
          </div>
        </div>
      </div>
    </div>
  );
}