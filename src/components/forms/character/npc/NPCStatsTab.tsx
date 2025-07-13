import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { calculateAbilityModifier } from '@/types/npc';

interface NPCStatsTabProps {
  formData: {
    abilityScores: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    hitPoints: {
      maximum: number;
      current: number;
      temporary: number;
    };
    armorClass: number;
    speed: number;
    damageVulnerabilities: string[];
    damageResistances: string[];
    damageImmunities: string[];
    conditionImmunities: string[];
  };
  errors: Record<string, string>;
  suggestedAC: number;
  onUpdate: (_updates: Partial<NPCStatsTabProps['formData']>) => void;
  onGoToBasic: () => void;
  onGoToDetails: () => void;
}

export function NPCStatsTab({
  formData,
  errors,
  suggestedAC,
  onUpdate,
  onGoToBasic,
  onGoToDetails,
}: NPCStatsTabProps) {
  const updateAbilityScore = (ability: string, value: number) => {
    onUpdate({
      abilityScores: {
        ...formData.abilityScores,
        [ability]: value
      }
    });
  };

  const updateHitPoints = (maximum: number) => {
    onUpdate({
      hitPoints: {
        maximum,
        current: maximum,
        temporary: formData.hitPoints.temporary
      }
    });
  };

  const updateDamageArray = (type: string, value: string) => {
    const array = value.split(',').map(s => s.trim()).filter(Boolean);
    onUpdate({ [type]: array });
  };

  return (
    <div className="space-y-4">
      {/* Ability Scores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ability Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(formData.abilityScores).map(([ability, score]) => (
            <div key={ability} className="space-y-2">
              <Label htmlFor={ability} className="capitalize">
                {ability}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={ability}
                  type="number"
                  min="1"
                  max="30"
                  value={score}
                  onChange={(e) => updateAbilityScore(ability, parseInt(e.target.value, 10) || 10)}
                  className="w-20"
                />
                <Badge variant="outline">
                  {calculateAbilityModifier(score) >= 0 ? '+' : ''}{calculateAbilityModifier(score)}
                </Badge>
              </div>
              {errors[ability] && <p className="text-sm text-red-600" role="alert">{errors[ability]}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Combat Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Combat Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hit-points">Hit Points *</Label>
            <Input
              id="hit-points"
              type="number"
              min="1"
              value={formData.hitPoints.maximum}
              onChange={(e) => updateHitPoints(parseInt(e.target.value, 10) || 1)}
              aria-required="true"
            />
            {errors.hitPoints && <p className="text-sm text-red-600" role="alert">{errors.hitPoints}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="armor-class">Armor Class *</Label>
            <Input
              id="armor-class"
              type="number"
              min="1"
              max="30"
              value={formData.armorClass}
              onChange={(e) => onUpdate({ armorClass: parseInt(e.target.value, 10) || 10 })}
              aria-required="true"
            />
            <p className="text-sm text-muted-foreground">Suggested AC: {suggestedAC}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="speed">Speed (feet)</Label>
            <Input
              id="speed"
              type="number"
              min="0"
              value={formData.speed}
              onChange={(e) => onUpdate({ speed: parseInt(e.target.value, 10) || 30 })}
            />
          </div>
        </div>
      </div>

      {/* Damage Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Damage & Conditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="damage-resistances">Damage Resistances</Label>
            <Input
              id="damage-resistances"
              placeholder="e.g., fire, cold, slashing"
              value={formData.damageResistances.join(', ')}
              onChange={(e) => updateDamageArray('damageResistances', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damage-immunities">Damage Immunities</Label>
            <Input
              id="damage-immunities"
              placeholder="e.g., poison, necrotic"
              value={formData.damageImmunities.join(', ')}
              onChange={(e) => updateDamageArray('damageImmunities', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damage-vulnerabilities">Damage Vulnerabilities</Label>
            <Input
              id="damage-vulnerabilities"
              placeholder="e.g., fire, radiant"
              value={formData.damageVulnerabilities.join(', ')}
              onChange={(e) => updateDamageArray('damageVulnerabilities', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition-immunities">Condition Immunities</Label>
            <Input
              id="condition-immunities"
              placeholder="e.g., charmed, frightened"
              value={formData.conditionImmunities.join(', ')}
              onChange={(e) => updateDamageArray('conditionImmunities', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onGoToBasic}>
          Back: Basic Info
        </Button>
        <Button onClick={onGoToDetails}>
          Next: Details & Behavior
        </Button>
      </div>
    </div>
  );
}