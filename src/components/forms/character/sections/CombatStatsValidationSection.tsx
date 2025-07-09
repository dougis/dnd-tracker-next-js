'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { FormGroup } from '@/components/forms/FormGroup';
import { FormFieldNumber } from '../components';

interface CombatStatsValidationSectionProps {
  form: UseFormReturn<CharacterCreation>;
}

interface CombatStats {
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
  } | null;
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
}

function formatHitPoints(hitPoints: CombatStats['hitPoints']): string {
  const current = hitPoints?.current ?? 0;
  const maximum = hitPoints?.maximum ?? 0;
  const temporary = hitPoints?.temporary ?? 0;

  let result = `${current}/${maximum}`;
  if (temporary > 0) {
    result += ` (+${temporary})`;
  }
  return result;
}

function HitPointsSection({ form }: { form: UseFormReturn<CharacterCreation> }) {
  const hitPoints = form.watch('hitPoints');

  return (
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
  );
}

function CombatSummary({ stats }: { stats: CombatStats }) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="text-sm font-medium mb-2">Combat Summary</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">HP:</span>{' '}
          {formatHitPoints(stats.hitPoints)}
        </div>
        <div>
          <span className="text-muted-foreground">AC:</span>{' '}
          {stats.armorClass}
        </div>
        <div>
          <span className="text-muted-foreground">Speed:</span>{' '}
          {stats.speed} ft
        </div>
        <div>
          <span className="text-muted-foreground">Prof:</span>{' '}
          +{stats.proficiencyBonus}
        </div>
      </div>
    </div>
  );
}

export function CombatStatsValidationSection({ form }: CombatStatsValidationSectionProps) {
  const combatStats: CombatStats = {
    hitPoints: form.watch('hitPoints'),
    armorClass: form.watch('armorClass') ?? 0,
    speed: form.watch('speed') ?? 30,
    proficiencyBonus: form.watch('proficiencyBonus') ?? 2,
  };

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

      <HitPointsSection form={form} />

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
          description={`Current AC: ${combatStats.armorClass}`}
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
          description={`Walking speed: ${combatStats.speed} ft`}
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
          description={`Bonus: +${combatStats.proficiencyBonus}`}
          className="flex-1"
        />
      </FormGroup>

      <CombatSummary stats={combatStats} />
    </div>
  );
}