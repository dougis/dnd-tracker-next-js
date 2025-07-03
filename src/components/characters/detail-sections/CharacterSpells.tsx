import React from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrdinalSuffix } from './character-utils';

interface CharacterSpellsProps {
  character: ICharacter;
}


export function CharacterSpells({ character }: CharacterSpellsProps) {
  if (!character.spells || character.spells.length === 0) {
    return <p className="text-muted-foreground">No spells known.</p>;
  }

  const spellsByLevel = character.spells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, typeof character.spells>);

  return (
    <div className="space-y-6">
      {Object.entries(spellsByLevel)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([level, spells]) => (
          <Card key={level}>
            <CardHeader>
              <CardTitle>
                {level === '0' ? 'Cantrips' : `${level}${getOrdinalSuffix(parseInt(level))} Level`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {spells.map((spell, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-muted rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{spell.name}</h4>
                        <Badge variant={spell.isPrepared ? 'default' : 'secondary'}>
                          {spell.isPrepared ? 'Prepared' : 'Known'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {spell.school} • {spell.components} • {spell.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}