import { useState, useEffect, useCallback } from 'react';
import { CharacterService, type PaginatedCharacters } from '@/lib/services/CharacterService';
import { DEFAULT_PAGE_SIZE } from '../constants';

interface UseCharacterDataResult {
  loading: boolean;
  error: string | null;
  charactersData: PaginatedCharacters | null;
  currentPage: number;
  setCurrentPage: (_page: number) => void;
  reloadData: () => void;
}

export function useCharacterData(userId: string): UseCharacterDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [charactersData, setCharactersData] = useState<PaginatedCharacters | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CharacterService.getCharactersByOwner(userId, currentPage, DEFAULT_PAGE_SIZE);

      if (result.success) {
        setCharactersData(result.data);
      } else {
        setError(result.error?.message || 'Failed to load characters');
      }
    } catch (err) {
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  return {
    loading,
    error,
    charactersData,
    currentPage,
    setCurrentPage,
    reloadData: loadCharacters,
  };
}