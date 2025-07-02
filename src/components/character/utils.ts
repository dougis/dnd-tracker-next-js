import type { ICharacter } from '@/lib/models/Character';
import type { SortOption } from './constants';

/**
 * Utility functions for character list view
 */

export const formatCharacterClass = (character: ICharacter): string => {
  const mainClass = character.classes[0];
  return `${character.race.charAt(0).toUpperCase()}${character.race.slice(1)} ${mainClass.class.charAt(0).toUpperCase()}${mainClass.class.slice(1)}`;
};

export const formatHitPoints = (character: ICharacter): string => {
  const { current, maximum, temporary } = character.hitPoints;
  return temporary > 0 ? `${current + temporary}/${maximum}` : `${current}/${maximum}`;
};

export const sortCharacters = (characters: ICharacter[], sortBy: SortOption): ICharacter[] => {
  return [...characters].sort((a: ICharacter, b: ICharacter) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'level-asc':
        return a.level - b.level;
      case 'level-desc':
        return b.level - a.level;
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
};

export const filterCharacters = (
  characters: ICharacter[],
  searchTerm: string,
  classFilter: string,
  raceFilter: string
): ICharacter[] => {
  let filtered = characters;

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter((char: ICharacter) =>
      char.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply class filter
  if (classFilter) {
    filtered = filtered.filter((char: ICharacter) =>
      char.classes.some((cls: any) => cls.class === classFilter)
    );
  }

  // Apply race filter
  if (raceFilter) {
    filtered = filtered.filter((char: ICharacter) => char.race === raceFilter);
  }

  return filtered;
};