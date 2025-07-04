import { useEffect, useState } from 'react';
import { CharacterService } from '@/lib/services/CharacterService';
import type { ICharacter } from '@/lib/models/Character';

export const useCharacterData = (id: string) => {
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

  return { character, loading, error };
};