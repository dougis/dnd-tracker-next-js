import { shouldPreventRowClick } from './tableUtils';
import {
  SelectionCell,
  NameCell,
  StatusCell,
  DifficultyCell,
  ParticipantsCell,
  TargetLevelCell,
  UpdatedCell,
  ActionsCell,
} from './TableCells';
import type { EncounterListItem } from '../types';

interface TableRowProps {
  encounter: EncounterListItem;
  isSelected: boolean;
  onSelect: (_id: string) => void;
  onRefetch: () => void;
}

export function TableRow({
  encounter,
  isSelected,
  onSelect,
  onRefetch,
}: TableRowProps) {
  const handleRowClick = (e: React.MouseEvent) => {
    if (shouldPreventRowClick(e.target)) {
      return;
    }
    // TODO: Navigate to encounter detail view
    console.log('View encounter:', encounter.id);
  };

  return (
    <tr
      className="border-b hover:bg-muted/50 cursor-pointer group"
      onClick={handleRowClick}
    >
      <SelectionCell encounter={encounter} isSelected={isSelected} onSelect={onSelect} />
      <NameCell encounter={encounter} />
      <StatusCell encounter={encounter} />
      <DifficultyCell encounter={encounter} />
      <ParticipantsCell encounter={encounter} />
      <TargetLevelCell encounter={encounter} />
      <UpdatedCell encounter={encounter} />
      <ActionsCell encounter={encounter} onRefetch={onRefetch} />
    </tr>
  );
}