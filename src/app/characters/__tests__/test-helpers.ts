import { screen, fireEvent } from '@testing-library/react';

/**
 * Test helpers for characters page tests to reduce code duplication
 */

export const mockSessionSetup = {
  authenticated: {
    data: {
      user: {
        id: 'user123',
        email: 'test@example.com',
      },
    },
    status: 'authenticated' as const,
  },
  loading: {
    data: null,
    status: 'loading' as const,
  },
  unauthenticated: {
    data: null,
    status: 'unauthenticated' as const,
  },
};

export const formHelpers = {
  expectFormHidden: () => {
    expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: none');
  },

  expectFormVisible: () => {
    expect(screen.getByTestId('character-creation-form')).toHaveStyle('display: block');
  },

  getMainCreateButton: () => {
    const createButtons = screen.getAllByRole('button', { name: /create character/i });
    return createButtons.find(button =>
      !button.hasAttribute('data-testid') ||
      button.getAttribute('data-testid') !== 'create-character-empty'
    );
  },

  clickMainCreateButton: () => {
    const button = formHelpers.getMainCreateButton();
    if (button) {
      fireEvent.click(button);
    }
    return button;
  },

  clickEmptyStateCreateButton: () => {
    fireEvent.click(screen.getByTestId('create-character-empty'));
  },

  clickCreationSuccess: () => {
    fireEvent.click(screen.getByTestId('creation-success'));
  },

  clickCreationCancel: () => {
    fireEvent.click(screen.getByTestId('creation-cancel'));
  },
};

export const testActions = {
  selectCharacter: () => fireEvent.click(screen.getByTestId('select-character')),
  editCharacter: () => fireEvent.click(screen.getByTestId('edit-character')),
  deleteCharacter: () => fireEvent.click(screen.getByTestId('delete-character')),
  duplicateCharacter: () => fireEvent.click(screen.getByTestId('duplicate-character')),
};

export const expectations = {
  pageContent: () => {
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Manage and organize your D&D characters')).toBeInTheDocument();
  },

  characterListView: () => {
    expect(screen.getByTestId('character-list-view')).toBeInTheDocument();
  },

  characterCreationForm: () => {
    expect(screen.getByTestId('character-creation-form')).toBeInTheDocument();
  },

  loadingState: () => {
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  },

  appLayout: () => {
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  },

  headingStructure: () => {
    const heading = screen.getByRole('heading', { name: 'Characters' });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  },

  createButtonsExist: () => {
    const createButtons = screen.getAllByRole('button', { name: /create character/i });
    expect(createButtons.length).toBeGreaterThan(0);
    return createButtons;
  },

  formControls: () => {
    expect(screen.getByTestId('creation-success')).toBeInTheDocument();
    expect(screen.getByTestId('creation-cancel')).toBeInTheDocument();
  },

  characterActions: () => {
    expect(screen.getByTestId('select-character')).toBeInTheDocument();
    expect(screen.getByTestId('edit-character')).toBeInTheDocument();
    expect(screen.getByTestId('delete-character')).toBeInTheDocument();
    expect(screen.getByTestId('duplicate-character')).toBeInTheDocument();
    expect(screen.getByTestId('create-character-empty')).toBeInTheDocument();
  },
};

export const createButtonHelpers = {
  findMainCreateButton: () => {
    const createButtons = screen.getAllByRole('button', { name: /create character/i });
    return createButtons.find(button =>
      !button.hasAttribute('data-testid') ||
      button.getAttribute('data-testid') !== 'create-character-empty'
    );
  },

  verifyMainCreateButton: () => {
    const mainCreateButton = createButtonHelpers.findMainCreateButton();
    expect(mainCreateButton).toBeInTheDocument();
    expect(mainCreateButton).toBeEnabled();
    return mainCreateButton;
  },
};