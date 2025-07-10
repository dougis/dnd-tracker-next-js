'use client';

import { Trash2, X, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRefetch: () => void;
}

export function BatchActions({ selectedCount, onClearSelection, onRefetch }: BatchActionsProps) {
  const handleBulkDelete = () => {
    // TODO: Implement bulk delete functionality
    console.log('Bulk delete selected parties');
    onRefetch();
  };

  const handleBulkEdit = () => {
    // TODO: Implement bulk edit functionality
    console.log('Bulk edit selected parties');
  };

  const handleBulkView = () => {
    // TODO: Implement bulk view functionality
    console.log('Bulk view selected parties');
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {selectedCount} {selectedCount === 1 ? 'party' : 'parties'} selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkView}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkEdit}>
                <Settings className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}