'use client';

import { Metadata } from 'next';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterListView } from '@/components/character/CharacterListView';
import { CharacterCreationForm } from '@/components/forms/character/CharacterCreationForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import type { ICharacter } from '@/lib/models/Character';

// Note: Metadata export won't work in client components, but keeping for reference
const _metadata: Metadata = {
  title: 'Characters - D&D Encounter Tracker',
  description: 'Manage and organize your D&D characters',
};

export default function CharactersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  // Redirect to sign-in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  const handleCharacterSelect = (character: ICharacter) => {
    router.push(`/characters/${character._id}`);
  };

  const handleCharacterEdit = (character: ICharacter) => {
    router.push(`/characters/${character._id}`);
  };

  const handleCharacterDelete = (character: ICharacter) => {
    // TODO: Implement character deletion confirmation dialog
    console.log('Delete character:', character._id);
  };

  const handleCharacterDuplicate = (character: ICharacter) => {
    // TODO: Implement character duplication
    console.log('Duplicate character:', character._id);
  };

  const handleCreateCharacter = () => {
    setIsCreationFormOpen(true);
  };

  const handleCreationSuccess = (character: any) => {
    setIsCreationFormOpen(false);
    // Navigate to the newly created character
    if (character?._id) {
      router.push(`/characters/${character._id}`);
    }
  };

  const handleCreationCancel = () => {
    setIsCreationFormOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Characters</h1>
            <p className="text-muted-foreground">
              Manage and organize your D&D characters
            </p>
          </div>
          <Button onClick={handleCreateCharacter} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Character
          </Button>
        </div>

        {/* Character List */}
        <CharacterListView
          userId={session?.user?.id || ''}
          onCharacterSelect={handleCharacterSelect}
          onCharacterEdit={handleCharacterEdit}
          onCharacterDelete={handleCharacterDelete}
          onCharacterDuplicate={handleCharacterDuplicate}
          onCreateCharacter={handleCreateCharacter}
        />

        {/* Character Creation Modal */}
        <CharacterCreationForm
          ownerId={session?.user?.id || ''}
          isOpen={isCreationFormOpen}
          onSuccess={handleCreationSuccess}
          onCancel={handleCreationCancel}
        />
      </div>
    </AppLayout>
  );
}