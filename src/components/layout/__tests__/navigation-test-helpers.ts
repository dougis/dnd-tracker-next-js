/**
 * Navigation-specific test helpers for layout components
 * Centralizes common navigation testing patterns
 */

import { fireEvent, render } from '@testing-library/react';
import { mockUsePathname } from './test-utils';
import { assertNavigationLink, assertActiveNavigation, assertInactiveNavigation } from './shared-assertions';

/**
 * Standard navigation items used across components
 */
export const NAVIGATION_ITEMS = [
  { text: 'Dashboard', href: '/' },
  { text: 'Characters', href: '/characters' },
  { text: 'Parties', href: '/parties' },
  { text: 'Encounters', href: '/encounters' },
  { text: 'Combat', href: '/combat' },
  { text: 'Settings', href: '/settings' }
];

/**
 * Test all navigation links have correct href attributes
 */
export const testNavigationLinks = () => {
  NAVIGATION_ITEMS.forEach(item => {
    assertNavigationLink(item.text, item.href);
  });
};

/**
 * Test active navigation state for a given path
 */
export const testActiveNavigationState = (Component: React.ComponentType<any>, path: string, props = {}) => {
  mockUsePathname.mockReturnValue(path);
  render(React.createElement(Component, props));
  
  const activeItem = NAVIGATION_ITEMS.find(item => item.href === path);
  if (activeItem) {
    assertActiveNavigation(activeItem.text);
    
    // Assert other items are inactive
    NAVIGATION_ITEMS.filter(item => item.href !== path).forEach(item => {
      assertInactiveNavigation(item.text);
    });
  }
};

/**
 * Test that clicking navigation link calls expected callback
 */
export const testNavigationLinkClick = (linkText: string, expectedCallback: jest.Mock) => {
  const link = assertNavigationLink(linkText, '#'); // href doesn't matter for click test
  fireEvent.click(link);
  expect(expectedCallback).toHaveBeenCalledTimes(1);
};

/**
 * Test root path special case (Dashboard active for '/')
 */
export const testRootPathActiveState = (Component: React.ComponentType<any>, props = {}) => {
  testActiveNavigationState(Component, '/', props);
};

/**
 * Get navigation item by path
 */
export const getNavigationItemByPath = (path: string) => {
  return NAVIGATION_ITEMS.find(item => item.href === path);
};