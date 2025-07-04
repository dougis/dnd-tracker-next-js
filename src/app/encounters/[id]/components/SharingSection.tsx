import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShareIcon, CopyIcon, PlusIcon, XIcon } from 'lucide-react';
import type { Encounter } from '@/lib/validations/encounter';

interface SharingSectionProps {
  encounter: Encounter;
}

/**
 * Encounter sharing and collaboration features
 */
export function SharingSection({ encounter }: SharingSectionProps) {
  const [showShareLink, setShowShareLink] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);

  const shareLink = `${window.location.origin}/encounters/${encounter._id}/shared`;

  const handleGenerateShareLink = () => {
    setShowShareLink(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // TODO: Show toast notification
      console.log('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaboratorEmail.trim()) {
      // TODO: Implement collaborator addition
      console.log('Adding collaborator:', newCollaboratorEmail);
      setNewCollaboratorEmail('');
      setShowAddCollaborator(false);
    }
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    // TODO: Implement collaborator removal
    console.log('Removing collaborator:', collaboratorId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShareIcon className="h-4 w-4 mr-2" />
          Share Encounter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visibility Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Visibility</span>
          <Badge variant={encounter.isPublic ? 'default' : 'secondary'}>
            {encounter.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>

        {/* Share Link Generation */}
        <div className="space-y-2">
          {!showShareLink ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateShareLink}
              className="w-full"
            >
              Generate Share Link
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex">
                <Input
                  value={shareLink}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="ml-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the encounter
              </p>
            </div>
          )}
        </div>

        {/* Collaborators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Collaborators</span>
            {!showAddCollaborator && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCollaborator(true)}
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
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCollaborator(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddCollaborator}
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
                <div key={collaboratorId} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Collaborator {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCollaborator(collaboratorId)}
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

        {/* Share Settings */}
        <div className="pt-3 border-t">
          <p className="text-xs font-medium mb-2">Share Settings</p>
          <div className="space-y-1">
            <label className="flex items-center text-xs">
              <input type="checkbox" className="mr-2" />
              Allow editing
            </label>
            <label className="flex items-center text-xs">
              <input type="checkbox" className="mr-2" />
              Allow commenting
            </label>
            <label className="flex items-center text-xs">
              <input type="checkbox" className="mr-2" />
              Send notifications
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}