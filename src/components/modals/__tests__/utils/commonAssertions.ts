import { screen } from '../test-utils';

// Common assertion utilities
export const assertElementExists = (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const assertElementNotExists = (testId: string) => {
  expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
};

export const assertElementByTestId = (testId: string) => {
  expect(screen.getByTestId(testId)).toBeInTheDocument();
};

export const assertModalOpen = (isOpen: boolean = true) => {
  const modal = screen.getByTestId('modal') || screen.getByTestId('dialog');
  expect(modal).toHaveAttribute('data-open', isOpen ? 'true' : 'false');
};

export const assertModalTitle = (title: string) => {
  const modal = screen.getByTestId('modal') || screen.getByTestId('dialog');
  expect(modal).toHaveAttribute('data-title', title);
};

export const assertModalAttribute = (attribute: string, value: string) => {
  const modal = screen.getByTestId('modal') || screen.getByTestId('dialog');
  expect(modal).toHaveAttribute(attribute, value);
};

export const assertClassContains = (testId: string, className: string) => {
  const element = screen.getByTestId(testId);
  expect(element.className).toContain(className);
};

export const assertClassNotContains = (testId: string, className: string) => {
  const element = screen.getByTestId(testId);
  expect(element.className).not.toContain(className);
};
