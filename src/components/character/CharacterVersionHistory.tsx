import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import { CharacterService } from '@/lib/services/CharacterService';

interface CharacterVersionHistoryProps {
  characterId: string;
  userId: string;
}


interface CharacterVersion {
  id: string;
  timestamp: Date;
  changes: Record<string, { from: any; to: any }>;
  changeDescription: string;
  userId: string;
}

export function CharacterVersionHistory({ characterId, userId }: CharacterVersionHistoryProps) {
  const [versions, setVersions] = useState<CharacterVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revertingVersion, setRevertingVersion] = useState<string | null>(null);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<CharacterVersion | null>(null);

  const loadVersionHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CharacterService.getCharacterVersionHistory(characterId, userId);
      if (!result.success) {
        setError(result.error?.message || 'Failed to load version history');
        return;
      }

      setVersions(result.data || []);
    } catch {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [characterId, userId]);

  useEffect(() => {
    loadVersionHistory();
  }, [loadVersionHistory]);

  const handleRevertClick = (version: CharacterVersion) => {
    setSelectedVersion(version);
    setShowRevertDialog(true);
  };

  const handleConfirmRevert = async () => {
    if (!selectedVersion) return;

    try {
      setRevertingVersion(selectedVersion.id);
      const result = await CharacterService.revertCharacterToVersion(
        characterId,
        userId,
        selectedVersion.id
      );

      if (result.success) {
        // Reload version history to reflect the revert
        await loadVersionHistory();
        setShowRevertDialog(false);
        setSelectedVersion(null);
      } else {
        setError(result.error?.message || 'Failed to revert character');
      }
    } catch {
      setError('Failed to revert character');
    } finally {
      setRevertingVersion(null);
    }
  };

  const formatChangeDetail = (field: string, change: { from: any; to: any }) => {
    const formatValue = (value: any) => {
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return String(value);
    };

    return `${field}: ${formatValue(change.from)} → ${formatValue(change.to)}`;
  };

  if (loading) {
    return (
      <div data-testid="version-history-loading" className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" data-testid="version-history-error">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (versions.length === 0) {
    return (
      <div data-testid="version-history-empty" className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No version history available</p>
      </div>
    );
  }

  return (
    <div data-testid="version-history" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Version History</h2>
        <Badge variant="secondary">{versions.length} versions</Badge>
      </div>

      <div className="space-y-4">
        {versions.map((version) => (
          <Card key={version.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{version.changeDescription}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {new Date(version.timestamp).toLocaleString()}
                  </Badge>
                  <Button
                    data-testid={`revert-button-${version.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertClick(version)}
                    disabled={revertingVersion === version.id}
                    className="flex items-center gap-1"
                  >
                    {revertingVersion === version.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Revert
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                {Object.entries(version.changes).map(([field, change]) => (
                  <div key={field} className="font-mono">
                    {formatChangeDetail(field, change)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revert Confirmation Dialog */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent data-testid="revert-confirmation-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Revert Character
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Are you sure you want to revert to this version? This will restore the character to:
            </p>
            {selectedVersion && (
              <div className="bg-muted p-3 rounded">
                <p className="font-medium">{selectedVersion.changeDescription}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedVersion.timestamp).toLocaleString()}
                </p>
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              This action cannot be undone and will create a new version entry.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevertDialog(false)}
              disabled={revertingVersion !== null}
            >
              Cancel
            </Button>
            <Button
              data-testid="confirm-revert-button"
              onClick={handleConfirmRevert}
              disabled={revertingVersion !== null}
              className="flex items-center gap-2"
            >
              {revertingVersion ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Confirm Revert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}