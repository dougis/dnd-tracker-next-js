'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import type { EncounterFilters as Filters, SortBy, SortOrder } from './types';

interface EncounterFiltersProps {
  filters: Filters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onFiltersChange: (_filters: Partial<Filters>) => void;
  onSearchChange: (_query: string) => void;
  onSortChange: (_sortBy: SortBy, _sortOrder: SortOrder) => void;
  onClearFilters: () => void;
}

export function EncounterFilters({
  filters,
  searchQuery,
  sortBy,
  sortOrder,
  onFiltersChange,
  onSearchChange,
  onSortChange,
  onClearFilters,
}: EncounterFiltersProps) {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  const difficultyOptions = [
    { value: 'trivial', label: 'Trivial' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'deadly', label: 'Deadly' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'participantCount', label: 'Participants' },
    { value: 'targetLevel', label: 'Target Level' },
  ];

  const hasActiveFilters =
    searchQuery ||
    filters.status.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.targetLevelMin !== undefined ||
    filters.targetLevelMax !== undefined ||
    filters.tags.length > 0;

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ status: newStatus });
  };

  const handleDifficultyChange = (difficulty: string) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    onFiltersChange({ difficulty: newDifficulty });
  };

  const handleSort = (newSortBy: SortBy) => {
    const newSortOrder = newSortBy === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
      {/* Search */}
      <div className="relative lg:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search encounters..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Status
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status.includes(option.value)}
                onCheckedChange={() => handleStatusChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Difficulty Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Difficulty
              {filters.difficulty.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.difficulty.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Difficulty</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {difficultyOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.difficulty.includes(option.value)}
                onCheckedChange={() => handleDifficultyChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSort(option.value as SortBy)}
                className="flex items-center justify-between"
              >
                {option.label}
                {sortBy === option.value && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}