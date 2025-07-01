/**
 * Shared mock implementations for layout component tests
 * Centralizes common mock patterns to eliminate duplication
 */

import React from 'react';

/**
 * Standard Next.js Link mock implementation
 * Used across multiple test files
 */
export const createMockLink = () => {
  return function MockLink({
    children,
    href,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
  }) {
    return React.createElement(
      'a',
      { href, className, onClick, ...props },
      children
    );
  };
};

/**
 * Mock Next.js navigation setup
 * Returns the mock function for usePathname
 */
export const setupNextNavigationMock = () => {
  const mockUsePathname = jest.fn();

  jest.mock('next/navigation', () => ({
    usePathname: mockUsePathname,
  }));

  return { mockUsePathname };
};

/**
 * Mock Next.js Link component setup
 */
export const setupNextLinkMock = () => {
  jest.mock('next/link', () => createMockLink());
};

/**
 * Combined setup for Next.js mocks
 */
export const setupNextJsMocks = () => {
  setupNextLinkMock();
  return setupNextNavigationMock();
};
