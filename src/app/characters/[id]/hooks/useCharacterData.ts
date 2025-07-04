import { useEffect, useState } from 'react';
import { CharacterService } from '@/lib/services/CharacterService';
import type { ICharacter } from '@/lib/models/Character';

export const useCharacterData = (id: string) => {
  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCharacter = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Get actual user ID from authentication
        const userId = 'temp-user-id';
        const result = await CharacterService.getCharacterById(id, userId);

        if (result.success) {
          setCharacter(result.data);
        } else {
          setError(result.error.message);
        }
      } catch (err) {
        console.error('Error fetching character:', err);
        setError(err instanceof Error ? err.message : 'Character not found');
      }

      setLoading(false);
    };

    fetchCharacter();
  }, [id]);

  return { character, loading, error };
};