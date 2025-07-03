import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, SwordIcon, ActivityIcon } from './icons';

interface QuickActionsProps {
  onCreateCharacter: () => void;
  onCreateEncounter: () => void;
  onStartCombat: () => void;
}

export function QuickActions({
  onCreateCharacter,
  onCreateEncounter,
  onStartCombat
}: QuickActionsProps) {
  return (
    <Card data-testid="quick-actions">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onCreateCharacter}
          className="w-full justify-start"
          variant="outline"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Create Character
        </Button>

        <Button
          onClick={onCreateEncounter}
          className="w-full justify-start"
          variant="outline"
        >
          <SwordIcon className="mr-2 h-4 w-4" />
          Create Encounter
        </Button>

        <Button
          onClick={onStartCombat}
          className="w-full justify-start"
        >
          <ActivityIcon className="mr-2 h-4 w-4" />
          Start Combat
        </Button>
      </CardContent>
    </Card>
  );
}