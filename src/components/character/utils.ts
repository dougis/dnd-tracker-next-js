import type { ICharacter } from '@/lib/models/Character';
import type { SortOption } from './constants';

/**
 * Utility functions for character list view
 */

const capitalizeFirst = (text: string): string => {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

export const formatCharacterClass = (character: ICharacter): string => {
  const mainClass = character.classes[0];
  return `${capitalizeFirst(character.race)} ${capitalizeFirst(mainClass.class)}`;
};

export const formatHitPoints = (character: ICharacter): string => {
  const { current, maximum, temporary } = character.hitPoints;
  return temporary > 0 ? `${current + temporary}/${maximum}` : `${current}/${maximum}`;
};

const compareByName = (a: ICharacter, b: ICharacter, ascending: boolean): number => {
  const result = a.name.localeCompare(b.name);
  return ascending ? result : -result;
};

const compareByLevel = (a: ICharacter, b: ICharacter, ascending: boolean): number => {
  const result = a.level - b.level;
  return ascending ? result : -result;
};

const compareByDate = (a: ICharacter, b: ICharacter, ascending: boolean): number => {
  const result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return ascending ? result : -result;
};

export const sortCharacters = (characters: ICharacter[], sortBy: SortOption): ICharacter[] => {
  return [...characters].sort((a: ICharacter, b: ICharacter) => {
    if (sortBy.startsWith('name')) return compareByName(a, b, sortBy === 'name-asc');
    if (sortBy.startsWith('level')) return compareByLevel(a, b, sortBy === 'level-asc');
    if (sortBy.startsWith('date')) return compareByDate(a, b, sortBy === 'date-asc');
    return 0;
  });
};

const filterBySearch = (characters: ICharacter[], searchTerm: string): ICharacter[] => {
  if (!searchTerm) return characters;
  return characters.filter((char: ICharacter) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const filterByClass = (characters: ICharacter[], classFilter: string): ICharacter[] => {
  if (!classFilter) return characters;
  return characters.filter((char: ICharacter) =>
    char.classes.some((cls: any) => cls.class === classFilter)
  );
};

const filterByRace = (characters: ICharacter[], raceFilter: string): ICharacter[] => {
  if (!raceFilter) return characters;
  return characters.filter((char: ICharacter) => char.race === raceFilter);
};

export const filterCharacters = (
  characters: ICharacter[],
  searchTerm: string,
  classFilter: string,
  raceFilter: string
): ICharacter[] => {
  let filtered = filterBySearch(characters, searchTerm);
  filtered = filterByClass(filtered, classFilter);
  return filterByRace(filtered, raceFilter);
};