'use client';

import React from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { ABILITY_SCORES } from '../constants';
import { getAbilityModifier, formatModifier, calculateAbilityScoreStats } from '../utils';
import { FormFieldNumber } from '../components';

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
            <div key={key} className="relative">
              <FormFieldNumber
                form={form}
                name={`abilityScores.${key}` as FieldPath<CharacterCreation>}
                label={`${label} (${abbr})`}
                min={1}
                max={30}
                defaultValue={1}
                inputClassName="text-center text-lg font-semibold"
                labelClassName="text-center block"
              />
              <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground">
                {formatModifier(modifier)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Point buy summary */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm font-medium mb-2">Ability Score Summary</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(() => {
            const stats = calculateAbilityScoreStats(abilityScores || {});
            return (
              <>
                <div>
                  <span className="text-muted-foreground">Total:</span>{' '}
                  {stats.total}
                </div>
                <div>
                  <span className="text-muted-foreground">Average:</span>{' '}
                  {stats.average}
                </div>
                <div>
                  <span className="text-muted-foreground">Highest:</span>{' '}
                  {stats.highest}
                </div>
                <div>
                  <span className="text-muted-foreground">Lowest:</span>{' '}
                  {stats.lowest}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}