import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import { defaultCharacterPreviewProps } from './helpers/CharacterPreview.helpers';

describe('CharacterPreview - Basic Information', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Information Display', () => {
    it('displays character name', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    it('displays unnamed character fallback', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, name: '' },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Unnamed Character')).toBeInTheDocument();
    });

    it('displays player character type', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Player Character')).toBeInTheDocument();
    });

    it('displays NPC type', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, type: 'npc' as const },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('NPC')).toBeInTheDocument();
    });

    it('displays race information', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Human')).toBeInTheDocument();
    });

    it('displays custom race when specified', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: {
          ...defaultCharacterPreviewProps.basicInfo,
          race: 'custom' as const,
          customRace: 'Dragonborn'
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Dragonborn')).toBeInTheDocument();
    });

    it('formats race with proper capitalization', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, race: 'half-elf' as const },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Half-Elf')).toBeInTheDocument();
    });

    it('formats races with hyphens correctly', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, race: 'half-orc' as const },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Half-Orc')).toBeInTheDocument();
    });

    it('handles very long character names', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: {
          ...defaultCharacterPreviewProps.basicInfo,
          name: 'A'.repeat(100)
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: {
          name: 'Test',
          type: 'pc' as const,
          race: 'human' as const,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Human')).toBeInTheDocument();
    });
  });
});