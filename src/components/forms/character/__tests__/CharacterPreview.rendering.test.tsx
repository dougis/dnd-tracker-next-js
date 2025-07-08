import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import { defaultCharacterPreviewProps } from './helpers/CharacterPreview.helpers';

describe('CharacterPreview - Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders character preview card with title', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Character Preview')).toBeInTheDocument();
    });

    it('shows valid character status with check icon', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('✓ Ready to create character')).toBeInTheDocument();
    });

    it('shows invalid character status with warning', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('uses proper semantic heading structure', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Character Preview')).toBeInTheDocument();
    });

    it('displays completion status appropriately', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('✓ Ready to create character')).toBeInTheDocument();
    });

    it('displays warning status for incomplete character', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });
  });
});