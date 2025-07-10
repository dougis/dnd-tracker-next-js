import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSection } from '../ProfileSection';

export const createDefaultProps = () => ({
  profileData: {
    name: 'Test User',
    email: 'test@example.com',
  },
  setProfileData: jest.fn(),
  formErrors: {},
  isLoadingProfile: false,
  onSubmit: jest.fn(),
});

export const createPropsWithErrors = (errors: { name?: string; email?: string }) => ({
  ...createDefaultProps(),
  formErrors: errors,
});

export const createLoadingProps = () => ({
  ...createDefaultProps(),
  isLoadingProfile: true,
});

export const renderProfileSection = (props = createDefaultProps()) => {
  return render(<ProfileSection {...props} />);
};

export const expectFormElement = (labelText: string, value?: string) => {
  const element = screen.getByLabelText(labelText);
  expect(element).toBeInTheDocument();
  if (value) {
    expect(element).toHaveDisplayValue(value);
  }
  return element;
};

export const expectErrorMessage = (message: string) => {
  expect(screen.getByText(message)).toBeInTheDocument();
};

export const expectSubmitButton = (text: string, shouldBeDisabled = false) => {
  const button = screen.getByRole('button', { name: text });
  expect(button).toBeInTheDocument();
  if (shouldBeDisabled) {
    expect(button).toBeDisabled();
  }
  return button;
};

export const fireInputChange = (labelText: string, value: string) => {
  const input = screen.getByLabelText(labelText);
  fireEvent.change(input, { target: { value } });
  return input;
};

export const fireFormSubmit = () => {
  const form = screen.getByRole('button', { name: /save profile|saving/i }).closest('form');
  fireEvent.submit(form!);
};