import { getRedirectMessage } from '../redirect-utils';

describe('getRedirectMessage', () => {
  it('returns null for null input', () => {
    expect(getRedirectMessage(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getRedirectMessage('')).toBeNull();
  });

  it('returns null for dashboard routes', () => {
    expect(getRedirectMessage('/dashboard')).toBeNull();
    expect(getRedirectMessage('http://localhost:3000/dashboard')).toBeNull();
  });

  it('returns correct message for dashboard subpaths', () => {
    expect(getRedirectMessage('/dashboard/profile')).toBe('Please sign in to view your Dashboard');
    expect(getRedirectMessage('http://localhost:3000/dashboard/settings')).toBe('Please sign in to view your Dashboard');
  });

  it('returns null for root path', () => {
    expect(getRedirectMessage('/')).toBeNull();
    expect(getRedirectMessage('http://localhost:3000/')).toBeNull();
  });

  it('returns correct message for settings route', () => {
    expect(getRedirectMessage('/settings')).toBe('Please sign in to view your Settings');
    expect(getRedirectMessage('http://localhost:3000/settings')).toBe('Please sign in to view your Settings');
  });

  it('returns correct message for parties route', () => {
    expect(getRedirectMessage('/parties')).toBe('Please sign in to view your Parties');
    expect(getRedirectMessage('http://localhost:3000/parties')).toBe('Please sign in to view your Parties');
  });

  it('returns correct message for characters route', () => {
    expect(getRedirectMessage('/characters')).toBe('Please sign in to view your Characters');
    expect(getRedirectMessage('http://localhost:3000/characters')).toBe('Please sign in to view your Characters');
  });

  it('returns correct message for encounters route', () => {
    expect(getRedirectMessage('/encounters')).toBe('Please sign in to view your Encounters');
    expect(getRedirectMessage('http://localhost:3000/encounters')).toBe('Please sign in to view your Encounters');
  });

  it('returns correct message for combat route', () => {
    expect(getRedirectMessage('/combat')).toBe('Please sign in to view your Combat');
    expect(getRedirectMessage('http://localhost:3000/combat')).toBe('Please sign in to view your Combat');
  });

  it('handles subpaths correctly', () => {
    expect(getRedirectMessage('/characters/123/edit')).toBe('Please sign in to view your Characters');
    expect(getRedirectMessage('http://localhost:3000/parties/456')).toBe('Please sign in to view your Parties');
    expect(getRedirectMessage('/settings/profile')).toBe('Please sign in to view your Settings');
  });

  it('returns null for unknown routes', () => {
    expect(getRedirectMessage('/unknown')).toBeNull();
    expect(getRedirectMessage('/api/some-endpoint')).toBeNull();
    expect(getRedirectMessage('http://localhost:3000/some-other-page')).toBeNull();
  });

  it('handles case insensitive routes', () => {
    expect(getRedirectMessage('/CHARACTERS')).toBe('Please sign in to view your Characters');
    expect(getRedirectMessage('/Settings')).toBe('Please sign in to view your Settings');
  });

  it('handles malformed URLs gracefully', () => {
    expect(getRedirectMessage('not-a-valid-url')).toBeNull();
    expect(getRedirectMessage('://')).toBeNull();
  });

  it('handles query parameters and fragments', () => {
    expect(getRedirectMessage('/characters?tab=stats')).toBe('Please sign in to view your Characters');
    expect(getRedirectMessage('/encounters#new')).toBe('Please sign in to view your Encounters');
    expect(getRedirectMessage('http://localhost:3000/parties?filter=active#list')).toBe('Please sign in to view your Parties');
  });
});