'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { FormGroup } from '@/components/forms/FormGroup';
import { FormFieldNumber } from '../components';

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
          <FormFieldNumber
            form={form}
            name="hitPoints.maximum"
            label="Maximum HP"
            required
            min={1}
            max={1000}
            defaultValue={1}
            className="flex-1"
          />

          <FormFieldNumber
            form={form}
            name="hitPoints.current"
            label="Current HP"
            required
            min={0}
            max={hitPoints?.maximum ?? 1000}
            description={`Max: ${hitPoints?.maximum ?? 0}`}
            className="flex-1"
          />

          <FormFieldNumber
            form={form}
            name="hitPoints.temporary"
            label="Temporary HP"
            min={0}
            max={200}
            description="Optional"
            className="flex-1"
          />
        </FormGroup>
      </div>

      {/* Other Combat Stats */}
      <FormGroup direction="row" spacing="md">
        <FormFieldNumber
          form={form}
          name="armorClass"
          label="Armor Class"
          required
          min={1}
          max={50}
          defaultValue={1}
          description={`Current AC: ${armorClass ?? 0}`}
          className="flex-1"
        />

        <FormFieldNumber
          form={form}
          name="speed"
          label="Speed (feet)"
          required
          min={0}
          max={120}
          defaultValue={30}
          description={`Walking speed: ${speed ?? 30} ft`}
          className="flex-1"
        />

        <FormFieldNumber
          form={form}
          name="proficiencyBonus"
          label="Proficiency Bonus"
          required
          min={2}
          max={6}
          defaultValue={2}
          description={`Bonus: +${proficiencyBonus ?? 2}`}
          className="flex-1"
        />
      </FormGroup>

      {/* Combat Summary */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm font-medium mb-2">Combat Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">HP:</span>{' '}
            {hitPoints?.current ?? 0}/{hitPoints?.maximum ?? 0}
            {(hitPoints?.temporary ?? 0) > 0 && ` (+${hitPoints.temporary})`}
          </div>
          <div>
            <span className="text-muted-foreground">AC:</span>{' '}
            {armorClass ?? 0}
          </div>
          <div>
            <span className="text-muted-foreground">Speed:</span>{' '}
            {speed ?? 30} ft
          </div>
          <div>
            <span className="text-muted-foreground">Prof:</span>{' '}
            +{proficiencyBonus ?? 2}
          </div>
        </div>
      </div>
    </div>
  );
}