import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

interface StartCombatDialogProps {
  open: boolean;
  encounter: IEncounter;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for starting combat
 */
export function StartCombatDialog({ open, encounter, onConfirm, onCancel }: StartCombatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Start Combat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}