import '@testing-library/jest-dom';

// Extend Jest matchers to include jest-dom custom matchers
declare global {
  namespace _jest {
    interface _Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(_className: string): R;
      toHaveAttribute(_attr: string, _value?: string): R;
      toHaveTextContent(_text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeRequired(): R;
      toHaveValue(_value: string | number): R;
      toHaveDisplayValue(_value: string | string[]): R;
      toBeChecked(): R;
      toHaveFocus(): R;
      toHaveFormValues(_expectedValues: Record<string, any>): R;
      toHaveStyle(_css: string | Record<string, any>): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBePartiallyChecked(): R;
      toBeValid(): R;
      toHaveAccessibleDescription(_description?: string | RegExp): R;
      toHaveAccessibleName(_name?: string | RegExp): R;
      toHaveErrorMessage(_message?: string | RegExp): R;
    }
  }
}