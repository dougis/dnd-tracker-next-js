import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortBy, SortOrder } from '../types';

interface TableHeaderProps {
  isAllSelected: boolean;
  onSelectAll: () => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (_column: SortBy) => void;
}

const getSortIcon = (column: SortBy, sortBy: SortBy, sortOrder: SortOrder) => {
  if (sortBy !== column) {
    return <ArrowUpDown className="h-4 w-4" />;
  }
  return sortOrder === 'asc' ?
    <ArrowUp className="h-4 w-4" /> :
    <ArrowDown className="h-4 w-4" />;
};

const SortableHeader = ({
  column,
  children,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: SortBy;
  children: React.ReactNode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (_column: SortBy) => void;
}) => (
  <Button
    variant="ghost"
    onClick={() => onSort(column)}
    className="h-auto p-0 font-semibold hover:bg-transparent"
  >
    {children}
    {getSortIcon(column, sortBy, sortOrder)}
  </Button>
);

export function TableHeader({
  isAllSelected,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}: TableHeaderProps) {
  return (
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
          <SortableHeader column="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            Name
          </SortableHeader>
        </th>

        <th className="p-4 text-left">Status</th>

        <th className="p-4 text-left">
          <SortableHeader column="difficulty" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            Difficulty
          </SortableHeader>
        </th>

        <th className="p-4 text-left">
          <SortableHeader column="participantCount" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            Participants
          </SortableHeader>
        </th>

        <th className="p-4 text-left">
          <SortableHeader column="targetLevel" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            Level
          </SortableHeader>
        </th>

        <th className="p-4 text-left">
          <SortableHeader column="updatedAt" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
            Updated
          </SortableHeader>
        </th>

        <th className="p-4 text-left w-12">Actions</th>
      </tr>
    </thead>
  );
}