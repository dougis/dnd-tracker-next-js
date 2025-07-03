'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterService } from '@/lib/services/CharacterService';
import type { ICharacter } from '@/lib/models/Character';
import CharacterDetailView from '@/components/characters/CharacterDetailView';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CharacterDetailClientProps {
  id: string;
}

// Helper component for the back button to reduce duplication
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex items-center gap-4 mb-6">
    <Button variant="outline" size="sm" onClick={onClick}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  </div>
);

// Helper component for loading state
const LoadingState = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto p-6">
    <BackButton onClick={onBack} />
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading character...</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Helper component for error state
const ErrorState = ({ error, onBack }: { error: string; onBack: () => void }) => (
  <div className="max-w-4xl mx-auto p-6">
    <BackButton onClick={onBack} />
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </div>
);

// Helper component for not found state
const NotFoundState = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto p-6">
    <BackButton onClick={onBack} />
    <Alert>
      <AlertDescription>Character not found</AlertDescription>
    </Alert>
  </div>
);

export function CharacterDetailClient({ id }: CharacterDetailClientProps) {
  const router = useRouter();
  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Get actual user ID from authentication
        const userId = 'temp-user-id';
        const result = await CharacterService.getCharacterById(id, userId);

        if (!result.success) {
          throw new Error(result.error.message);
        }

        setCharacter(result.data);
      } catch (err) {
        console.error('Error fetching character:', err);
        setError(err instanceof Error ? err.message : 'Character not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCharacter();
    }
  }, [id]);

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