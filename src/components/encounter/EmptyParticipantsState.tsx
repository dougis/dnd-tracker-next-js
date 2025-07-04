'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

interface EmptyParticipantsStateProps {
  renderAddDialog: () => React.ReactNode;
  renderImportDialog: () => React.ReactNode;
}

export function EmptyParticipantsState({
  renderAddDialog,
  renderImportDialog,
}: EmptyParticipantsStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounter Participants</CardTitle>
        <CardDescription>
          Add characters and NPCs to your encounter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">No participants added yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first character or NPC
          </p>
          <div className="mt-6 space-x-2">
            {renderAddDialog()}
            {renderImportDialog()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}