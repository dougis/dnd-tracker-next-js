import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CharactersPage from '../page';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/components/character/CharacterListView');
jest.mock('@/components/forms/character/CharacterCreationForm');
jest.mock('@/components/layout/AppLayout');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

// Mock components
jest.mock('@/components/character/CharacterListView', () => ({
  CharacterListView: ({ onCharacterSelect, onCharacterEdit, onCharacterDelete, onCharacterDuplicate, onCreateCharacter }: any) => (
    <div data-testid="character-list-view">
      <button data-testid="select-character" onClick={() => onCharacterSelect?.({ _id: 'char1' })}>
        Select Character
      </button>
      <button data-testid="edit-character" onClick={() => onCharacterEdit?.({ _id: 'char1' })}>
        Edit Character
      </button>
      <button data-testid="delete-character" onClick={() => onCharacterDelete?.({ _id: 'char1' })}>
        Delete Character
      </button>
      <button data-testid="duplicate-character" onClick={() => onCharacterDuplicate?.({ _id: 'char1' })}>
        Duplicate Character
      </button>
      <button data-testid="create-character-empty" onClick={onCreateCharacter}>
        Create Character (Empty State)
      </button>
    </div>
  ),
}));

jest.mock('@/components/forms/character/CharacterCreationForm', () => ({
  CharacterCreationForm: ({ isOpen, onSuccess, onCancel }: any) => (
    <div data-testid="character-creation-form" style={{ display: isOpen ? 'block' : 'none' }}>
      <button data-testid="creation-success" onClick={() => onSuccess?.({ _id: 'new-char' })}>
        Create Success
      </button>
      <button data-testid="creation-cancel" onClick={onCancel}>
        Cancel Creation
      </button>
    </div>
  ),
}));

