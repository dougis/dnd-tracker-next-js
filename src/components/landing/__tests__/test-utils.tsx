import React from 'react';
import { render } from '@testing-library/react';

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

// Common mock for CTAButtons component
export const mockCTAButtons = (testId: string = 'button') => {
  jest.mock('../CTAButtons', () => ({
    CTAButtons: () => (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="btn" data-testid={testId}>
          <a href="/signup">Get Started Free</a>
        </div>
        <div className="btn outline" data-testid={testId}>
          <a href="/signin">Sign In</a>
        </div>
      </div>
    ),
  }));
};

// Common render helper
export const renderComponent = (Component: React.ComponentType) => {
  return render(<Component />);
};

// Common test helpers
export const getSection = (screen: any, headingLevel: number = 2) => {
  return screen.getByRole('heading', { level: headingLevel }).closest('section');
};

export const expectResponsiveLayout = (section: Element | null) => {
  expect(section).toHaveClass('container');
  expect(section).toHaveClass('mx-auto');
  expect(section).toHaveClass('px-4');
};

export const expectSemanticStructure = (section: Element | null) => {
  expect(section).toBeInTheDocument();
  expect(section?.tagName.toLowerCase()).toBe('section');
};