'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import {
  calculateModifier,
  formatRace,
  formatClassName,
  calculateTotalLevel,
  formatHitPoints,
  getCompletionSections
} from './character-preview-utils';

interface BasicInfoData {
  name: string;
  type: 'pc' | 'npc';
  race: string;
  customRace?: string;
}

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface ClassData {
  className: string;
  level: number;
}

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

interface CharacterPreviewProps {
  basicInfo: BasicInfoData;
  abilityScores: AbilityScores;
  classes: ClassData[];
  combatStats: CombatStatsData;
  isValid: boolean;
}

export function CharacterPreview({
  basicInfo,
  abilityScores,
  classes,
  combatStats,
  isValid,
}: CharacterPreviewProps) {
  const totalLevel = calculateTotalLevel(classes);
  const completionSections = getCompletionSections(basicInfo, abilityScores, classes, combatStats);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Character Preview</span>
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="font-semibold text-lg mb-2">
            {basicInfo.name || 'Unnamed Character'}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline">
              {basicInfo.type === 'pc' ? 'Player Character' : 'NPC'}
            </Badge>
            <Badge variant="outline">
              {formatRace(basicInfo.race, basicInfo.customRace)}
            </Badge>
          </div>
        </div>

        <hr className="border-border" />

        {/* Classes */}
        <div>
          <h4 className="font-medium mb-2">Classes</h4>
          <div className="space-y-1">
            {classes.map((cls, index) => (
              <div key={index} className="flex justify-between">
                <span>{formatClassName(cls.className)}</span>
                <Badge variant="secondary">Level {cls.level}</Badge>
              </div>
            ))}
            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Total Level</span>
              <Badge>{totalLevel}</Badge>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Ability Scores */}
        <div>
          <h4 className="font-medium mb-3">Ability Scores</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(abilityScores).map(([ability, score]) => (
              <div key={ability} className="flex justify-between">
                <span className="capitalize">{ability.slice(0, 3).toUpperCase()}</span>
                <div className="flex items-center space-x-1">
                  <span className="font-mono">{score}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {calculateModifier(score)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Combat Stats */}
        <div>
          <h4 className="font-medium mb-3">Combat Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Hit Points</span>
              <span className="font-mono">
                {formatHitPoints(combatStats.hitPoints)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Armor Class</span>
              <span className="font-mono">{combatStats.armorClass}</span>
            </div>
            <div className="flex justify-between">
              <span>Speed</span>
              <span className="font-mono">{combatStats.speed || 30} ft</span>
            </div>
            <div className="flex justify-between">
              <span>Proficiency Bonus</span>
              <span className="font-mono">+{combatStats.proficiencyBonus || 2}</span>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Form Completion Status */}
        <div>
          <h4 className="font-medium mb-3">Form Completion</h4>
          <div className="space-y-2">
            {completionSections.map((section) => (
              <div key={section.name} className="flex items-center justify-between">
                <span className="text-sm">{section.name}</span>
                {section.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 p-2 bg-muted rounded text-xs text-center">
            {isValid ? (
              <span className="text-green-600 font-medium">
                ✓ Ready to create character
              </span>
            ) : (
              <span className="text-amber-600">
                Complete all sections to enable creation
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}