import { useState, useMemo } from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { filterCharacters, sortCharacters } from '../utils';
import type { SortOption } from '../constants';

interface UseCharacterFiltersResult {
  searchTerm: string;
  classFilter: string;
  raceFilter: string;
  sortBy: SortOption;
  setSearchTerm: (_term: string) => void;
  setClassFilter: (_filter: string) => void;
  setRaceFilter: (_filter: string) => void;
  setSortBy: (_sort: SortOption) => void;
  processedCharacters: ICharacter[];
}

export function useCharacterFilters(characters: ICharacter[]): UseCharacterFiltersResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [raceFilter, setRaceFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const processedCharacters = useMemo(() => {
    if (!characters) return [];

    const filtered = filterCharacters(characters, searchTerm, classFilter, raceFilter);
    return sortCharacters(filtered, sortBy);
  }, [characters, searchTerm, classFilter, raceFilter, sortBy]);

  return {
    searchTerm,
    classFilter,
    raceFilter,
    sortBy,
    setSearchTerm,
    setClassFilter,
    setRaceFilter,
    setSortBy,
    processedCharacters,
  };
}