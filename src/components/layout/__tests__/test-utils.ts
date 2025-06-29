/**
 * Shared test utilities for layout component tests
 * Eliminates code duplication by centralizing common mocks, setup, and helpers
 */

import React from 'react';
import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';

// Mock functions type
export const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

/**
 * Standard test setup that most layout tests need
 */
export const setupLayoutTest = () => {
  const originalInnerWidth = window.innerWidth;
  const originalBodyStyle = document.body.style.overflow;

  return {
    originalInnerWidth,
    originalBodyStyle,
    cleanup: () => {
      // Reset window properties
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
      
      // Reset body style
      document.body.style.overflow = originalBodyStyle;
      
      // Clear all mocks
      jest.clearAllMocks();
    }
  };
};

/**
 * Mock window.innerWidth for responsive testing
 */
export const mockWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

/**
 * Standard beforeEach setup for navigation tests
 */
export const setupNavigationTest = (defaultPath = '/') => {
  mockUsePathname.mockReturnValue(defaultPath);
};

/**
 * Common component rendering with standard props
 */
export const renderWithDefaults = (Component: React.ComponentType<any>, props = {}) => {
  return render(React.createElement(Component, props));
};