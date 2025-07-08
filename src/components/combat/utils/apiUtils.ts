'use client';

interface RequestConfig {
  url: string;
  method?: string;
  body?: any;
  setIsLoading: (_loading: boolean) => void;
  setError: (_error: string | null) => void;
  onEncounterUpdate?: (_encounter: any) => void;
}

/**
 * Creates fetch configuration object
 */
function createFetchConfig(method: string, body?: any) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  };
}

/**
 * Handles API response validation and parsing
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update encounter');
  }
  return await response.json();
}

/**
 * Processes successful response data
 */
function processResponseData(data: any, onEncounterUpdate?: (_encounter: any) => void) {
  if (data.success && data.encounter) {
    onEncounterUpdate?.(data.encounter);
  }
  return data;
}

/**
 * Handles errors and converts them to user-friendly messages
 */
function handleError(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Helper function to make API requests
 */
export async function makeRequest(config: RequestConfig) {
  const { url, method = 'PATCH', body, setIsLoading, setError, onEncounterUpdate } = config;

  try {
    setIsLoading(true);
    setError(null);

    const fetchConfig = createFetchConfig(method, body);
    const response = await fetch(url, fetchConfig);
    const data = await handleResponse(response);

    return processResponseData(data, onEncounterUpdate);
  } catch (err) {
    const errorMessage = handleError(err);
    setError(errorMessage);
    // Don't rethrow the error since we're already managing the error state
    // This prevents uncaught exceptions in calling code
  } finally {
    setIsLoading(false);
  }
}