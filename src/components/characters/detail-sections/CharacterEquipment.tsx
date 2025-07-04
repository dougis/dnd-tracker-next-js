import React from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CharacterEquipmentProps {
  character: ICharacter;
}

export function CharacterEquipment({ character }: CharacterEquipmentProps) {
  if (!character.equipment || character.equipment.length === 0) {
    return <p className="text-muted-foreground">No equipment listed.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {character.equipment.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant={item.equipped ? 'default' : 'secondary'}>
                      {item.equipped ? 'Equipped' : 'Not Equipped'}
                    </Badge>
                    {item.magical && <Badge variant="outline">Magical</Badge>}
                  </div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.weight} lbs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}