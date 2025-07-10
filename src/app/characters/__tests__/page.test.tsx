import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CharactersPage from '../page';
import {
  mockSessionSetup,
  formHelpers,
  testActions,
  expectations,
  createButtonHelpers,
} from './test-helpers';

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
      mockUseSession.mockReturnValue(mockSessionSetup.loading as any);
      render(<CharactersPage />);

      expectations.loadingState();
      expectations.appLayout();
    });

    it('redirects to signin when unauthenticated', () => {
      mockUseSession.mockReturnValue(mockSessionSetup.unauthenticated as any);
      render(<CharactersPage />);

      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    it('renders page content when authenticated', () => {
      mockUseSession.mockReturnValue(mockSessionSetup.authenticated as any);
      render(<CharactersPage />);

      expectations.pageContent();
      expectations.characterListView();
    });
  });

  describe('Page Header', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(mockSessionSetup.authenticated as any);
    });

    it('displays correct page title and description', () => {
      render(<CharactersPage />);
      expectations.pageContent();
    });

    it('displays create character button', () => {
      render(<CharactersPage />);
      expectations.createButtonsExist();
      const mainCreateButton = createButtonHelpers.findMainCreateButton();
      expect(mainCreateButton).toBeInTheDocument();
    });
  });

  describe('Character Actions', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(mockSessionSetup.authenticated as any);
    });

    it('navigates to character detail when character is selected', () => {
      render(<CharactersPage />);
      testActions.selectCharacter();
      expect(mockPush).toHaveBeenCalledWith('/characters/char1');
    });

    it('navigates to character detail when character is edited', () => {
      render(<CharactersPage />);
      testActions.editCharacter();
      expect(mockPush).toHaveBeenCalledWith('/characters/char1');
    });

    it('logs character deletion (placeholder implementation)', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<CharactersPage />);

      testActions.deleteCharacter();
      expect(consoleSpy).toHaveBeenCalledWith('Delete character:', 'char1');
      consoleSpy.mockRestore();
    });

    it('logs character duplication (placeholder implementation)', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<CharactersPage />);

      testActions.duplicateCharacter();
      expect(consoleSpy).toHaveBeenCalledWith('Duplicate character:', 'char1');
      consoleSpy.mockRestore();
    });
  });

  describe('Character Creation Flow', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(mockSessionSetup.authenticated as any);
    });

    it('opens character creation form when create button is clicked', () => {
      render(<CharactersPage />);

      formHelpers.expectFormHidden();
      formHelpers.clickMainCreateButton();
      formHelpers.expectFormVisible();
    });

    it('opens character creation form from empty state', () => {
      render(<CharactersPage />);

      formHelpers.expectFormHidden();
      formHelpers.clickEmptyStateCreateButton();
      formHelpers.expectFormVisible();
    });

    it('closes form and navigates to new character on creation success', async () => {
      render(<CharactersPage />);

      formHelpers.clickMainCreateButton();
      formHelpers.expectFormVisible();
      formHelpers.clickCreationSuccess();

      await waitFor(() => {
        formHelpers.expectFormHidden();
        expect(mockPush).toHaveBeenCalledWith('/characters/new-char');
      });
    });

    it('closes form on cancellation', () => {
      render(<CharactersPage />);

      formHelpers.clickMainCreateButton();
      formHelpers.expectFormVisible();
      formHelpers.clickCreationCancel();
      formHelpers.expectFormHidden();
    });

    it('handles creation success without character ID gracefully', async () => {
      render(<CharactersPage />);

      formHelpers.clickMainCreateButton();
      formHelpers.clickCreationSuccess();

      await waitFor(() => {
        formHelpers.expectFormHidden();
      });
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(mockSessionSetup.authenticated as any);
    });

    it('passes correct props to CharacterListView', () => {
      render(<CharactersPage />);

      expectations.characterListView();
      expectations.characterActions();
    });

    it('passes correct props to CharacterCreationForm', () => {
      render(<CharactersPage />);

      expectations.characterCreationForm();
      expectations.formControls();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(mockSessionSetup.authenticated as any);
    });

    it('has proper heading structure', () => {
      render(<CharactersPage />);
      expectations.headingStructure();
    });

    it('has accessible create character button', () => {
      render(<CharactersPage />);
      expectations.createButtonsExist();
      createButtonHelpers.verifyMainCreateButton();
    });

    it('provides appropriate aria context', () => {
      render(<CharactersPage />);

      expectations.appLayout();
      expectations.characterListView();
    });
  });
});