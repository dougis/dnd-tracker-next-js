import '@testing-library/jest-dom';

declare global {
  namespace _jest {
    interface _Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(_className: string): R;
      toHaveValue(_value: string | number): R;
      toBeDisabled(): R;
      toHaveAttribute(_attr: string, _value?: string): R;
    }
  }
}
