import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, XIcon } from 'lucide-react';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

interface CollaboratorSectionProps {
  encounter: IEncounter;
  showAddCollaborator: boolean;
  newCollaboratorEmail: string;
  onToggleAdd: () => void;
  onEmailChange: (_email: string) => void;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (_collaboratorId: string) => void;
}

/**
 * Handle collaborator management
 */
export function CollaboratorSection({
  encounter,
  showAddCollaborator,
  newCollaboratorEmail,
  onToggleAdd,
  onEmailChange,
  onAddCollaborator,
  onRemoveCollaborator,
}: CollaboratorSectionProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddCollaborator();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Collaborators</span>
        {!showAddCollaborator && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdd}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Collaborator
          </Button>
        )}
      </div>

      {showAddCollaborator && (
        <div className="space-y-2">
          <Input
            placeholder="Enter email address"
            value={newCollaboratorEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdd}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onAddCollaborator}
              disabled={!newCollaboratorEmail.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Current Collaborators */}
      {encounter.sharedWith && encounter.sharedWith.length > 0 ? (
        <div className="space-y-2">
          {encounter.sharedWith.map((collaboratorId, index) => (
            <div key={collaboratorId.toString()} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Collaborator {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCollaborator(collaboratorId.toString())}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No collaborators added yet
        </p>
      )}
    </div>
  );
}