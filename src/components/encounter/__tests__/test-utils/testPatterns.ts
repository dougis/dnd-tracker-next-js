import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Common test patterns and assertions used across encounter component tests
 */

/**
 * Tests for basic rendering of components
 */
export const testBasicRendering = (component: React.ReactElement, expectedTexts: string[]) => {
  render(component);
  expectedTexts.forEach(text => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};

/**
 * Tests for loading state components
 */
export const testLoadingState = (component: React.ReactElement, expectedLoadingCards: number) => {
  render(component);
  const loadingCards = screen.getAllByTestId('loading-card');
  expect(loadingCards).toHaveLength(expectedLoadingCards);
};

/**
 * Tests for empty state components
 */
export const testEmptyState = (component: React.ReactElement, emptyStateText: string) => {
  render(component);
  expect(screen.getByText(emptyStateText)).toBeInTheDocument();
};

/**
 * Tests for responsive grid classes
 */
export const testResponsiveGrid = (component: React.ReactElement, containerSelector: string) => {
  render(component);
  const container = document.querySelector(containerSelector);
  expect(container).toHaveClass(
    'grid',
    'grid-cols-1',
    'md:grid-cols-2',
    'lg:grid-cols-3',
    'xl:grid-cols-4',
    'gap-6'
  );
};

/**
 * Tests for button clicks and user interactions
 */
export const testButtonClick = async (buttonSelector: string | RegExp, expectedCallback: jest.Mock) => {
  const user = userEvent.setup();
  const button = typeof buttonSelector === 'string'
    ? screen.getByTestId(buttonSelector)
    : screen.getByRole('button', { name: buttonSelector });

  await user.click(button);
  expect(expectedCallback).toHaveBeenCalledTimes(1);
};

/**
 * Tests for checkbox selection
 */
export const testCheckboxSelection = async (checkboxTestId: string, expectedCallback: jest.Mock, expectedValue?: any) => {
  const user = userEvent.setup();
  const checkbox = screen.getByTestId(checkboxTestId);

  await user.click(checkbox);

  if (expectedValue !== undefined) {
    expect(expectedCallback).toHaveBeenCalledWith(expectedValue);
  } else {
    expect(expectedCallback).toHaveBeenCalledTimes(1);
  }
};

/**
 * Tests for dialog opening and closing
 */
export const testDialogFlow = async (
  triggerButtonSelector: string | RegExp,
  dialogRole: string = 'alertdialog',
  expectedDialogTitle?: string
) => {
  const user = userEvent.setup();

  // Open dialog
  const triggerButton = typeof triggerButtonSelector === 'string'
    ? screen.getByTestId(triggerButtonSelector)
    : screen.getByRole('button', { name: triggerButtonSelector });

  await user.click(triggerButton);

  const dialog = screen.getByRole(dialogRole);
  expect(dialog).toBeInTheDocument();

  if (expectedDialogTitle) {
    expect(screen.getByText(expectedDialogTitle)).toBeInTheDocument();
  }

  return { dialog, user };
};