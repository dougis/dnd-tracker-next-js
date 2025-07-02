import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface CharacterSelectionCheckboxProps {
  characterId: string;
  isSelected: boolean;
  onSelectCharacter: (_characterId: string, _selected: boolean) => void;
}

export function CharacterSelectionCheckbox({
  characterId,
  isSelected,
  onSelectCharacter,
}: CharacterSelectionCheckboxProps) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={(checked) =>
        onSelectCharacter(characterId, checked as boolean)
      }
      onClick={(e) => e.stopPropagation()}
    />
  );
}