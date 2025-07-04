import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlayIcon, PenIcon, CopyIcon, MoreHorizontalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Encounter } from '@/lib/validations/encounter';

interface EncounterActionsProps {
  encounter: Encounter;
  onEdit: () => void;
  onStartCombat: () => void;
  onClone: () => void;
}

/**
 * Primary action buttons for encounter management
 */
export function EncounterActions({ encounter, onEdit, onStartCombat, onClone }: EncounterActionsProps) {
  const [showStartCombatDialog, setShowStartCombatDialog] = useState(false);

  const handleStartCombat = () => {
    setShowStartCombatDialog(true);
  };

  const confirmStartCombat = () => {
    onStartCombat();
    setShowStartCombatDialog(false);
  };

  const canStartCombat = encounter.participants.length > 0 && encounter.status !== 'active';

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Primary Actions */}
        <Button
          onClick={handleStartCombat}
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

      {/* Start Combat Confirmation Dialog */}
      <Dialog open={showStartCombatDialog} onOpenChange={setShowStartCombatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Combat Session?</DialogTitle>
            <DialogDescription>
              This will initialize combat and roll initiative for all participants.
              {encounter.settings.autoRollInitiative && ' Initiative will be rolled automatically.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Participants:</strong> {encounter.participants.length}
              </p>
              <p className="text-sm">
                <strong>Auto-roll Initiative:</strong> {encounter.settings.autoRollInitiative ? 'Yes' : 'No'}
              </p>
              <p className="text-sm">
                <strong>Track Resources:</strong> {encounter.settings.trackResources ? 'Yes' : 'No'}
              </p>
              {encounter.settings.enableLairActions && (
                <p className="text-sm">
                  <strong>Lair Actions:</strong> Initiative {encounter.settings.lairActionInitiative || 20}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStartCombatDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmStartCombat}>
              Start Combat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}