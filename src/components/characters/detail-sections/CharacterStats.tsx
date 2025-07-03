import React from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAbilityScoreDisplay, getSavingThrowBonus, getSkillBonus, formatBonus } from './character-utils';

interface CharacterStatsProps {
  character: ICharacter;
}

export function CharacterStats({ character }: CharacterStatsProps) {
  // Define skill-to-ability mappings
  const skillAbilities: Record<string, keyof typeof character.abilityScores> = {
    'Athletics': 'strength',
    'Acrobatics': 'dexterity',
    'Sleight of Hand': 'dexterity',
    'Stealth': 'dexterity',
    'Arcana': 'intelligence',
    'History': 'intelligence',
    'Investigation': 'intelligence',
    'Nature': 'intelligence',
    'Religion': 'intelligence',
    'Animal Handling': 'wisdom',
    'Insight': 'wisdom',
    'Medicine': 'wisdom',
    'Perception': 'wisdom',
    'Survival': 'wisdom',
    'Deception': 'charisma',
    'Intimidation': 'charisma',
    'Performance': 'charisma',
    'Persuasion': 'charisma',
  };

  const renderSkills = () => {
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
              const abilityKey = skillAbilities[skillName] || 'wisdom';
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
  };

  return (
    <div className="space-y-6">
      {/* Ability Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">STR</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.strength)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">DEX</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.dexterity)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">CON</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.constitution)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">INT</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.intelligence)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">WIS</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.wisdom)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">CHA</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.charisma)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saving Throws */}
      <Card>
        <CardHeader>
          <CardTitle>Saving Throws</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex justify-between">
              <span>STR</span>
              <span className="font-medium">
                {formatBonus(getSavingThrowBonus(character, 'strength', character.abilityScores.strength))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>DEX</span>
              <span className="font-medium">
                {formatBonus(getSavingThrowBonus(character, 'dexterity', character.abilityScores.dexterity))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CON</span>
              <span className="font-medium">
                {formatBonus(getSavingThrowBonus(character, 'constitution', character.abilityScores.constitution))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>INT</span>
              <span className="font-medium">
                {formatBonus(getSavingThrowBonus(character, 'intelligence', character.abilityScores.intelligence))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>WIS</span>
              <span className="font-medium">
                {formatBonus(getSavingThrowBonus(character, 'wisdom', character.abilityScores.wisdom))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CHA</span>
              <span className="font-medium">
                {formatBonus(getSavingThrowBonus(character, 'charisma', character.abilityScores.charisma))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {renderSkills()}
    </div>
  );
}