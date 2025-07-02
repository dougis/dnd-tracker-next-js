/**
 * Constants for character list view components
 */

export const CHARACTER_CLASSES = [
  { value: '', label: 'All Classes' },
  { value: 'artificer', label: 'Artificer' },
  { value: 'barbarian', label: 'Barbarian' },
  { value: 'bard', label: 'Bard' },
  { value: 'cleric', label: 'Cleric' },
  { value: 'druid', label: 'Druid' },
  { value: 'fighter', label: 'Fighter' },
  { value: 'monk', label: 'Monk' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'ranger', label: 'Ranger' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'sorcerer', label: 'Sorcerer' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'wizard', label: 'Wizard' },
] as const;

export const CHARACTER_RACES = [
  { value: '', label: 'All Races' },
  { value: 'dragonborn', label: 'Dragonborn' },
  { value: 'dwarf', label: 'Dwarf' },
  { value: 'elf', label: 'Elf' },
  { value: 'gnome', label: 'Gnome' },
  { value: 'half-elf', label: 'Half-Elf' },
  { value: 'halfling', label: 'Halfling' },
  { value: 'half-orc', label: 'Half-Orc' },
  { value: 'human', label: 'Human' },
  { value: 'tiefling', label: 'Tiefling' },
] as const;

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'level-asc', label: 'Level Low-High' },
  { value: 'level-desc', label: 'Level High-Low' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'date-desc', label: 'Newest First' },
] as const;

export const DEFAULT_PAGE_SIZE = 12;

export type SortOption = 'name-asc' | 'name-desc' | 'level-asc' | 'level-desc' | 'date-asc' | 'date-desc';
export type ViewMode = 'grid' | 'table';