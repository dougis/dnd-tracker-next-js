import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import {
  defaultCharacterPreviewProps,
  createMulticlassProps,
  createSingleClassProps
} from './helpers/CharacterPreview.helpers';

describe('CharacterPreview - Classes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Classes Display', () => {
    it('displays single class with level', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Ranger')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('displays multiple classes', () => {
      const props = createMulticlassProps([
        { className: 'fighter', level: 3 },
        { className: 'rogue', level: 2 },
      ]);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Rogue')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });

    it('displays total level correctly', () => {
      const props = createMulticlassProps([
        { className: 'fighter', level: 3 },
        { className: 'rogue', level: 2 },
      ]);
      render(<CharacterPreview {...props} />);

      // Find the total level badge (should be 5)
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('formats class names with proper capitalization', () => {
      const props = createSingleClassProps('paladin', 1);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Paladin')).toBeInTheDocument();
    });

    it('handles empty classes array', () => {
      const props = createMulticlassProps([]);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Classes')).toBeInTheDocument(); // Should show Classes section
      expect(screen.getByText('0')).toBeInTheDocument(); // Total level should be 0
    });

    it('handles complex multiclass scenarios', () => {
      const props = createMulticlassProps([
        { className: 'fighter', level: 5 },
        { className: 'wizard', level: 3 },
        { className: 'rogue', level: 2 },
      ]);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.getByText('Wizard')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Rogue')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total level
    });
  });
});