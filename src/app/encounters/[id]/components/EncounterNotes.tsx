import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenIcon, SaveIcon, XIcon } from 'lucide-react';
import type { Encounter } from '@/lib/validations/encounter';

interface EncounterNotesProps {
  encounter: Encounter;
  isEditing: boolean;
  onToggleEdit: () => void;
}

/**
 * Display and allow editing of encounter notes and description
 */
export function EncounterNotes({ encounter, isEditing, onToggleEdit }: EncounterNotesProps) {
  const [editedDescription, setEditedDescription] = useState(encounter.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      console.log('Saving description:', editedDescription);
      onToggleEdit();
    } catch (error) {
      console.error('Failed to save description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDescription(encounter.description || '');
    onToggleEdit();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Description</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={onToggleEdit}>
              <PenIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Enter encounter description..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <XIcon className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <SaveIcon className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {encounter.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {encounter.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description provided. Click Edit to add one.
              </p>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Notes</h4>
          <div className="text-sm text-muted-foreground">
            <p>Additional notes and reminders can be added here for the DM&apos;s reference during the encounter.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}