import React from 'react';
import { Input } from '@/components/ui/input';
import { CHARACTER_CLASSES, CHARACTER_RACES, SORT_OPTIONS, type SortOption } from './constants';

interface CharacterFiltersProps {
  searchTerm: string;
  classFilter: string;
  raceFilter: string;
  sortBy: SortOption;
  onSearchChange: (_value: string) => void;
  onClassFilterChange: (_value: string) => void;
  onRaceFilterChange: (_value: string) => void;
  onSortChange: (_value: SortOption) => void;
}

export function CharacterFilters({
  searchTerm,
  classFilter,
  raceFilter,
  sortBy,
  onSearchChange,
  onClassFilterChange,
  onRaceFilterChange,
  onSortChange,
}: CharacterFiltersProps) {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
      <Input
        placeholder="Search characters..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-64"
      />

      <select
        aria-label="Filter by class"
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={classFilter}
        onChange={(e) => onClassFilterChange(e.target.value)}
      >
        {CHARACTER_CLASSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by race"
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={raceFilter}
        onChange={(e) => onRaceFilterChange(e.target.value)}
      >
        {CHARACTER_RACES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort by"
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}