'use client';

import { Metadata } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CharacterListView } from '@/components/character/CharacterListView';
import { CharacterCreationForm } from '@/components/forms/character/CharacterCreationForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useCharacterPageActions } from './hooks/useCharacterPageActions';

// Note: Metadata export won't work in client components, but keeping for reference
const _metadata: Metadata = {
  title: 'Characters - D&D Encounter Tracker',
  description: 'Manage and organize your D&D characters',
};

function LoadingState() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    </AppLayout>
  );
}

function useAuthenticatedSession() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/signin');
  }

  return { session, status, isLoading: status === 'loading', isAuthenticated: status === 'authenticated' };
}

export default function CharactersPage() {
  const { session, isLoading } = useAuthenticatedSession();
  const actions = useCharacterPageActions();

  if (isLoading) {
    return <LoadingState />;
  }

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
          <Button onClick={actions.openCreationForm} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Character
          </Button>
        </div>

        {/* Character List */}
        <CharacterListView
          userId={session?.user?.id || ''}
          onCharacterSelect={actions.selectCharacter}
          onCharacterEdit={actions.editCharacter}
          onCharacterDelete={actions.deleteCharacter}
          onCharacterDuplicate={actions.duplicateCharacter}
          onCreateCharacter={actions.openCreationForm}
        />

        {/* Character Creation Modal */}
        <CharacterCreationForm
          ownerId={session?.user?.id || ''}
          isOpen={actions.isCreationFormOpen}
          onSuccess={actions.handleCreationSuccess}
          onCancel={actions.closeCreationForm}
        />
      </div>
    </AppLayout>
  );
}