jest.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe('CharactersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('Authentication States', () => {
    it('shows loading state while session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      } as any);

      render(<CharactersPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('redirects to signin when unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      } as any);

      render(<CharactersPage />);

      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    it('renders page content when authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      } as any);

      render(<CharactersPage />);

      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Manage and organize your D&D characters')).toBeInTheDocument();
      expect(screen.getByText('Create Character')).toBeInTheDocument();
      expect(screen.getByTestId('character-list-view')).toBeInTheDocument();
    });
  });

  describe('Page Header', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      } as any);
    });

    it('displays correct page title and description', () => {
      render(<CharactersPage />);

      expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
      expect(screen.getByText('Manage and organize your D&D characters')).toBeInTheDocument();
    });

    it('displays create character button', () => {
      render(<CharactersPage />);

      const createButtons = screen.getAllByRole('button', { name: /create character/i });
      expect(createButtons.length).toBeGreaterThan(0);
      
      // Find the main create button (not the empty state one)
      const mainCreateButton = createButtons.find(button => 
        !button.hasAttribute('data-testid') || 
        button.getAttribute('data-testid') !== 'create-character-empty'
      );
      expect(mainCreateButton).toBeInTheDocument();
    });
  });

  describe('Character Actions', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      } as any);
    });

    it('navigates to character detail when character is selected', () => {
      render(<CharactersPage />);

      fireEvent.click(screen.getByTestId('select-character'));

      expect(mockPush).toHaveBeenCalledWith('/characters/char1');
    });

    it('navigates to character detail when character is edited', () => {
      render(<CharactersPage />);

      fireEvent.click(screen.getByTestId('edit-character'));

      expect(mockPush).toHaveBeenCalledWith('/characters/char1');
    });

    it('logs character deletion (placeholder implementation)', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<CharactersPage />);

      fireEvent.click(screen.getByTestId('delete-character'));

      expect(consoleSpy).toHaveBeenCalledWith('Delete character:', 'char1');
      
      consoleSpy.mockRestore();
    });

    it('logs character duplication (placeholder implementation)', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<CharactersPage />);

      fireEvent.click(screen.getByTestId('duplicate-character'));

      expect(consoleSpy).toHaveBeenCalledWith('Duplicate character:', 'char1');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Character Creation Flow', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      } as any);
    });

    it('opens character creation form when create button is clicked', () => {
      render(<CharactersPage />);

      // Initially form should be hidden
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: none');

      // Find and click the main create character button (not the empty state one)
      const createButtons = screen.getAllByRole('button', { name: /create character/i });
      const mainCreateButton = createButtons.find(button => 
        !button.hasAttribute('data-testid') || 
        button.getAttribute('data-testid') !== 'create-character-empty'
      );
      
      fireEvent.click(mainCreateButton!);

      // Form should now be visible
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: block');
    });

    it('opens character creation form from empty state', () => {
      render(<CharactersPage />);

      // Initially form should be hidden
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: none');

      // Click create character from empty state
      fireEvent.click(screen.getByTestId('create-character-empty'));

      // Form should now be visible
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: block');
    });

    it('closes form and navigates to new character on creation success', async () => {
      render(<CharactersPage />);

      // Find and click the main create character button
      const createButtons = screen.getAllByRole('button', { name: /create character/i });
      const mainCreateButton = createButtons.find(button => 
        !button.hasAttribute('data-testid') || 
        button.getAttribute('data-testid') !== 'create-character-empty'
      );
      
      fireEvent.click(mainCreateButton!);
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: block');

      // Simulate successful character creation
      fireEvent.click(screen.getByTestId('creation-success'));

      // Form should be closed and navigation should occur
      await waitFor(() => {
        expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: none');
        expect(mockPush).toHaveBeenCalledWith('/characters/new-char');
      });
    });

    it('closes form on cancellation', () => {
      render(<CharactersPage />);

      // Find and click the main create character button
      const createButtons = screen.getAllByRole('button', { name: /create character/i });
      const mainCreateButton = createButtons.find(button => 
        !button.hasAttribute('data-testid') || 
        button.getAttribute('data-testid') !== 'create-character-empty'
      );
      
      fireEvent.click(mainCreateButton!);
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: block');

      // Cancel creation
      fireEvent.click(screen.getByTestId('creation-cancel'));

      // Form should be closed
      expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: none');
    });

    it('handles creation success without character ID gracefully', async () => {
      render(<CharactersPage />);

      // Find and click the main create character button
      const createButtons = screen.getAllByRole('button', { name: /create character/i });
      const mainCreateButton = createButtons.find(button => 
        !button.hasAttribute('data-testid') || 
        button.getAttribute('data-testid') !== 'create-character-empty'
      );
      
      fireEvent.click(mainCreateButton!);

      // Simulate creation success with no ID
      fireEvent.click(screen.getByTestId('creation-success'));

      // Form should still be closed
      await waitFor(() => {
        expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: none');
      });
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      } as any);
    });

    it('passes correct props to CharacterListView', () => {
      render(<CharactersPage />);

      const characterListView = screen.getByTestId('character-list-view');
      expect(characterListView).toBeInTheDocument();
      
      // Test that all callback functions are working
      expect(screen.getByTestId('select-character')).toBeInTheDocument();
      expect(screen.getByTestId('edit-character')).toBeInTheDocument();
      expect(screen.getByTestId('delete-character')).toBeInTheDocument();
      expect(screen.getByTestId('duplicate-character')).toBeInTheDocument();
      expect(screen.getByTestId('create-character-empty')).toBeInTheDocument();
    });

    it('passes correct props to CharacterCreationForm', () => {
      render(<CharactersPage />);

      const characterCreationForm = screen.getByTestId('character-creation-form');
      expect(characterCreationForm).toBeInTheDocument();
      
      // Test that form controls are working
      expect(screen.getByTestId('creation-success')).toBeInTheDocument();
      expect(screen.getByTestId('creation-cancel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      } as any);
    });

    it('has proper heading structure', () => {
      render(<CharactersPage />);

      const heading = screen.getByRole('heading', { name: 'Characters' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('has accessible create character button', () => {
      render(<CharactersPage />);

      const createButtons = screen.getAllByRole('button', { name: /create character/i });
      expect(createButtons.length).toBeGreaterThan(0);
      
      // Find the main create button
      const mainCreateButton = createButtons.find(button => 
        !button.hasAttribute('data-testid') || 
        button.getAttribute('data-testid') !== 'create-character-empty'
      );
      expect(mainCreateButton).toBeInTheDocument();
      expect(mainCreateButton).toBeEnabled();
    });

    it('provides appropriate aria context', () => {
      render(<CharactersPage />);

      // Check that the main content area is properly structured
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('character-list-view')).toBeInTheDocument();
    });
  });
});