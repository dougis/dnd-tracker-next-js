'use client';

import { Button } from '@/components/ui/button';
import { SortAsc, SortDesc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { SortBy, SortOrder } from '../types';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  options: SortOption[];
  onSortChange: (_sortBy: SortBy, _sortOrder: SortOrder) => void;
}

export function SortDropdown({
  sortBy,
  sortOrder,
  options,
  onSortChange,
}: SortDropdownProps) {
  const handleSort = (newSortBy: SortBy) => {
    const newSortOrder = newSortBy === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newSortOrder);
  };

  return (
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
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSort(option.value as SortBy)}
            className="flex items-center justify-between"
          >
            {option.label}
            {sortBy === option.value && (
              sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}