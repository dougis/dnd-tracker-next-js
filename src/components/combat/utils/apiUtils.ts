'use client';

/**
 * Helper function to make API requests
 */
export async function makeRequest({
  url,
  method = 'PATCH',
  body,
  setIsLoading,
  setError,
  onEncounterUpdate
}: {
  url: string;
  method?: string;
  body?: any;
  setIsLoading: (_loading: boolean) => void;
  setError: (_error: string | null) => void;
  onEncounterUpdate?: (_encounter: any) => void;
}) {
  try {
    setIsLoading(true);
    setError(null);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update encounter');
    }

    const data = await response.json();

    if (data.success && data.encounter) {
      onEncounterUpdate?.(data.encounter);
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    setError(errorMessage);
    throw err;
  } finally {
    setIsLoading(false);
  }
}