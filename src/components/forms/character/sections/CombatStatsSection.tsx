'use client';

import React from 'react';
import { FormInput } from '@/components/forms/FormInput';
import { FormGroup } from '@/components/forms/FormGroup';

interface CombatStatsData {
  hitPoints: {
    maximum: number;
    current: number;
    temporary?: number;
  };
  armorClass: number;
  speed?: number;
  proficiencyBonus?: number;
}

interface ClassData {
  className: string;
  level: number;
}

interface CombatStatsSectionProps {
  value: CombatStatsData;
  onChange: (_value: CombatStatsData) => void;
  errors: Record<string, string>;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  classes: ClassData[];
}

export function CombatStatsSection({
  value,
  onChange,
  errors,
  abilityScores,
  classes
}: CombatStatsSectionProps) {
  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const calculateProficiencyBonus = (): number => {
    const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
    return Math.ceil(totalLevel / 4) + 1;
  };

  const updateField = (field: string, newValue: string | number) => {
    if (field.startsWith('hitPoints.')) {
      const hpField = field.split('.')[1];
      onChange({
        ...value,
        hitPoints: {
          ...value.hitPoints,
          [hpField]: typeof newValue === 'string' ? parseInt(newValue) || 0 : newValue,
        },
      });
    } else {
      onChange({
        ...value,
        [field]: typeof newValue === 'string' ? parseInt(newValue) || 0 : newValue,
      });
    }
  };

  const constitutionModifier = calculateModifier(abilityScores.constitution);
  const dexterityModifier = calculateModifier(abilityScores.dexterity);
  const suggestedProficiencyBonus = calculateProficiencyBonus();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Combat Statistics
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set your character&apos;s combat-related statistics
        </p>
      </div>

      <div className="space-y-6">
        {/* Hit Points Section */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Hit Points</h4>

          <FormGroup direction="row" spacing="md">
            <div className="flex-1">
              <FormInput
                label="Maximum Hit Points"
                value={value.hitPoints.maximum.toString()}
                onChange={(e) => updateField('hitPoints.maximum', e.target.value)}
                error={errors.maxHitPoints}
                type="number"
                min={1}
                max={9999}
                required
                helperText={`CON modifier: ${constitutionModifier >= 0 ? '+' : ''}${constitutionModifier}`}
              />
            </div>
            <div className="flex-1">
              <FormInput
                label="Current Hit Points"
                value={value.hitPoints.current.toString()}
                onChange={(e) => updateField('hitPoints.current', e.target.value)}
                error={errors.currentHitPoints}
                type="number"
                min={0}
                max={value.hitPoints.maximum || 9999}
                required
              />
            </div>
            <div className="flex-1">
              <FormInput
                label="Temporary Hit Points"
                value={(value.hitPoints.temporary || 0).toString()}
                onChange={(e) => updateField('hitPoints.temporary', e.target.value)}
                error={errors.temporaryHitPoints}
                type="number"
                min={0}
                max={999}
                helperText="Optional"
              />
            </div>
          </FormGroup>
        </div>

        {/* Armor Class & Speed */}
        <FormGroup direction="row" spacing="md">
          <div className="flex-1">
            <FormInput
              label="Armor Class"
              value={value.armorClass.toString()}
              onChange={(e) => updateField('armorClass', e.target.value)}
              error={errors.armorClass}
              type="number"
              min={1}
              max={30}
              required
              helperText={`DEX modifier: ${dexterityModifier >= 0 ? '+' : ''}${dexterityModifier}`}
            />
          </div>
          <div className="flex-1">
            <FormInput
              label="Speed (feet)"
              value={(value.speed || 30).toString()}
              onChange={(e) => updateField('speed', e.target.value)}
              error={errors.speed}
              type="number"
              min={0}
              max={120}
              helperText="Default: 30 feet"
            />
          </div>
        </FormGroup>

        {/* Proficiency Bonus */}
        <div>
          <FormInput
            label="Proficiency Bonus"
            value={(value.proficiencyBonus || suggestedProficiencyBonus).toString()}
            onChange={(e) => updateField('proficiencyBonus', e.target.value)}
            error={errors.proficiencyBonus}
            type="number"
            min={2}
            max={6}
            helperText={`Suggested based on level: +${suggestedProficiencyBonus}`}
          />
        </div>

        {/* Calculated Values Display */}
        <div className="p-4 bg-muted rounded-lg">
          <h5 className="text-sm font-medium mb-3">Calculated Values</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Initiative</div>
              <div className="font-mono">
                {dexterityModifier >= 0 ? '+' : ''}{dexterityModifier}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Hit Die</div>
              <div className="font-mono">
                {classes.length > 0 ? `d${classes[0]?.className === 'barbarian' ? '12' :
                  classes[0]?.className === 'fighter' || classes[0]?.className === 'paladin' || classes[0]?.className === 'ranger' ? '10' :
                  classes[0]?.className === 'bard' || classes[0]?.className === 'cleric' || classes[0]?.className === 'druid' ||
                  classes[0]?.className === 'monk' || classes[0]?.className === 'rogue' || classes[0]?.className === 'warlock' ? '8' : '6'}` : 'd8'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Level</div>
              <div className="font-mono">
                {classes.reduce((sum, cls) => sum + cls.level, 0)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Prof. Bonus</div>
              <div className="font-mono">
                +{value.proficiencyBonus || suggestedProficiencyBonus}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}