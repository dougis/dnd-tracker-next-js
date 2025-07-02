import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Edit, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CharacterUpdate } from '@/lib/validations/character';

interface CharacterEditingHeaderProps {
  characterName: string;
  editMode: boolean;
  saving: boolean;
  saveSuccess: boolean;
  autosaving: boolean;
  autosaveSuccess: boolean;
  showDraftIndicator: boolean;
  draftChanges: CharacterUpdate | null;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
}

export function CharacterEditingHeader({
  characterName,
  editMode,
  saving,
  saveSuccess,
  autosaving,
  autosaveSuccess,
  showDraftIndicator,
  draftChanges,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onRestoreDraft,
  onDiscardDraft,
}: CharacterEditingHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Character Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{characterName}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                data-testid="save-stats-button"
                onClick={onSaveClick}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button
                data-testid="cancel-stats-button"
                onClick={onCancelClick}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              data-testid="edit-stats-button"
              onClick={onEditClick}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <Alert data-testid="save-success-message" className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Character updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Draft Changes Indicator */}
      {showDraftIndicator && draftChanges && (
        <Alert data-testid="draft-indicator" className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-800 flex items-center justify-between">
            <span>You have unsaved draft changes</span>
            <div className="flex gap-2">
              <Button
                data-testid="restore-draft-button"
                size="sm"
                variant="outline"
                onClick={onRestoreDraft}
                className="text-orange-800 border-orange-300 hover:bg-orange-100"
              >
                Restore
              </Button>
              <Button
                data-testid="discard-draft-button"
                size="sm"
                variant="outline"
                onClick={onDiscardDraft}
                className="text-orange-800 border-orange-300 hover:bg-orange-100"
              >
                Discard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Autosave Indicator */}
      {editMode && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {autosaving && (
            <div data-testid="autosave-indicator" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving draft...</span>
            </div>
          )}
          {autosaveSuccess && (
            <div data-testid="autosave-success" className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>Draft saved</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}