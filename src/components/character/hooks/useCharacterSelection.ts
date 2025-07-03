import { useState } from 'react';
import type { ICharacter } from '@/lib/models/Character';

interface UseCharacterSelectionResult {
  selectedCharacters: Set<string>;
  handleSelectCharacter: (_characterId: string, _selected: boolean) => void;
  handleSelectAll: (_characters: ICharacter[], _selected: boolean) => void;
  clearSelection: () => void;
}

export function useCharacterSelection(): UseCharacterSelectionResult {
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());

  const handleSelectCharacter = (characterId: string, selected: boolean) => {
    const newSelected = new Set(selectedCharacters);
    if (selected) {
      newSelected.add(characterId);
    } else {
      newSelected.delete(characterId);
    }
    setSelectedCharacters(newSelected);
  };

  const handleSelectAll = (characters: ICharacter[], selected: boolean) => {
    if (selected) {
      setSelectedCharacters(new Set(characters.map(char => char._id.toString())));
    } else {
      setSelectedCharacters(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedCharacters(new Set());
  };

  return {
    selectedCharacters,
    handleSelectCharacter,
    handleSelectAll,
    clearSelection,
  };
}