/**
 * Shared test helpers and assertion utilities
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Common assertions
export const assertions = {
  expectFormField: (fieldValue: string, shouldExist: boolean = true) => {
    const assertion = expect(screen.getByDisplayValue(fieldValue));
    return shouldExist ? assertion.toBeInTheDocument() : assertion.not.toBeInTheDocument();
  },

  expectLoadingState: () => {
    expect(screen.getByText('Loading encounter...')).toBeInTheDocument();
  },

  expectErrorState: (errorText: string) => {
    expect(screen.getByText('Error loading encounter')).toBeInTheDocument();
    expect(screen.getByText(errorText)).toBeInTheDocument();
  },

  expectElementByText: (text: string, shouldExist: boolean = true) => {
    const query = shouldExist ? screen.getByText : screen.queryByText;
    const assertion = expect(query(text));
    return shouldExist ? assertion.toBeInTheDocument() : assertion.not.toBeInTheDocument();
  },

  expectButtonDisabled: (buttonName: string | RegExp) => {
    const button = screen.getByRole('button', { name: buttonName });
    expect(button).toBeDisabled();
  },

  expectButtonEnabled: (buttonName: string | RegExp) => {
    const button = screen.getByRole('button', { name: buttonName });
    expect(button).not.toBeDisabled();
  },
};

// Form interaction utilities
export const formHelpers = {
  clearAndType: async (user: ReturnType<typeof userEvent.setup>, input: HTMLElement, value: string) => {
    await user.clear(input);
    if (value.trim() !== '') {
      await user.type(input, value);
    }
  },

  waitForFormField: async (fieldValue: string) => {
    await waitFor(() => {
      expect(screen.getByDisplayValue(fieldValue)).toBeInTheDocument();
    });
  },

  clickButton: async (user: ReturnType<typeof userEvent.setup>, buttonName: string | RegExp) => {
    const button = screen.getByRole('button', { name: buttonName });
    await user.click(button);
  },

  fillInput: async (user: ReturnType<typeof userEvent.setup>, labelOrPlaceholder: string, value: string) => {
    const input = screen.getByLabelText(labelOrPlaceholder) || screen.getByPlaceholderText(labelOrPlaceholder);
    await user.clear(input);
    if (value.trim() !== '') {
      await user.type(input, value);
    }
  },
};

// Common validation test pattern
export const createValidationTest = (fieldValue: string, invalidValue: string, renderComponent: () => void) => {
  return async () => {
    const user = userEvent.setup();
    renderComponent();

    await formHelpers.waitForFormField(fieldValue);

    const input = screen.getByDisplayValue(fieldValue);
    await formHelpers.clearAndType(user, input, invalidValue);

    await waitFor(() => {
      assertions.expectButtonDisabled(/save encounter/i);
    });
  };
};

// Wait utilities
export const waitUtils = {
  waitForElement: async (text: string, timeout = 1000) => {
    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    }, { timeout });
  },

  waitForElementToDisappear: async (text: string, timeout = 1000) => {
    await waitFor(() => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }, { timeout });
  },
};