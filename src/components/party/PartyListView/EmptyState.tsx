'use client';

import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  onCreateParty?: () => void;
}

export function EmptyState({ onCreateParty }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No parties found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You haven&apos;t created any parties yet. Create your first party to start organizing your D&D adventures.
        </p>
        {onCreateParty && (
          <Button onClick={onCreateParty}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Party
          </Button>
        )}
      </CardContent>
    </Card>
  );
}