import { useState } from 'react';

/**
 * Custom hook for managing editable content state
 */
export function useEditableContent(initialValue: string, onSave?: (_value: string) => Promise<void>) {
  const [editedValue, setEditedValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) {
      setIsSaving(true);
      try {
        const response = await fetch('/api/content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: editedValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save content: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to save content:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedValue);
    } catch (error) {
      console.error('Failed to save content:', error);
      throw error;
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