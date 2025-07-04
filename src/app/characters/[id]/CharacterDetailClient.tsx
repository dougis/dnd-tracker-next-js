'use client';

import { useRouter } from 'next/navigation';
import type { ICharacter } from '@/lib/models/Character';
import CharacterDetailView from '@/components/characters/CharacterDetailView';
import { BackButton, LoadingState, ErrorState, NotFoundState } from './components/CharacterStates';
import { useCharacterData } from './hooks/useCharacterData';

interface CharacterDetailClientProps {
  id: string;
}

export function CharacterDetailClient({ id }: CharacterDetailClientProps) {
  const router = useRouter();
  const { character, loading, error } = useCharacterData(id);

  const handleEdit = (character: ICharacter) => {
    router.push(`/characters/${character._id.toString()}/edit` as any);
  };

  const handleShare = (character: ICharacter) => {
    // TODO: Implement share functionality
    console.log('Sharing character:', character.name);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) return <LoadingState onBack={handleBack} />;
  if (error) return <ErrorState error={error} onBack={handleBack} />;
  if (!character) return <NotFoundState onBack={handleBack} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <BackButton onClick={handleBack} />
        <CharacterDetailView
          character={character}
          onEdit={handleEdit}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}