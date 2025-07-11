/**
 * @jest-environment jsdom
 */
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { render } from '@testing-library/react';
import CharacterEditPage from './page';
import {
  createMockCharacter,
  multiclassCharacterData,
} from '@/lib/services/__tests__/CharacterService.test-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock useParams
const mockUseParams = require('next/navigation').useParams as jest.MockedFunction<any>;

describe('CharacterEditPage', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  const testCharacterId = 'test-character-id';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    } as any);

    mockUseParams.mockReturnValue({ id: testCharacterId });

    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated',
    } as any);
  });

  const mockSuccessfulCharacterFetch = (character: any) => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ character }),
    });
  };

  const mockFailedCharacterFetch = (errorMessage: string) => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });
  };

  const mockCharacterUpdate = (updatedCharacter: any) => {
    mockFetch.mockImplementation((url: string, options: any) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ character: updatedCharacter, message: 'Character updated successfully' }),
        });
      }
      // Default to GET request for character fetch
      return Promise.resolve({
        ok: true,
        json: async () => ({ character: updatedCharacter }),
      });
    });
  };

  it('should render loading state while fetching character', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<CharacterEditPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state when character not found', async () => {
    mockFailedCharacterFetch('Character not found');

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Character not found')).toBeInTheDocument();
    });
  });

  it('should render character edit form with pre-populated data', async () => {
    const testCharacter = createMockCharacter({
      skills: new Map([['athletics', true], ['intimidation', true]])
    });
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Character')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should show all form sections for character editing', async () => {
    const testCharacter = createMockCharacter();
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Ability Scores')).toBeInTheDocument();
      expect(screen.getByText('Classes')).toBeInTheDocument();
      expect(screen.getByText('Combat Stats')).toBeInTheDocument();
    });
  });

  it('should handle form submission successfully', async () => {
    const testCharacter = createMockCharacter();
    const updatedCharacter = { ...testCharacter, name: 'Updated Name' };
    mockCharacterUpdate(updatedCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
    });

    // Update the name field
    const nameField = screen.getByDisplayValue(testCharacter.name);
    fireEvent.change(nameField, { target: { value: 'Updated Name' } });

    // Submit the form
    const submitButton = screen.getByText('Update Character');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/characters/${testCharacterId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('Updated Name'),
        })
      );
    });
  });

  it('should show validation errors for invalid input', async () => {
    const testCharacter = createMockCharacter();
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
    });

    // Clear required field
    const nameField = screen.getByDisplayValue(testCharacter.name);
    fireEvent.change(nameField, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('should handle cancel action and navigate back', async () => {
    const testCharacter = createMockCharacter();
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockRouterPush).toHaveBeenCalledWith(`/characters/${testCharacterId}`);
  });

  it('should redirect to character detail page after successful update', async () => {
    const testCharacter = createMockCharacter();
    const updatedCharacter = { ...testCharacter, name: 'Updated Name' };
    mockCharacterUpdate(updatedCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
    });

    // Update and submit
    const nameField = screen.getByDisplayValue(testCharacter.name);
    fireEvent.change(nameField, { target: { value: 'Updated Name' } });

    const submitButton = screen.getByText('Update Character');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(`/characters/${testCharacterId}`);
    });
  });

  it('should show error message on update failure', async () => {
    const testCharacter = createMockCharacter();
    mockSuccessfulCharacterFetch(testCharacter);

    // Mock failed update
    mockFetch.mockImplementation((url: string, options: any) => {
      if (options?.method === 'PUT') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Update failed' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ character: testCharacter }),
      });
    });

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Character');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('should preserve multiclass data when editing', async () => {
    const testCharacter = createMockCharacter(multiclassCharacterData);
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
      // Check that multiclass information is preserved
      expect(screen.getByDisplayValue('fighter')).toBeInTheDocument();
      expect(screen.getByDisplayValue('wizard')).toBeInTheDocument();
    });
  });

  it('should handle equipment editing', async () => {
    const testCharacter = createMockCharacter({
      equipment: [
        { name: 'Longsword', quantity: 1, weight: 3, value: 15, equipped: true, magical: false },
        { name: 'Shield', quantity: 1, weight: 6, value: 10, equipped: true, magical: false }
      ]
    });
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
      // Check that equipment is loaded
      expect(screen.getByDisplayValue('Longsword')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Shield')).toBeInTheDocument();
    });
  });

  it('should handle spells editing', async () => {
    const testCharacter = createMockCharacter({
      spells: [
        {
          name: 'Fireball',
          level: 3,
          school: 'evocation',
          castingTime: '1 action',
          range: '150 feet',
          components: 'V, S, M',
          duration: 'Instantaneous',
          description: 'A bright streak flashes from your pointing finger.',
          isPrepared: true
        },
        {
          name: 'Magic Missile',
          level: 1,
          school: 'evocation',
          castingTime: '1 action',
          range: '120 feet',
          components: 'V, S',
          duration: 'Instantaneous',
          description: 'You create three glowing darts of magical force.',
          isPrepared: true
        }
      ]
    });
    mockSuccessfulCharacterFetch(testCharacter);

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
      // Check that spells are loaded
      expect(screen.getByDisplayValue('Fireball')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Magic Missile')).toBeInTheDocument();
    });
  });

  it('should disable submit button while form is submitting', async () => {
    const testCharacter = createMockCharacter();
    mockSuccessfulCharacterFetch(testCharacter);

    // Mock slow update response
    mockFetch.mockImplementation((url: string, options: any) => {
      if (options?.method === 'PUT') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ character: testCharacter, message: 'Character updated successfully' }),
            });
          }, 100);
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ character: testCharacter }),
      });
    });

    render(<CharacterEditPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(testCharacter.name)).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Character');
    fireEvent.click(submitButton);

    // Button should show updating state
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
  });
});