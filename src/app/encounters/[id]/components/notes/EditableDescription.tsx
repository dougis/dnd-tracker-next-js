import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SaveIcon, XIcon } from 'lucide-react';

interface EditableDescriptionProps {
  value: string;
  isSaving: boolean;
  onChange: (_value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Editable description textarea with save/cancel actions
 */
export function EditableDescription({ value, isSaving, onChange, onSave, onCancel }: EditableDescriptionProps) {
  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter encounter description..."
        rows={6}
        className="resize-none"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <XIcon className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          <SaveIcon className="h-4 w-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}