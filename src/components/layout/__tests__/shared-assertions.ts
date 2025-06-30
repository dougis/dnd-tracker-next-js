/**
 * Shared assertion utilities for layout component tests
 * Eliminates duplication of common test assertions
 */

import { screen } from '@testing-library/react';

/**
 * Assert that an element has expected CSS classes
 */
export const assertHasClasses = (
  element: Element | null,
  classes: string[]
) => {
  expect(element).toHaveClass(...classes);
};

/**
 * Assert navigation link has correct href
 */
export const assertNavigationLink = (
  linkText: string,
  expectedHref: string
) => {
  const link = screen.getByText(linkText).closest('a');
  expect(link).toHaveAttribute('href', expectedHref);
  return link;
};

/**
 * Assert SVG icon properties
 */
export const assertSvgIcon = (
  element: Element | null,
  expectedClasses: string[] = ['h-5', 'w-5']
) => {
  const icon = element?.querySelector('svg');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass(...expectedClasses);
  expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
  return icon;
};

/**
 * Assert user profile section content
 */
export const assertUserProfile = () => {
  expect(screen.getByText('Demo User')).toBeInTheDocument();
  expect(screen.getByText('demo@example.com')).toBeInTheDocument();
};

/**
 * Assert component visibility based on isOpen prop
 */
export const assertComponentVisibility = (
  Component: React.ComponentType<any>,
  identifier: string,
  isOpen: boolean
) => {
  const expectMethod = isOpen ? 'toBeInTheDocument' : 'not.toBeInTheDocument';
  expect(screen.queryByText(identifier))[expectMethod]();
};

/**
 * Assert navigation items are present with correct order
 */
export const assertNavigationItems = (expectedItems: string[]) => {
  expectedItems.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument();
  });
};

/**
 * Assert active navigation state
 */
export const assertActiveNavigation = (
  activeItemText: string,
  activeClasses = ['bg-primary', 'text-primary-foreground']
) => {
  const activeLink = screen.getByText(activeItemText).closest('a');
  expect(activeLink).toHaveClass(...activeClasses);
  return activeLink;
};

/**
 * Assert inactive navigation state
 */
export const assertInactiveNavigation = (
  itemText: string,
  inactiveClasses = ['text-muted-foreground']
) => {
  const inactiveLink = screen.getByText(itemText).closest('a');
  expect(inactiveLink).toHaveClass(...inactiveClasses);
  expect(inactiveLink).not.toHaveClass('bg-primary');
  return inactiveLink;
};
