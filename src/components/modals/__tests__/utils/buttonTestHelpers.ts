import userEvent from '@testing-library/user-event';
import { screen } from '../test-utils';

// Button interaction testing utilities
export const testButtonClick = async (
  buttonText: string,
  expectedCallback: jest.Mock,
  expectedArgs?: any[]
) => {
  const user = userEvent.setup();
  const button = screen.getByText(buttonText);
  await user.click(button);

  if (expectedArgs) {
    expect(expectedCallback).toHaveBeenCalledWith(...expectedArgs);
  } else {
    expect(expectedCallback).toHaveBeenCalled();
  }
};

export const testButtonNotCalled = async (
  buttonText: string,
  callback: jest.Mock
) => {
  const user = userEvent.setup();
  const button = screen.getByText(buttonText);
  await user.click(button);

  expect(callback).not.toHaveBeenCalled();
};

export const assertButtonState = (text: string, disabled: boolean) => {
  const button = screen.getByText(text);
  if (disabled) {
    expect(button).toBeDisabled();
  } else {
    expect(button).not.toBeDisabled();
  }
};

export const testLoadingButtons = () => {
  assertButtonState('Confirm', true);
  assertButtonState('Cancel', true);
};

export const testEnabledButtons = () => {
  assertButtonState('Confirm', false);
  assertButtonState('Cancel', false);
};
