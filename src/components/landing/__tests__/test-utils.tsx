import React from 'react';

// Common mock for next/link
export const mockNextLink = () => {
  jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
      return <a href={href}>{children}</a>;
    };
  });
};

// Common mock for Button component
export const mockButton = (testId: string = 'button') => {
  jest.mock('@/components/ui/button', () => ({
    Button: ({ children, size, variant, className }: any) => (
      <div
        className={`btn ${size || ''} ${variant || ''} ${className || ''}`}
        data-testid={testId}
      >
        {children}
      </div>
    ),
  }));
};

// Common test helpers
export const getSection = (screen: any, headingLevel: number = 2) => {
  return screen.getByRole('heading', { level: headingLevel }).closest('section');
};

export const expectResponsiveLayout = (section: Element | null) => {
  expect(section).toHaveClass('container', 'mx-auto', 'px-4');
};

export const expectSemanticStructure = (section: Element | null) => {
  expect(section).toBeInTheDocument();
  expect(section?.tagName.toLowerCase()).toBe('section');
};