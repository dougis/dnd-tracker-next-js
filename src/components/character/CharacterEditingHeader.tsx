import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Edit, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CharacterUpdate } from '@/lib/validations/character';

interface SaveState {
  saving: boolean;
  saveSuccess: boolean;
}

interface AutosaveState {
  autosaving: boolean;
  autosaveSuccess: boolean;
}

interface DraftState {
  showDraftIndicator: boolean;
  draftChanges: CharacterUpdate | null;
}

interface EditActions {
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
}

interface DraftActions {
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
}

interface CharacterEditingHeaderProps {
  characterName: string;
  editMode: boolean;
  saveState: SaveState;
  autosaveState: AutosaveState;
  draftState: DraftState;
  editActions: EditActions;
  draftActions: DraftActions;
}

function EditModeButtons({ saveState, editActions }: { saveState: SaveState; editActions: EditActions }) {
  return (
    <>
      <Button
        data-testid="save-stats-button"
        onClick={editActions.onSaveClick}
        disabled={saveState.saving}
        className="flex items-center gap-2"
      >
        {saveState.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save
      </Button>
      <Button
        data-testid="cancel-stats-button"
        onClick={editActions.onCancelClick}
        variant="outline"
        className="flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
    </>
  );
}

function ViewModeButton({ onEditClick }: { onEditClick: () => void }) {
  return (
    <Button
      data-testid="edit-stats-button"
      onClick={onEditClick}
      className="flex items-center gap-2"
    >
      <Edit className="h-4 w-4" />
      Edit
    </Button>
  );
}

function DraftIndicator({ draftState, draftActions }: { draftState: DraftState; draftActions: DraftActions }) {
  if (!draftState.showDraftIndicator || !draftState.draftChanges) {
    return null;
  }

  return (
    <Alert data-testid="draft-indicator" className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-orange-800 flex items-center justify-between">
        <span>You have unsaved draft changes</span>
        <div className="flex gap-2">
          <Button
            data-testid="restore-draft-button"
            size="sm"
            variant="outline"
            onClick={draftActions.onRestoreDraft}
            className="text-orange-800 border-orange-300 hover:bg-orange-100"
          >
            Restore
          </Button>
          <Button
            data-testid="discard-draft-button"
            size="sm"
            variant="outline"
            onClick={draftActions.onDiscardDraft}
            className="text-orange-800 border-orange-300 hover:bg-orange-100"
          >
            Discard
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function AutosaveIndicator({ autosaveState }: { autosaveState: AutosaveState }) {
  if (!autosaveState.autosaving && !autosaveState.autosaveSuccess) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {autosaveState.autosaving && (
        <div data-testid="autosave-indicator" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving draft...</span>
        </div>
      )}
      {autosaveState.autosaveSuccess && (
        <div data-testid="autosave-success" className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>Draft saved</span>
        </div>
      )}
    </div>
  );
}

export function CharacterEditingHeader({
  characterName,
  editMode,
  saveState,
  autosaveState,
  draftState,
  editActions,
  draftActions,
}: CharacterEditingHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{characterName}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <EditModeButtons saveState={saveState} editActions={editActions} />
          ) : (
            <ViewModeButton onEditClick={editActions.onEditClick} />
          )}
        </div>
      </div>

      {saveState.saveSuccess && (
        <Alert data-testid="save-success-message" className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Character updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <DraftIndicator draftState={draftState} draftActions={draftActions} />

      {editMode && <AutosaveIndicator autosaveState={autosaveState} />}
    </div>
  );
}