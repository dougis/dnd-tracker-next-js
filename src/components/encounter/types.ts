import type { IEncounter } from '@/lib/models/encounter/interfaces';
import { Types } from 'mongoose';

export interface EncounterFilters {
  status: string[];
  difficulty: string[];
  targetLevelMin?: number;
  targetLevelMax?: number;
  tags: string[];
}

export type SortBy =
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'difficulty'
  | 'participantCount'
  | 'targetLevel';

export type SortOrder = 'asc' | 'desc';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface EncounterListItem {
  id: string;
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  tags: string[];
  difficulty?: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  estimatedDuration?: number;
  targetLevel?: number;
  participants: IEncounter['participants'];
  settings: IEncounter['settings'];
  combatState: IEncounter['combatState'];
  status: IEncounter['status'];
  partyId?: Types.ObjectId;
  isPublic: boolean;
  sharedWith: Types.ObjectId[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  participantCount: number;
  playerCount: number;
}

export interface EncounterCardProps {
  encounter: EncounterListItem;
  isSelected?: boolean;
  onSelect?: (_id: string) => void;
  onRefetch?: () => void;
}

export interface EncounterActionButtonsProps {
  encounter: EncounterListItem;
  onRefetch?: () => void;
}

export interface SortConfig {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface FilterCallbacks {
  onFiltersChange: (_filters: Partial<EncounterFilters>) => void;
  onSearchChange: (_query: string) => void;
  onSortChange: (_sortBy: SortBy, _sortOrder: SortOrder) => void;
  onClearFilters: () => void;
}

export interface TableSortConfig {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (_sortBy: SortBy, _sortOrder: SortOrder) => void;
}

export interface TableSelectionConfig {
  selectedEncounters: string[];
  isAllSelected: boolean;
  onSelectAll: () => void;
  onSelectEncounter: (_id: string) => void;
}