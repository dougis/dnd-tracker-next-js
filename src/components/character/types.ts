import type { ICharacter } from '@/lib/models/Character';

export interface CharacterActions {
  onCharacterEdit?: (_character: ICharacter) => void;
  onCharacterDelete?: (_character: ICharacter) => void;
  onCharacterDuplicate?: (_character: ICharacter) => void;
  onCharacterSelect?: (_character: ICharacter) => void;
}

export interface SelectionProps {
  selectedCharacters: Set<string>;
  onSelectCharacter: (_characterId: string, _selected: boolean) => void;
}

export interface CharacterDisplayProps extends CharacterActions, SelectionProps {
  characters: ICharacter[];
}

export interface CharacterTableProps extends CharacterDisplayProps {
  onSelectAll: (_selected: boolean) => void;
}