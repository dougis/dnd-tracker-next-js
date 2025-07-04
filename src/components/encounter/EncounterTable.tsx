'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EncounterActionButtons } from './EncounterActionButtons';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { ArrowUpDown, ArrowUp, ArrowDown, Users, Target, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EncounterListItem, SortBy, SortOrder } from './types';

interface EncounterTableProps {
  encounters: EncounterListItem[];
  isLoading: boolean;
  selectedEncounters: string[];
  isAllSelected: boolean;
  onSelectAll: () => void;
  onSelectEncounter: (id: string) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (sortBy: SortBy, sortOrder: SortOrder) => void;
  onRefetch: () => void;
}

export function EncounterTable({
  encounters,
  isLoading,
  selectedEncounters,
  isAllSelected,
  onSelectAll,
  onSelectEncounter,
  sortBy,
  sortOrder,
  onSort,
  onRefetch,
}: EncounterTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial':
        return 'text-gray-500';
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-orange-600';
      case 'deadly':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const handleSort = (column: SortBy) => {
    const newSortOrder = column === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newSortOrder);
  };

  const getSortIcon = (column: SortBy) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const handleRowClick = (encounter: EncounterListItem, e: React.MouseEvent) => {
    // Prevent row click when clicking on checkbox or action buttons
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('[data-checkbox]') || e.target.closest('[data-actions]'))
    ) {
      return;
    }
    // TODO: Navigate to encounter detail view
    console.log('View encounter:', encounter.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingCard key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-medium mb-2">No encounters found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first encounter to get started organizing your combat sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left w-12">
                <div data-checkbox>
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                  />
                </div>
              </th>
              
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Name
                  {getSortIcon('name')}
                </Button>
              </th>
              
              <th className="p-4 text-left">Status</th>
              
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('difficulty')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Difficulty
                  {getSortIcon('difficulty')}
                </Button>
              </th>
              
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('participantCount')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Participants
                  {getSortIcon('participantCount')}
                </Button>
              </th>
              
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('targetLevel')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Level
                  {getSortIcon('targetLevel')}
                </Button>
              </th>
              
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('updatedAt')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Updated
                  {getSortIcon('updatedAt')}
                </Button>
              </th>
              
              <th className="p-4 text-left w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {encounters.map((encounter) => (
              <tr
                key={encounter.id}
                className="border-b hover:bg-muted/50 cursor-pointer group"
                onClick={(e) => handleRowClick(encounter, e)}
              >
                <td className="p-4">
                  <div data-checkbox>
                    <Checkbox
                      checked={selectedEncounters.includes(encounter.id)}
                      onCheckedChange={() => onSelectEncounter(encounter.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </td>
                
                <td className="p-4">
                  <div>
                    <div className="font-medium">{encounter.name}</div>
                    {encounter.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {encounter.description}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="p-4">
                  <Badge variant={getStatusVariant(encounter.status)}>
                    {encounter.status}
                  </Badge>
                </td>
                
                <td className="p-4">
                  <span className={`font-medium capitalize ${getDifficultyColor(encounter.difficulty)}`}>
                    {encounter.difficulty}
                  </span>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{encounter.participantCount}</span>
                    {encounter.playerCount > 0 && (
                      <span className="text-muted-foreground">
                        ({encounter.playerCount} players)
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{encounter.targetLevel}</span>
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(encounter.updatedAt), { addSuffix: true })}
                  </div>
                  {encounter.estimatedDuration && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{encounter.estimatedDuration}m</span>
                    </div>
                  )}
                </td>
                
                <td className="p-4">
                  <div data-actions className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <EncounterActionButtons
                      encounter={encounter}
                      onRefetch={onRefetch}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}