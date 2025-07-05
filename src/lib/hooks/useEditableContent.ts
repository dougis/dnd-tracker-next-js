import { useState } from 'react';

/**
 * Custom hook for managing editable content state
 */
export function useEditableContent(initialValue: string, onSave?: (_value: string) => Promise<void>) {
  const [editedValue, setEditedValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) {
      // TODO: Implement save functionality
      console.log('Saving content:', editedValue);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedValue);
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedValue(initialValue);
  };

  const handleChange = (value: string) => {
    setEditedValue(value);
  };

  return {
    editedValue,
    isSaving,
    handleSave,
    handleCancel,
    handleChange,
  };
}