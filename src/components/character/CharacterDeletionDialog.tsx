import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, AlertTriangle, Undo2, CheckCircle } from 'lucide-react';
import { CharacterService } from '@/lib/services/CharacterService';

// Custom hook to reduce complexity
function useUndoCountdown(undoInfo: { token: string; expiresAt: number } | null) {
  const [undoCountdown, setUndoCountdown] = useState(0);

  useEffect(() => {
    if (!undoInfo) return;

    const remainingTime = Math.max(0, Math.floor((undoInfo.expiresAt - Date.now()) / 1000));
    setUndoCountdown(remainingTime);

    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setUndoCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [undoInfo, undoCountdown]);

  return undoCountdown;
}

interface CharacterDeletionDialogProps {
  character: {
    id: string;
    name: string;
    userId: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  allowUndo?: boolean;
}

export function CharacterDeletionDialog({
  character,
  isOpen,
  onClose,
  onDeleted,
  allowUndo = false
}: CharacterDeletionDialogProps) {
  const [confirmationName, setConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoInfo, setUndoInfo] = useState<{ token: string; expiresAt: number } | null>(null);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isConfirmationValid = confirmationName === character.name;
  const undoCountdown = useUndoCountdown(undoInfo);

  useEffect(() => {
    if (undoInfo) {
      setShowUndoNotification(true);
    } else {
      setShowUndoNotification(false);
    }
  }, [undoInfo]);

  useEffect(() => {
    if (undoCountdown === 0 && undoInfo) {
      setUndoInfo(null);
    }
  }, [undoCountdown, undoInfo]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const result = allowUndo
        ? await CharacterService.deleteCharacterWithUndo(character.id, character.userId)
        : await CharacterService.deleteCharacter(character.id, character.userId);

      if (result.success) {
        if (allowUndo && result.data?.undoToken) {
          setUndoInfo({
            token: result.data.undoToken,
            expiresAt: result.data.expiresAt
          });
        } else {
          onDeleted();
          onClose();
        }
      } else {
        setError(result.error?.message || 'Failed to delete character');
      }
    } catch {
      setError('Failed to delete character');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUndo = async () => {
    if (!undoInfo) return;

    try {
      setIsRestoring(true);
      const result = await CharacterService.restoreCharacter(undoInfo.token);

      if (result.success) {
        setUndoInfo(null);
        setShowUndoNotification(false);
        setConfirmationName('');
        onClose();
      } else {
        setError(result.error?.message || 'Failed to restore character');
      }
    } catch {
      setError('Failed to restore character');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && !isRestoring) {
      setConfirmationName('');
      setError(null);
      onClose();
    }
  };

  // Show undo notification if character was deleted with undo option
  if (showUndoNotification && undoInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent data-testid="undo-notification">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Character Deleted
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Character deleted successfully</p>
            <Alert>
              <AlertDescription>
                <div data-testid="undo-countdown" className="mb-3">
                  Undo available for {undoCountdown} seconds
                </div>
                <Button
                  data-testid="undo-delete-button"
                  onClick={handleUndo}
                  disabled={isRestoring || undoCountdown === 0}
                  className="flex items-center gap-2"
                >
                  {isRestoring ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Undo2 className="h-4 w-4" />
                  )}
                  Undo Deletion
                </Button>
              </AlertDescription>
            </Alert>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="character-deletion-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Character
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div data-testid="deletion-warning" className="bg-red-50 border border-red-200 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Warning: Permanent Deletion</h4>
                <p className="text-red-700 text-sm mt-1">
                  Are you sure you want to delete &quot;{character.name}&quot;?
                  {!allowUndo && ' This action cannot be undone.'}
                  {allowUndo && ' You will have 30 seconds to undo this action.'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="character-name-confirmation" className="block text-sm font-medium mb-2">
              Type the character name to confirm deletion:
            </label>
            <Input
              id="character-name-confirmation"
              data-testid="character-name-confirmation"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder={character.name}
              disabled={isDeleting}
            />
            {confirmationName && !isConfirmationValid && (
              <p className="text-red-600 text-sm mt-1">
                Character name does not match
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" data-testid="deletion-error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-testid="cancel-delete-button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            data-testid="confirm-delete-button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 data-testid="deletion-loading" className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Character
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}