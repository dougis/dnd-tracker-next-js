import { fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  createDefaultProps,
  createPropsWithErrors,
  createLoadingProps,
  renderProfileSection,
  expectFormElement,
  expectErrorMessage,
  expectSubmitButton,
  fireInputChange,
  fireFormSubmit,
} from './profile-test-helpers';

describe('ProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render profile section with correct title', () => {
      renderProfileSection();

      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Update your personal information and account details')).toBeInTheDocument();
    });

    it('should render name and email inputs', () => {
      renderProfileSection();

      expectFormElement('Name');
      expectFormElement('Email');
    });

    it('should render submit button', () => {
      renderProfileSection();

      expectSubmitButton('Save Profile');
    });
  });

  describe('Form Values', () => {
    it('should display current profile data', () => {
      renderProfileSection();

      expectFormElement('Name', 'Test User');
      expectFormElement('Email', 'test@example.com');
    });

    it('should handle name input change', () => {
      const props = createDefaultProps();
      renderProfileSection(props);

      fireInputChange('Name', 'Updated Name');

      expect(props.setProfileData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should handle email input change', () => {
      const props = createDefaultProps();
      renderProfileSection(props);

      fireInputChange('Email', 'updated@example.com');

      expect(props.setProfileData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Form Validation', () => {
    it('should display name error', () => {
      const propsWithErrors = createPropsWithErrors({ name: 'Name is required' });

      renderProfileSection(propsWithErrors);

      expectErrorMessage('Name is required');
    });

    it('should display email error', () => {
      const propsWithErrors = createPropsWithErrors({ email: 'Please enter a valid email address' });

      renderProfileSection(propsWithErrors);

      expectErrorMessage('Please enter a valid email address');
    });

    it('should display multiple errors', () => {
      const propsWithErrors = createPropsWithErrors({
        name: 'Name is required',
        email: 'Please enter a valid email address',
      });

      renderProfileSection(propsWithErrors);

      expectErrorMessage('Name is required');
      expectErrorMessage('Please enter a valid email address');
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      const loadingProps = createLoadingProps();

      renderProfileSection(loadingProps);

      const nameInput = expectFormElement('Name');
      const emailInput = expectFormElement('Email');
      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      const loadingProps = createLoadingProps();

      renderProfileSection(loadingProps);

      expectSubmitButton('Saving...', true);
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', () => {
      const props = createDefaultProps();
      renderProfileSection(props);

      fireFormSubmit();

      expect(props.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when button is clicked', () => {
      const props = createDefaultProps();
      renderProfileSection(props);

      const submitButton = expectSubmitButton('Save Profile');
      fireEvent.click(submitButton);

      expect(props.onSubmit).toHaveBeenCalled();
    });
  });

  describe('Input Properties', () => {
    it('should have correct input types', () => {
      renderProfileSection();

      const emailInput = expectFormElement('Email');

      // Name input doesn't explicitly set type, defaults to text
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have correct input names', () => {
      renderProfileSection();

      const nameInput = expectFormElement('Name');
      const emailInput = expectFormElement('Email');

      expect(nameInput).toHaveAttribute('name', 'name');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    it('should have correct input ids', () => {
      renderProfileSection();

      const nameInput = expectFormElement('Name');
      const emailInput = expectFormElement('Email');

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('id', 'email');
    });
  });
});