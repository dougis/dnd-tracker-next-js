import type { IEncounter } from '@/lib/models/encounter/IEncounter';

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

export interface EncounterListItem extends Omit<IEncounter, '_id'> {
  id: string;
  participantCount: number;
  playerCount: number;
}

export interface EncounterCardProps {
  encounter: EncounterListItem;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onRefetch?: () => void;
}

export interface EncounterActionButtonsProps {
  encounter: EncounterListItem;
  onRefetch?: () => void;
}