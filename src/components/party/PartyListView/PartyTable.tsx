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

// Utility function to handle sort logic
function handleSortLogic(field: any, sortBy: any, sortOrder: any, onSort: any) {
  if (sortBy === field) {
    onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    onSort(field, 'asc');
  }
}

// Sortable header component
function SortableHeader({ field, sortBy, sortOrder, onSort, children }: {
  field: string;
  sortBy: any;
  sortOrder: any;
  onSort: any;
  children: React.ReactNode;
}) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSortLogic(field, sortBy, sortOrder, onSort)}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );
}

// Table header component
function PartyTableHeader({ sortConfig, selectionConfig }: {
  sortConfig: TableSortConfig;
  selectionConfig: TableSelectionConfig;
}) {
  const { sortBy, sortOrder, onSort } = sortConfig;
  const { isAllSelected, onSelectAll } = selectionConfig;

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all parties"
          />
        </TableHead>
        <SortableHeader field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
          Name
        </SortableHeader>
        <SortableHeader field="memberCount" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
          Members
        </SortableHeader>
        <SortableHeader field="averageLevel" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
          Avg Level
        </SortableHeader>
        <TableHead>Tags</TableHead>
        <SortableHeader field="lastActivity" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
          Last Activity
        </SortableHeader>
        <TableHead className="w-24">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

// Party name cell component
function PartyNameCell({ party }: { party: PartyListItem }) {
  return (
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
  );
}

// Member count cell component
function MemberCountCell({ party }: { party: PartyListItem }) {
  return (
    <TableCell>
      <div className="text-center">
        <div className="font-medium">{party.memberCount}</div>
        <div className="text-xs text-muted-foreground">
          {party.playerCharacterCount} PCs
        </div>
      </div>
    </TableCell>
  );
}

// Tags cell component
function TagsCell({ tags }: { tags: string[] }) {
  return (
    <TableCell>
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{tags.length - 2}
          </Badge>
        )}
      </div>
    </TableCell>
  );
}

// Party row component
function PartyRow({ party, selectionConfig }: {
  party: PartyListItem;
  selectionConfig: TableSelectionConfig;
}) {
  const { selectedParties, onSelectParty } = selectionConfig;

  return (
    <TableRow key={party.id}>
      <TableCell>
        <Checkbox
          checked={selectedParties.includes(party.id)}
          onCheckedChange={() => onSelectParty(party.id)}
          aria-label={`Select ${party.name}`}
        />
      </TableCell>
      <PartyNameCell party={party} />
      <MemberCountCell party={party} />
      <TableCell>
        <div className="text-center font-medium">
          {party.averageLevel > 0 ? party.averageLevel : '-'}
        </div>
      </TableCell>
      <TagsCell tags={party.tags} />
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
  );
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

  return (
    <div className="rounded-md border">
      <Table>
        <PartyTableHeader sortConfig={sortConfig} selectionConfig={selectionConfig} />
        <TableBody>
          {parties.map((party) => (
            <PartyRow key={party.id} party={party} selectionConfig={selectionConfig} />
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