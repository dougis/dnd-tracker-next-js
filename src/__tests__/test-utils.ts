import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Define a custom render method for tests
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };