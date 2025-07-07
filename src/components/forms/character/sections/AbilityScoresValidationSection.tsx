'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ABILITY_SCORES } from '../constants';
import { getAbilityModifier, formatModifier } from '../utils';

interface AbilityScoresValidationSectionProps {
  form: UseFormReturn<CharacterCreation>;
}

export function AbilityScoresValidationSection({ form }: AbilityScoresValidationSectionProps) {
  const abilityScores = form.watch('abilityScores');

  return (
    <div className="space-y-4" data-testid="ability-scores-validation-section">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Ability Scores
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set your character&apos;s core ability scores (1-30)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ABILITY_SCORES.map(({ key, label, abbr }) => {
          const score = abilityScores?.[key] || 10;
          const modifier = getAbilityModifier(score);

          return (
            <FormField
              key={key}
              control={form.control}
              name={`abilityScores.${key}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block">
                    {label} ({abbr})
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        className="text-center text-lg font-semibold"
                      />
                      <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground">
                        {formatModifier(modifier)}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>

      {/* Point buy summary */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm font-medium mb-2">Ability Score Summary</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span>{' '}
            {Object.values(abilityScores || {}).reduce((sum, score) => sum + (score || 0), 0)}
          </div>
          <div>
            <span className="text-muted-foreground">Average:</span>{' '}
            {Math.round(Object.values(abilityScores || {}).reduce((sum, score) => sum + (score || 0), 0) / 6 * 10) / 10}
          </div>
          <div>
            <span className="text-muted-foreground">Highest:</span>{' '}
            {Math.max(...Object.values(abilityScores || {}))}
          </div>
          <div>
            <span className="text-muted-foreground">Lowest:</span>{' '}
            {Math.min(...Object.values(abilityScores || {}))}
          </div>
        </div>
      </div>
    </div>
  );
}