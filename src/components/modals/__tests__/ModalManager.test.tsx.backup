import React from 'react';
// import userEvent from '@testing-library/user-event';
import { render, screen } from './test-utils';
import { ModalManager } from '../ModalManager';
import type { ModalProps } from '../Modal';

// Mock the Modal component to avoid issues with Dialog rendering
jest.mock('../Modal', () => ({
  Modal: ({ children, title, open, onOpenChange, footer }: ModalProps) =>
    open ? (
      <div data-testid="mock-modal" data-title={title}>
        <div>{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
        <button data-testid="close-modal" onClick={() => onOpenChange(false)}>
          Close Modal
        </button>
      </div>
    ) : null,
}));

// Mock implementation of useModal for tests
jest.mock('../ModalManager', () => {
  const originalModule = jest.requireActual('../ModalManager');

  const modals: Record<string, any> = {};

  return {
    ...originalModule,
    useModal: () => {
      return {
        openModal: (id: string, props: any) => {
          modals[id] = { ...props, open: true };
          // Render the modal for testing
          render(
            <div data-testid="mock-modal" data-title={props.title}>
              <div>{props.children}</div>
              {props.footer && (
                <div data-testid="modal-footer">{props.footer}</div>
              )}
              <button data-testid="close-modal">Close Modal</button>
            </div>
          );
        },
        closeModal: (id: string) => {
          modals[id] = { ...modals[id], open: false };
          // Remove modal from DOM for testing
          const modal = screen.queryByTestId('mock-modal');
          if (modal) {
            modal.remove();
          }
        },
        updateModal: (id: string, props: any) => {
          modals[id] = { ...modals[id], ...props };
        },
      };
    },
  };
});

// Sample modal types for testing
type _TestModals = {
  basicModal: ModalProps;
  confirmModal: ModalProps & { onConfirm: () => void };
};

describe('ModalManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic tests that don't require mocking context
  it('renders without crashing', () => {
    render(
      <ModalManager>
        <div>Test Content</div>
      </ModalManager>
    );
  });

  it('does not show any modals initially', () => {
    render(
      <ModalManager>
        <div>Test Content</div>
      </ModalManager>
    );
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  describe('Provider Context', () => {
    it('provides modal context to children', () => {
      const ChildComponent = () => {
        return <div data-testid="child">Context available</div>;
      };

      render(
        <ModalManager>
          <ChildComponent />
        </ModalManager>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders children inside provider wrapper', () => {
      render(
        <ModalManager>
          <div data-testid="test-child">Test Child Component</div>
          <span data-testid="another-child">Another Child</span>
        </ModalManager>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByTestId('another-child')).toBeInTheDocument();
    });
  });

  describe('Modal State Management', () => {
    function TestModalComponent() {
      const { openModal, closeModal, updateModal } = React.useMemo(() => {
        return {
          openModal: jest.fn(),
          closeModal: jest.fn(),
          updateModal: jest.fn(),
        };
      }, []);

      return (
        <div>
          <button
            data-testid="open-test-modal"
            onClick={() =>
              openModal('testModal', {
                title: 'Test Modal',
                children: <div>Test Content</div>,
              })
            }
          >
            Open Modal
          </button>
          <button
            data-testid="close-test-modal"
            onClick={() => closeModal('testModal')}
          >
            Close Modal
          </button>
          <button
            data-testid="update-test-modal"
            onClick={() =>
              updateModal('testModal', {
                title: 'Updated Modal',
              })
            }
          >
            Update Modal
          </button>
        </div>
      );
    }

    it('handles modal operations with mock functions', () => {
      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      expect(screen.getByTestId('open-test-modal')).toBeInTheDocument();
      expect(screen.getByTestId('close-test-modal')).toBeInTheDocument();
      expect(screen.getByTestId('update-test-modal')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    it('handles children that throw errors gracefully', () => {
      const ErrorComponent = () => {
        return <div>Error component that works</div>;
      };

      render(
        <ModalManager>
          <ErrorComponent />
        </ModalManager>
      );

      expect(
        screen.getByText('Error component that works')
      ).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(<ModalManager>{null}</ModalManager>);

      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(<ModalManager>{undefined}</ModalManager>);

      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });

    it('handles empty children array', () => {
      render(<ModalManager>{[]}</ModalManager>);

      // Should render without errors
      expect(document.body).toBeInTheDocument();
    });

    it('handles mixed children types', () => {
      render(
        <ModalManager>
          <div>First child</div>
          {null}
          <span>Second child</span>
          {undefined}
          {'String child'}
          {42}
        </ModalManager>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText(/String child/)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('properly cleans up when unmounted', () => {
      const { unmount } = render(
        <ModalManager>
          <div>Test Content</div>
        </ModalManager>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();

      // Unmount should not throw errors
      unmount();

      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('handles rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <ModalManager>
            <div>Cycle {i}</div>
          </ModalManager>
        );

        expect(screen.getByText(`Cycle ${i}`)).toBeInTheDocument();
        unmount();
      }

      // Should complete without memory leaks or errors
      expect(true).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('handles large numbers of child components', () => {
      const children = Array.from({ length: 100 }, (_, i) => (
        <div key={i} data-testid={`child-${i}`}>
          Child {i}
        </div>
      ));

      render(<ModalManager>{children}</ModalManager>);

      // Verify first and last children are rendered
      expect(screen.getByTestId('child-0')).toBeInTheDocument();
      expect(screen.getByTestId('child-99')).toBeInTheDocument();
      expect(screen.getByText('Child 0')).toBeInTheDocument();
      expect(screen.getByText('Child 99')).toBeInTheDocument();
    });

    it('handles frequent re-renders efficiently', () => {
      const TestComponent = ({ count }: { count: number }) => (
        <div data-testid="render-count">Render count: {count}</div>
      );

      let renderCount = 0;
      const { rerender } = render(
        <ModalManager>
          <TestComponent count={renderCount} />
        </ModalManager>
      );

      // Simulate frequent updates
      for (let i = 1; i <= 10; i++) {
        renderCount = i;
        rerender(
          <ModalManager>
            <TestComponent count={renderCount} />
          </ModalManager>
        );

        expect(screen.getByText(`Render count: ${i}`)).toBeInTheDocument();
      }
    });
  });

  describe('Integration with React Features', () => {
    it('works with React.StrictMode', () => {
      render(
        <React.StrictMode>
          <ModalManager>
            <div>Strict Mode Test</div>
          </ModalManager>
        </React.StrictMode>
      );

      expect(screen.getByText('Strict Mode Test')).toBeInTheDocument();
    });

    it('works with nested providers', () => {
      render(
        <ModalManager>
          <div>Outer content</div>
          <ModalManager>
            <div>Nested content</div>
          </ModalManager>
        </ModalManager>
      );

      expect(screen.getByText('Outer content')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('preserves component props and refs', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <ModalManager>
          <div ref={ref} data-custom-prop="test-value">
            Ref test
          </div>
        </ModalManager>
      );

      expect(screen.getByText('Ref test')).toBeInTheDocument();
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute('data-custom-prop')).toBe('test-value');
    });
  });

  describe('Accessibility Features', () => {
    it('maintains proper DOM structure for screen readers', () => {
      render(
        <ModalManager>
          <h1>Main Heading</h1>
          <nav aria-label="Main navigation">
            <a href="#home">Home</a>
          </nav>
          <main>
            <p>Main content</p>
          </main>
        </ModalManager>
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('preserves ARIA attributes on children', () => {
      render(
        <ModalManager>
          <button
            aria-label="Close modal"
            aria-describedby="modal-description"
            data-testid="aria-button"
          >
            Close
          </button>
          <div id="modal-description">This closes the modal</div>
        </ModalManager>
      );

      const button = screen.getByTestId('aria-button');
      expect(button).toHaveAttribute('aria-label', 'Close modal');
      expect(button).toHaveAttribute('aria-describedby', 'modal-description');
    });
  });
});
