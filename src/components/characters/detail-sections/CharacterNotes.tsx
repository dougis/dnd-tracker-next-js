import React from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CharacterNotesProps {
  character: ICharacter;
}

export function CharacterNotes({ character }: CharacterNotesProps) {
  const hasNotes = character.notes || character.backstory;

  if (!hasNotes) {
    return <p className="text-muted-foreground">No notes or backstory recorded.</p>;
  }

  return (
    <div className="space-y-6">
      {character.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{character.notes}</div>
          </CardContent>
        </Card>
      )}

      {character.backstory && (
        <Card>
          <CardHeader>
            <CardTitle>Backstory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{character.backstory}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}