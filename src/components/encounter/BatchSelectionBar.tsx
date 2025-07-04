'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BatchSelectionBarProps {
  selectedCount: number;
  onBatchRemove: () => void;
}

const RemoveSelectedDialog = ({ selectedCount, onBatchRemove }: { selectedCount: number; onBatchRemove: () => void }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" size="sm">Remove Selected</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove Selected Participants</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to remove {selectedCount} selected participants? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onBatchRemove}>Remove</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export function BatchSelectionBar({
  selectedCount,
  onBatchRemove,
}: BatchSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{selectedCount} participants selected</span>
      <RemoveSelectedDialog selectedCount={selectedCount} onBatchRemove={onBatchRemove} />
    </div>
  );
}