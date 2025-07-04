import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortBy, SortOrder } from '../types';
import { TABLE_HEADERS, CELL_CLASSES } from './headerUtils';

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
        <th className={CELL_CLASSES.checkbox}>
          <div data-checkbox>
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
            />
          </div>
        </th>

        {TABLE_HEADERS.map(({ column, label, sortable }) => (
          <th key={column} className={CELL_CLASSES.default}>
            {sortable ? (
              <SortableHeader column={column} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                {label}
              </SortableHeader>
            ) : (
              label
            )}
          </th>
        ))}

        <th className={CELL_CLASSES.actions}>Actions</th>
      </tr>
    </thead>
  );
}