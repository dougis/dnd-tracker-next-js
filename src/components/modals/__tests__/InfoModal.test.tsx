import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from './test-utils';
import {
  InfoModal,
  CharacterInfoModal,
  EncounterInfoModal,
  CombatInfoModal,
  InfoSection,
  InfoField,
} from '../InfoModal';
import type { InfoModalProps } from '../InfoModal';

// Mock the Modal component
jest.mock('../Modal', () => ({
  Modal: ({
    children,
    footer,
    onOpenChange,
    open: _open,
    size,
    type,
    className,
  }: any) => (
    <div
      data-testid="modal"
      data-open={_open ? 'true' : 'false'}
      data-size={size}
      data-type={type}
      data-classname={className}
    >
      <div data-testid="modal-content">{children}</div>
      {footer && <div data-testid="modal-footer">{footer}</div>}
      <button data-testid="modal-close" onClick={() => onOpenChange(false)}>
        Close Modal
      </button>
    </div>
  ),
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span
      data-testid="badge"
      data-variant={variant}
      data-classname={className}
    >
      {children}
    </span>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Info: ({ className }: any) => (
    <div data-testid="info-icon" data-classname={className}>
      Info
    </div>
  ),
  FileText: ({ className }: any) => (
    <div data-testid="filetext-icon" data-classname={className}>
      FileText
    </div>
  ),
  User: ({ className }: any) => (
    <div data-testid="user-icon" data-classname={className}>
      User
    </div>
  ),
  Sword: ({ className }: any) => (
    <div data-testid="sword-icon" data-classname={className}>
      Sword
    </div>
  ),
}));

