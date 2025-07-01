'use client';

import React, { useState } from 'react';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dice6, Shuffle, Calculator } from 'lucide-react';

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface AbilityScoresSectionProps {
  value: AbilityScores;
  onChange: (_value: AbilityScores) => void;
  errors: Record<string, string>;
  showPointBuy?: boolean;
}

const ABILITIES = [
  { key: 'strength', name: 'Strength', abbreviation: 'STR' },
  { key: 'dexterity', name: 'Dexterity', abbreviation: 'DEX' },
  { key: 'constitution', name: 'Constitution', abbreviation: 'CON' },
  { key: 'intelligence', name: 'Intelligence', abbreviation: 'INT' },
  { key: 'wisdom', name: 'Wisdom', abbreviation: 'WIS' },
  { key: 'charisma', name: 'Charisma', abbreviation: 'CHA' },
] as const;

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export function AbilityScoresSection({
  value,
  onChange,
  errors,
  showPointBuy = false
}: AbilityScoresSectionProps) {
  const [usePointBuy, setUsePointBuy] = useState(showPointBuy);
  const [isRolling, setIsRolling] = useState(false);

  const calculateModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const calculatePointBuyTotal = (): number => {
    return Object.values(value).reduce((total, score) => {
      return total + (POINT_BUY_COSTS[score] || 0);
    }, 0);
  };

  const handleScoreChange = (ability: keyof AbilityScores, newValue: string) => {
    const numValue = parseInt(newValue) || 0;
    onChange({
      ...value,
      [ability]: numValue,
    });
  };

  const applyStandardArray = () => {
    const newScores = { ...value };
    ABILITIES.forEach((ability, index) => {
      newScores[ability.key] = STANDARD_ARRAY[index] || 10;
    });
    onChange(newScores);
  };

  const rollDice = async () => {
    setIsRolling(true);

    // Simulate dice rolling animation
    const rollPromise = new Promise<AbilityScores>((resolve) => {
      setTimeout(() => {
        const newScores = { ...value };
        ABILITIES.forEach((ability) => {
          // Roll 4d6, drop lowest
          const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
          rolls.sort((a, b) => b - a);
          newScores[ability.key] = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
        });
        resolve(newScores);
      }, 1000);
    });

    const newScores = await rollPromise;
    onChange(newScores);
    setIsRolling(false);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = 'Ability scores rolled';
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const pointBuyTotal = calculatePointBuyTotal();
  const pointBuyRemaining = 27 - pointBuyTotal;
  const isOverPointBuyLimit = pointBuyTotal > 27;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Ability Scores
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set your character&apos;s fundamental attributes
        </p>
      </div>

      <div className="space-y-4" data-testid="generation-tools">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-point-buy"
            checked={usePointBuy}
            onCheckedChange={setUsePointBuy}
          />
          <label htmlFor="use-point-buy" className="text-sm font-medium">
            Use Point Buy System
          </label>
        </div>

        {usePointBuy && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Point Buy</span>
              <div className="flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <Badge variant={isOverPointBuyLimit ? "destructive" : "secondary"}>
                  {pointBuyRemaining} points remaining
                </Badge>
              </div>
            </div>
            {isOverPointBuyLimit && (
              <p className="text-sm text-destructive">
                Over point buy limit! Reduce some ability scores.
              </p>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyStandardArray}
            className="flex items-center space-x-2"
          >
            <Shuffle className="h-4 w-4" />
            <span>Use Standard Array</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={rollDice}
            disabled={isRolling}
            className="flex items-center space-x-2"
          >
            <Dice6 className="h-4 w-4" />
            <span>{isRolling ? 'Rolling...' : 'Roll Dice'}</span>
          </Button>
        </div>
      </div>

      {isRolling && (
        <div className="flex justify-center" data-testid="dice-animation">
          <div className="animate-bounce">
            <Dice6 className="h-8 w-8 text-primary" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="ability-scores-grid">
        {ABILITIES.map((ability) => {
          const score = value[ability.key];
          const modifier = calculateModifier(score);
          const hasError = errors[ability.key];

          return (
            <div
              key={ability.key}
              className="space-y-2 p-4 border rounded-lg bg-card"
            >
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {ability.abbreviation}
                </div>
                <h4 className="text-sm font-semibold">{ability.name}</h4>
              </div>

              <div className="space-y-2">
                <FormInput
                  label={ability.name}
                  value={score.toString()}
                  onChange={(e) => handleScoreChange(ability.key, e.target.value)}
                  error={hasError}
                  type="number"
                  min="1"
                  max="30"
                  required
                  className="text-center font-mono text-lg"
                  aria-describedby={`${ability.key}-modifier`}
                />

                <div
                  id={`${ability.key}-modifier`}
                  className="text-center"
                  data-testid={`${ability.key}-modifier`}
                >
                  <Badge variant="outline" className="font-mono">
                    {modifier}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}