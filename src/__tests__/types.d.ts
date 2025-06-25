import '@testing-library/jest-dom';

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace jest {
    // eslint-disable-next-line no-unused-vars
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(_className: string): R;
      toHaveValue(_value: string | number): R;
      toBeDisabled(): R;
      toHaveAttribute(_attr: string, value?: string): R;
    }
  }
}