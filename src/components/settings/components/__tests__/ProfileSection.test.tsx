import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSection } from '../ProfileSection';
import '@testing-library/jest-dom';

const defaultProps = {
  profileData: {
    name: 'Test User',
    email: 'test@example.com',
  },
  setProfileData: jest.fn(),
  formErrors: {},
  isLoadingProfile: false,
  onSubmit: jest.fn(),
};

describe('ProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render profile section with correct title', () => {
      render(<ProfileSection {...defaultProps} />);

      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Update your personal information and account details')).toBeInTheDocument();
    });

    it('should render name and email inputs', () => {
      render(<ProfileSection {...defaultProps} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ProfileSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Save Profile' })).toBeInTheDocument();
    });
  });

  describe('Form Values', () => {
    it('should display current profile data', () => {
      render(<ProfileSection {...defaultProps} />);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('should handle name input change', () => {
      render(<ProfileSection {...defaultProps} />);

      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      expect(defaultProps.setProfileData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should handle email input change', () => {
      render(<ProfileSection {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

      expect(defaultProps.setProfileData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Form Validation', () => {
    it('should display name error', () => {
      const propsWithErrors = {
        ...defaultProps,
        formErrors: { name: 'Name is required' },
      };

      render(<ProfileSection {...propsWithErrors} />);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('should display email error', () => {
      const propsWithErrors = {
        ...defaultProps,
        formErrors: { email: 'Please enter a valid email address' },
      };

      render(<ProfileSection {...propsWithErrors} />);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should display multiple errors', () => {
      const propsWithErrors = {
        ...defaultProps,
        formErrors: {
          name: 'Name is required',
          email: 'Please enter a valid email address',
        },
      };

      render(<ProfileSection {...propsWithErrors} />);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      const loadingProps = {
        ...defaultProps,
        isLoadingProfile: true,
      };

      render(<ProfileSection {...loadingProps} />);

      expect(screen.getByLabelText('Name')).toBeDisabled();
      expect(screen.getByLabelText('Email')).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      const loadingProps = {
        ...defaultProps,
        isLoadingProfile: true,
      };

      render(<ProfileSection {...loadingProps} />);

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', () => {
      render(<ProfileSection {...defaultProps} />);

      const form = screen.getByRole('button', { name: 'Save Profile' }).closest('form');
      fireEvent.submit(form!);

      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when button is clicked', () => {
      render(<ProfileSection {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Save Profile' });
      fireEvent.click(submitButton);

      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });
  });

  describe('Input Properties', () => {
    it('should have correct input types', () => {
      render(<ProfileSection {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');

      // Name input doesn't explicitly set type, defaults to text
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have correct input names', () => {
      render(<ProfileSection {...defaultProps} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      expect(nameInput).toHaveAttribute('name', 'name');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    it('should have correct input ids', () => {
      render(<ProfileSection {...defaultProps} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('id', 'email');
    });
  });
});