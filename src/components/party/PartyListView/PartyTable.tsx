'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PartyListItem, TableSortConfig, TableSelectionConfig } from '../types';

interface PartyTableProps {
  parties: PartyListItem[];
  isLoading: boolean;
  sortConfig: TableSortConfig;
  selectionConfig: TableSelectionConfig;
  onRefetch: () => void;
}

export function PartyTable({
  parties,
  isLoading,
  sortConfig,
  selectionConfig,
  onRefetch: _onRefetch,
}: PartyTableProps) {
  if (isLoading) {
    return <PartyTableSkeleton />;
  }

  const { selectedParties, isAllSelected, onSelectAll, onSelectParty } = selectionConfig;
  const { sortBy, sortOrder, onSort } = sortConfig;

  const handleSort = (field: any) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all parties"
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('memberCount')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Members
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('averageLevel')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Avg Level
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('lastActivity')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Last Activity
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((party) => (
            <TableRow key={party.id}>
              <TableCell>
                <Checkbox
                  checked={selectedParties.includes(party.id)}
                  onCheckedChange={() => onSelectParty(party.id)}
                  aria-label={`Select ${party.name}`}
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{party.name}</div>
                  {party.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {party.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-center">
                  <div className="font-medium">{party.memberCount}</div>
                  <div className="text-xs text-muted-foreground">
                    {party.playerCharacterCount} PCs
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-center font-medium">
                  {party.averageLevel > 0 ? party.averageLevel : '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {party.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {party.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{party.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(party.lastActivity, { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PartyTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead className="w-24">
              <Skeleton className="h-4 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}