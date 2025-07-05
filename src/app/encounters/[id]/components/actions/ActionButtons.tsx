import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlayIcon, PenIcon, CopyIcon, MoreHorizontalIcon } from 'lucide-react';

interface ActionButtonsProps {
  canStartCombat: boolean;
  onStartCombat: () => void;
  onEdit: () => void;
  onClone: () => void;
}

/**
 * Primary and secondary action buttons
 */
export function ActionButtons({ canStartCombat, onStartCombat, onEdit, onClone }: ActionButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Primary Actions */}
      <Button
        onClick={onStartCombat}
        disabled={!canStartCombat}
        className="bg-green-600 hover:bg-green-700"
      >
        <PlayIcon className="h-4 w-4 mr-2" />
        Start Combat
      </Button>

      <Button variant="outline" onClick={onEdit}>
        <PenIcon className="h-4 w-4 mr-2" />
        Edit Encounter
      </Button>

      {/* Secondary Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onClone}>
            <CopyIcon className="h-4 w-4 mr-2" />
            Clone Encounter
          </DropdownMenuItem>
          <DropdownMenuItem>
            Export to PDF
          </DropdownMenuItem>
          <DropdownMenuItem>
            Print Summary
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Delete Encounter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}