describe('InfoModal', () => {
  const defaultProps: InfoModalProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Test Info Modal',
    subtitle: 'Test subtitle',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with title and subtitle', () => {
      render(<InfoModal {...defaultProps} />);

      expect(screen.getByText('Test Info Modal')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');
    });

    it('renders without subtitle when not provided', () => {
      render(<InfoModal {...defaultProps} subtitle={undefined} />);

      expect(screen.getByText('Test Info Modal')).toBeInTheDocument();
      expect(screen.queryByText('Test subtitle')).not.toBeInTheDocument();
    });

    it('renders with default size and type', () => {
      render(<InfoModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'lg');
      expect(screen.getByTestId('modal')).toHaveAttribute('data-type', 'info');
    });

    it('renders with custom size', () => {
      render(<InfoModal {...defaultProps} size="xl" />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'xl');
    });

    it('applies custom className', () => {
      render(<InfoModal {...defaultProps} className="custom-class" />);

      expect(screen.getByTestId('modal')).toHaveAttribute(
        'data-classname',
        'custom-class'
      );
    });
  });

  describe('Type-specific Icons and Styling', () => {
    it('renders generic icon for default type', () => {
      render(<InfoModal {...defaultProps} type="generic" />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
      expect(screen.getByTestId('info-icon')).toHaveAttribute(
        'data-classname',
        'h-5 w-5 text-blue-600 dark:text-blue-400'
      );
    });

    it('renders character icon for character type', () => {
      render(<InfoModal {...defaultProps} type="character" />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-icon')).toHaveAttribute(
        'data-classname',
        'h-5 w-5 text-blue-600 dark:text-blue-400'
      );
    });

    it('renders encounter icon for encounter type', () => {
      render(<InfoModal {...defaultProps} type="encounter" />);

      expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
      expect(screen.getByTestId('filetext-icon')).toHaveAttribute(
        'data-classname',
        'h-5 w-5 text-green-600 dark:text-green-400'
      );
    });

    it('renders combat icon for combat type', () => {
      render(<InfoModal {...defaultProps} type="combat" />);

      expect(screen.getByTestId('sword-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sword-icon')).toHaveAttribute(
        'data-classname',
        'h-5 w-5 text-red-600 dark:text-red-400'
      );
    });

    it('renders correct badge colors for each type', () => {
      const { rerender } = render(
        <InfoModal {...defaultProps} type="character" />
      );

      let badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute(
        'data-classname',
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      );

      rerender(<InfoModal {...defaultProps} type="encounter" />);
      badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute(
        'data-classname',
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      );

      rerender(<InfoModal {...defaultProps} type="combat" />);
      badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute(
        'data-classname',
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      );

      rerender(<InfoModal {...defaultProps} type="generic" />);
      badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute(
        'data-classname',
        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      );
    });

    it('displays type as badge text', () => {
      render(<InfoModal {...defaultProps} type="character" />);

      expect(screen.getByTestId('badge')).toHaveTextContent('character');
    });
  });

  describe('Data Display', () => {
    it('renders data fields when data is provided', () => {
      const data = {
        name: 'Test Character',
        level: 5,
        class: 'Fighter',
        hitPoints: 45,
      };

      render(<InfoModal {...defaultProps} data={data} />);

      expect(screen.getByText('Name:')).toBeInTheDocument();
      expect(screen.getByText('Test Character')).toBeInTheDocument();
      expect(screen.getByText('Level:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Class:')).toBeInTheDocument();
      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Hit Points:')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('formats camelCase keys as readable labels', () => {
      const data = {
        hitPoints: 45,
        armorClass: 18,
        savingThrows: 'Str +5, Dex +2',
      };

      render(<InfoModal {...defaultProps} data={data} />);

      expect(screen.getByText('Hit Points:')).toBeInTheDocument();
      expect(screen.getByText('Armor Class:')).toBeInTheDocument();
      expect(screen.getByText('Saving Throws:')).toBeInTheDocument();
    });

    it('handles object values by stringifying them', () => {
      const data = {
        stats: { str: 16, dex: 14, con: 15 },
        abilities: ['Action Surge', 'Second Wind'],
      };

      render(<InfoModal {...defaultProps} data={data} />);

      expect(screen.getByText('Stats:')).toBeInTheDocument();
      expect(
        screen.getByText('{"str":16,"dex":14,"con":15}')
      ).toBeInTheDocument();
      expect(screen.getByText('Abilities:')).toBeInTheDocument();
      expect(
        screen.getByText('["Action Surge","Second Wind"]')
      ).toBeInTheDocument();
    });

    it('does not render data section when data is empty', () => {
      render(<InfoModal {...defaultProps} data={{}} />);

      expect(screen.queryByText(':')).not.toBeInTheDocument();
    });

    it('does not render data section when data is not provided', () => {
      render(<InfoModal {...defaultProps} />);

      expect(screen.queryByText(':')).not.toBeInTheDocument();
    });
  });

  describe('Custom Content and Actions', () => {
    it('renders custom children content', () => {
      const customContent = (
        <div>
          <p>Custom paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      );

      render(<InfoModal {...defaultProps}>{customContent}</InfoModal>);

      expect(screen.getByText('Custom paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders action buttons in footer', () => {
      const actions = (
        <>
          <button>Edit</button>
          <button>Delete</button>
        </>
      );

      render(<InfoModal {...defaultProps} actions={actions} />);

      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not render footer when no actions provided', () => {
      render(<InfoModal {...defaultProps} />);

      expect(screen.queryByTestId('modal-footer')).not.toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
    it('calls onOpenChange when modal is closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();

      render(<InfoModal {...defaultProps} onOpenChange={onOpenChange} />);

      const closeButton = screen.getByTestId('modal-close');
      await user.click(closeButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders when open prop is false', () => {
      render(<InfoModal {...defaultProps} open={false} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Responsive Layout', () => {
    it('renders data in responsive grid layout', () => {
      const data = {
        name: 'Test',
        level: 5,
        class: 'Fighter',
        hitPoints: 45,
      };

      render(<InfoModal {...defaultProps} data={data} />);

      const gridContainer = screen
        .getByText('Name:')
        .closest('.grid.grid-cols-1.md\\:grid-cols-2.gap-4');
      expect(gridContainer).toBeInTheDocument();
    });

    it('renders actions in responsive footer layout', () => {
      const actions = <button>Test Action</button>;

      render(<InfoModal {...defaultProps} actions={actions} />);

      const footer = screen.getByTestId('modal-footer');
      const footerContent = footer.querySelector('div');
      expect(footerContent).toHaveClass(
        'flex',
        'flex-col-reverse',
        'sm:flex-row',
        'sm:justify-end',
        'sm:space-x-2'
      );
    });
  });
});

describe('InfoSection Component', () => {
  it('renders section with title and children', () => {
    render(
      <InfoSection title="Test Section">
        <div>Section content</div>
      </InfoSection>
    );

    expect(screen.getByText('TEST SECTION')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <InfoSection title="Test" className="custom-section">
        <div>Content</div>
      </InfoSection>
    );

    const section = screen.getByText('TEST').closest('div');
    expect(section).toHaveClass('custom-section');
  });

  it('renders title in uppercase with tracking', () => {
    render(
      <InfoSection title="Character Stats">
        <div>Stats content</div>
      </InfoSection>
    );

    const title = screen.getByText('CHARACTER STATS');
    expect(title).toHaveClass(
      'text-sm',
      'font-semibold',
      'text-muted-foreground',
      'mb-2',
      'uppercase',
      'tracking-wide'
    );
  });
});

describe('InfoField Component', () => {
  it('renders label and value', () => {
    render(<InfoField label="Hit Points" value={45} />);

    expect(screen.getByText('Hit Points:')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<InfoField label="Name" value="Test Character" />);

    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Test Character')).toBeInTheDocument();
  });

  it('renders React node as value', () => {
    const value = <span style={{ color: 'red' }}>Special Value</span>;
    render(<InfoField label="Status" value={value} />);

    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Special Value')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InfoField label="Test" value="Value" className="custom-field" />);

    const field = screen.getByText('Test:').closest('div');
    expect(field).toHaveClass('custom-field');
  });

  it('applies proper responsive layout classes', () => {
    render(<InfoField label="Test" value="Value" />);

    const field = screen.getByText('Test:').closest('div');
    expect(field).toHaveClass(
      'flex',
      'justify-between',
      'items-center',
      'py-1'
    );
  });
});

describe('Convenience Components', () => {
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Test Modal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CharacterInfoModal', () => {
    it('renders with character type', () => {
      render(<CharacterInfoModal {...baseProps} />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent('character');
    });

    it('accepts all InfoModal props except type', () => {
      const data = { name: 'Test Character', level: 5 };
      render(
        <CharacterInfoModal
          {...baseProps}
          subtitle="Character details"
          data={data}
          size="xl"
        />
      );

      expect(screen.getByText('Character details')).toBeInTheDocument();
      expect(screen.getByText('Test Character')).toBeInTheDocument();
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'xl');
    });
  });

  describe('EncounterInfoModal', () => {
    it('renders with encounter type', () => {
      render(<EncounterInfoModal {...baseProps} />);

      expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent('encounter');
    });

    it('accepts all InfoModal props except type', () => {
      const data = { name: 'Goblin Ambush', difficulty: 'Easy' };
      render(
        <EncounterInfoModal
          {...baseProps}
          subtitle="Encounter details"
          data={data}
        />
      );

      expect(screen.getByText('Encounter details')).toBeInTheDocument();
      expect(screen.getByText('Goblin Ambush')).toBeInTheDocument();
    });
  });

  describe('CombatInfoModal', () => {
    it('renders with combat type', () => {
      render(<CombatInfoModal {...baseProps} />);

      expect(screen.getByTestId('sword-icon')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent('combat');
    });

    it('accepts all InfoModal props except type', () => {
      const data = { round: 3, initiative: 18 };
      render(
        <CombatInfoModal
          {...baseProps}
          subtitle="Combat status"
          data={data}
        />
      );

      expect(screen.getByText('Combat status')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});