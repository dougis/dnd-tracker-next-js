import { render, screen } from '@testing-library/react';

/**
 * Common pattern for testing user profile sections
 */
export const testUserProfileSection = (renderComponent: () => void) => {
  renderComponent();
  
  const userSection = screen
    .getByText('Demo User')
    .closest('.border-t.border-border.p-4');
  expect(userSection).toBeInTheDocument();
  
  const avatar = screen
    .getByText('Demo User')
    .parentElement?.parentElement?.querySelector(
      '.h-8.w-8.rounded-full.bg-muted'
    );
  expect(avatar).toBeInTheDocument();
  
  const userName = screen.getByText('Demo User');
  const userEmail = screen.getByText('demo@example.com');
  
  expect(userName).toHaveClass('text-sm font-medium text-foreground truncate');
  expect(userEmail).toHaveClass('text-xs text-muted-foreground truncate');
};

/**
 * Common pattern for testing CTA buttons
 */
export const testCTAButtons = () => {
  const getStartedButton = screen.getByText('Get Started Free');
  const signInButton = screen.getByText('Sign In');

  expect(getStartedButton).toBeInTheDocument();
  expect(signInButton).toBeInTheDocument();
  
  return { getStartedButton, signInButton };
};

/**
 * Common pattern for testing save failure scenarios
 */
export const testSaveFailure = async (
  mockUser: any,
  testFunction: () => Promise<any>,
  errorMessage: string = 'Save failed'
) => {
  mockUser.save.mockRejectedValue(new Error(errorMessage));
  
  await expect(testFunction()).rejects.toThrow(errorMessage);
};