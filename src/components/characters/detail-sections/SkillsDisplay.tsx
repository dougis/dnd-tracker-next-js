import React from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSkillBonus, formatBonus, SKILL_ABILITIES } from './character-utils';

interface SkillsDisplayProps {
  character: ICharacter;
}

export function SkillsDisplay({ character }: SkillsDisplayProps) {
  if (!character.skills) return null;

  const hasSkills = character.skills instanceof Map
    ? character.skills.size > 0
    : Object.keys(character.skills).length > 0;

  if (!hasSkills) return null;

  const skillEntries = character.skills instanceof Map
    ? Array.from(character.skills.entries())
    : Object.entries(character.skills);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {skillEntries.map(([skillName, isProficient]) => {
            if (!isProficient) return null;
            const abilityKey = SKILL_ABILITIES[skillName] || 'wisdom';
            const abilityScore = character.abilityScores[abilityKey];
            const bonus = getSkillBonus(character, skillName, abilityScore);

            return (
              <div key={skillName} className="flex justify-between">
                <span>{skillName}</span>
                <span className="font-medium">{formatBonus(bonus)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}