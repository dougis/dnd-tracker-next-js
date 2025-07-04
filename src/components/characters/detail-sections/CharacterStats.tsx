import React from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { AbilityScoresDisplay } from './AbilityScoresDisplay';
import { SavingThrowsDisplay } from './SavingThrowsDisplay';
import { SkillsDisplay } from './SkillsDisplay';

interface CharacterStatsProps {
  character: ICharacter;
}

export function CharacterStats({ character }: CharacterStatsProps) {
  return (
    <div className="space-y-6">
      <AbilityScoresDisplay character={character} />
      <SavingThrowsDisplay character={character} />
      <SkillsDisplay character={character} />
    </div>
  );
}