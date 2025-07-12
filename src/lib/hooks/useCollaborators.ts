import { useState } from 'react';

/**
 * Custom hook for managing collaborator state and actions
 */
export function useCollaborators() {
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);

  const handleToggleAdd = () => {
    setShowAddCollaborator(!showAddCollaborator);
    if (showAddCollaborator) {
      setNewCollaboratorEmail('');
    }
  };

  const handleAddCollaborator = async () => {
    if (newCollaboratorEmail.trim()) {
      try {
        const response = await fetch('/api/collaborators', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: newCollaboratorEmail,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add collaborator: ${response.status}`);
        }

        setNewCollaboratorEmail('');
        setShowAddCollaborator(false);
      } catch (error) {
        console.error('Failed to add collaborator:', error);
      }
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const response = await fetch(`/api/collaborators/${collaboratorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove collaborator: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  return {
    newCollaboratorEmail,
    showAddCollaborator,
    setNewCollaboratorEmail,
    handleToggleAdd,
    handleAddCollaborator,
    handleRemoveCollaborator,
  };
}