/**
 * @jest-environment node
 */
import React from 'react';
import { CharacterDetailClient } from '../CharacterDetailClient';

// Mock the CharacterDetailClient component
jest.mock('../CharacterDetailClient', () => ({
  CharacterDetailClient: jest.fn(({ id }: { id: string }) => (
    React.createElement('div', { 'data-testid': 'character-detail-client' }, `Character Detail Client: ${id}`)
  )),
}));

// Import the component to test after mocking
const CharacterDetailPage = require('../page').default;

describe('CharacterDetailPage (Server Component)', () => {
  const mockCharacterDetailClient = CharacterDetailClient as jest.MockedFunction<typeof CharacterDetailClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders CharacterDetailClient with the correct id', async () => {
    const mockParams = Promise.resolve({ id: 'test-character-id' });
    
    const result = await CharacterDetailPage({ params: mockParams });
    
    expect(mockCharacterDetailClient).toHaveBeenCalledWith(
      { id: 'test-character-id' },
      {}
    );
  });

  it('handles different character IDs correctly', async () => {
    const mockParams = Promise.resolve({ id: 'another-id-123' });
    
    const result = await CharacterDetailPage({ params: mockParams });
    
    expect(mockCharacterDetailClient).toHaveBeenCalledWith(
      { id: 'another-id-123' },
      {}
    );
  });

  it('properly awaits params before rendering', async () => {
    let resolveParams: (value: { id: string }) => void;
    const paramsPromise = new Promise<{ id: string }>((resolve) => {
      resolveParams = resolve;
    });

    // Start the component render
    const renderPromise = CharacterDetailPage({ params: paramsPromise });
    
    // Resolve the params
    resolveParams!({ id: 'delayed-id' });
    
    // Wait for component to finish
    const result = await renderPromise;
    
    expect(mockCharacterDetailClient).toHaveBeenCalledWith(
      { id: 'delayed-id' },
      {}
    );
  });
});