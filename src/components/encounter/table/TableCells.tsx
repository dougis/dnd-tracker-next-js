import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EncounterActionButtons } from '../EncounterActionButtons';
import { getStatusVariant, getDifficultyColor } from './tableUtils';
import type { EncounterListItem } from '../types';

interface TableCellProps {
  encounter: EncounterListItem;
  isSelected?: boolean;
  onSelect?: (_id: string) => void;
  onRefetch?: () => void;
}

export function SelectionCell({ encounter, isSelected, onSelect }: TableCellProps) {
  return (
    <td className="p-4">
      <div data-checkbox>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect?.(encounter.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </td>
  );
}

export function NameCell({ encounter }: TableCellProps) {
  return (
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
  );
}

export function StatusCell({ encounter }: TableCellProps) {
  return (
    <td className="p-4">
      <Badge variant={getStatusVariant(encounter.status)}>
        {encounter.status}
      </Badge>
    </td>
  );
}

export function DifficultyCell({ encounter }: TableCellProps) {
  return (
    <td className="p-4">
      <span className={`font-medium capitalize ${encounter.difficulty ? getDifficultyColor(encounter.difficulty) : ''}`}>
        {encounter.difficulty || 'N/A'}
      </span>
    </td>
  );
}

export function ParticipantsCell({ encounter }: TableCellProps) {
  return (
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
  );
}

export function TargetLevelCell({ encounter }: TableCellProps) {
  return (
    <td className="p-4">
      <div className="flex items-center space-x-1">
        <Target className="h-4 w-4 text-muted-foreground" />
        <span>{encounter.targetLevel}</span>
      </div>
    </td>
  );
}

export function UpdatedCell({ encounter }: TableCellProps) {
  return (
    <td className="p-4">
      <div className="text-sm text-muted-foreground">
        {formatDistanceToNow(encounter.updatedAt, { addSuffix: true })}
      </div>
      {encounter.estimatedDuration && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{encounter.estimatedDuration}m</span>
        </div>
      )}
    </td>
  );
}

export function ActionsCell({ encounter, onRefetch }: TableCellProps) {
  return (
    <td className="p-4">
      <div data-actions className="opacity-0 group-hover:opacity-100 transition-opacity">
        <EncounterActionButtons
          encounter={encounter}
          onRefetch={onRefetch}
        />
      </div>
    </td>
  );
}