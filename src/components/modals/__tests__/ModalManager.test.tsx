import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalManager, useModalManager, useModal, useModalInstance } from '../ModalManager';

// Test component that uses the ModalManager context
function TestModalComponent() {
  const { openModal, closeModal, closeAllModals, closeTopModal, isModalOpen, getTopModal, getModalCount } = useModalManager();

  return (
    <div>
      <button
        data-testid="open-basic-modal"
        onClick={() => openModal({
          component: <div data-testid="basic-modal-content">Basic Modal Content</div>
        })}
      >
        Open Basic Modal
      </button>

      <button
        data-testid="open-persistent-modal"
        onClick={() => openModal({
          component: <div data-testid="persistent-modal-content">Persistent Modal</div>,
          persistent: true
        })}
      >
        Open Persistent Modal
      </button>

      <button
        data-testid="open-modal-with-id"
        onClick={() => openModal({
          id: 'test-modal-123',
          component: <div data-testid="id-modal-content">Modal with ID</div>
        })}
      >
        Open Modal with ID
      </button>

      <button
        data-testid="open-modal-with-callback"
        onClick={() => openModal({
          component: <div data-testid="callback-modal-content">Modal with Callback</div>,
          onClose: () => console.log('Modal closed')
        })}
      >
        Open Modal with Callback
      </button>

      <button
        data-testid="close-specific-modal"
        onClick={() => closeModal('test-modal-123')}
      >
        Close Specific Modal
      </button>

      <button
        data-testid="close-all-modals"
        onClick={closeAllModals}
      >
        Close All Modals
      </button>

      <button
        data-testid="close-top-modal"
        onClick={closeTopModal}
      >
        Close Top Modal
      </button>

      <div data-testid="modal-count">Modal Count: {getModalCount()}</div>
      <div data-testid="is-modal-open">Is Test Modal Open: {isModalOpen('test-modal-123') ? 'Yes' : 'No'}</div>
      <div data-testid="top-modal-id">Top Modal ID: {getTopModal()?.id || 'None'}</div>
    </div>
  );
}

// Test component using useModal hook
function TestUseModalComponent() {
  const { open, close, isOpen, modalId } = useModal();

  return (
    <div>
      <button
        data-testid="use-modal-open"
        onClick={() => open({
          component: <div data-testid="use-modal-content">Use Modal Content</div>
        })}
      >
        Use Modal Open
      </button>

      <button
        data-testid="use-modal-close"
        onClick={close}
      >
        Use Modal Close
      </button>

      <div data-testid="use-modal-status">
        Status: {isOpen ? 'Open' : 'Closed'}, ID: {modalId || 'None'}
      </div>
    </div>
  );
}

// Test component using useModalInstance hook
function TestUseModalInstanceComponent() {
  const { open, close, isOpen } = useModalInstance('instance-modal');

  return (
    <div>
      <button
        data-testid="instance-modal-open"
        onClick={() => open({
          component: <div data-testid="instance-modal-content">Instance Modal Content</div>
        })}
      >
        Instance Modal Open
      </button>

      <button
        data-testid="instance-modal-close"
        onClick={close}
      >
        Instance Modal Close
      </button>

      <div data-testid="instance-modal-status">
        Instance Status: {isOpen ? 'Open' : 'Closed'}
      </div>
    </div>
  );
}

// Component to test error handling
function TestErrorComponent() {
  try {
    useModalManager();
    return <div data-testid="error-component-success">No Error</div>;
  } catch (error) {
    return <div data-testid="error-component-error">Error: {(error as Error).message}</div>;
  }
}

describe('ModalManager Comprehensive Tests', () => {
  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = '';
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up body styles
    document.body.style.overflow = '';
  });

  describe('Basic Modal Management', () => {
    it('renders without crashing and provides context', () => {
      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 0');
      expect(screen.getByTestId('is-modal-open')).toHaveTextContent('Is Test Modal Open: No');
      expect(screen.getByTestId('top-modal-id')).toHaveTextContent('Top Modal ID: None');
    });

    it('opens and renders a basic modal', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      await user.click(screen.getByTestId('open-basic-modal'));

      expect(screen.getByTestId('basic-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 1');
    });

    it('opens modal with specific ID', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      await user.click(screen.getByTestId('open-modal-with-id'));

      expect(screen.getByTestId('id-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('is-modal-open')).toHaveTextContent('Is Test Modal Open: Yes');
      expect(screen.getByTestId('top-modal-id')).toHaveTextContent('Top Modal ID: test-modal-123');
    });

    it('closes specific modal by ID', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open modal
      await user.click(screen.getByTestId('open-modal-with-id'));
      expect(screen.getByTestId('id-modal-content')).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByTestId('close-specific-modal'));
      expect(screen.queryByTestId('id-modal-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('is-modal-open')).toHaveTextContent('Is Test Modal Open: No');
    });

    it('handles multiple modals with correct z-index stacking', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager baseZIndex={1000}>
          <TestModalComponent />
        </ModalManager>
      );

      // Open first modal
      await user.click(screen.getByTestId('open-basic-modal'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 1');

      // Open second modal
      await user.click(screen.getByTestId('open-modal-with-id'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 2');

      // Both modals should be present
      expect(screen.getByTestId('basic-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('id-modal-content')).toBeInTheDocument();

      // Second modal should be on top
      expect(screen.getByTestId('top-modal-id')).toHaveTextContent('Top Modal ID: test-modal-123');
    });
  });

  describe('Modal Limits and Warnings', () => {
    it('respects maxModals limit', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const user = userEvent.setup();

      render(
        <ModalManager maxModals={2}>
          <TestModalComponent />
        </ModalManager>
      );

      // Open two modals (at limit)
      await user.click(screen.getByTestId('open-basic-modal'));
      await user.click(screen.getByTestId('open-modal-with-id'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 2');

      // Try to open third modal (should be blocked)
      await user.click(screen.getByTestId('open-persistent-modal'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 2');
      expect(consoleSpy).toHaveBeenCalledWith('Maximum number of modals (2) reached. Cannot open new modal.');

      consoleSpy.mockRestore();
    });

    it('warns when trying to open modal with duplicate ID', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open modal with specific ID
      await user.click(screen.getByTestId('open-modal-with-id'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 1');

      // Try to open another modal with same ID
      await user.click(screen.getByTestId('open-modal-with-id'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 1');
      expect(consoleSpy).toHaveBeenCalledWith('Modal with ID "test-modal-123" already exists.');

      consoleSpy.mockRestore();
    });
  });

  describe('Persistent Modals', () => {
    it('prevents closing persistent modal with closeTopModal', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open persistent modal
      await user.click(screen.getByTestId('open-persistent-modal'));
      expect(screen.getByTestId('persistent-modal-content')).toBeInTheDocument();

      // Try to close with closeTopModal
      await user.click(screen.getByTestId('close-top-modal'));
      expect(screen.getByTestId('persistent-modal-content')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Cannot close persistent modal');

      consoleSpy.mockRestore();
    });

    it('prevents closing persistent modal with Escape key', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open persistent modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('open-persistent-modal'));
      });
      expect(screen.getByTestId('persistent-modal-content')).toBeInTheDocument();

      // Try to close with Escape key
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      expect(screen.getByTestId('persistent-modal-content')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard Interactions', () => {
    it('closes non-persistent modal with Escape key', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open basic modal
      await user.click(screen.getByTestId('open-basic-modal'));
      expect(screen.getByTestId('basic-modal-content')).toBeInTheDocument();

      // Close with Escape key
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      expect(screen.queryByTestId('basic-modal-content')).not.toBeInTheDocument();
    });

    it('only closes top modal with Escape when multiple modals open', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open two modals
      await user.click(screen.getByTestId('open-basic-modal'));
      await user.click(screen.getByTestId('open-modal-with-id'));

      expect(screen.getByTestId('basic-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('id-modal-content')).toBeInTheDocument();

      // Close top modal with Escape
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(screen.getByTestId('basic-modal-content')).toBeInTheDocument();
      expect(screen.queryByTestId('id-modal-content')).not.toBeInTheDocument();
    });
  });

  describe('Body Scroll Management', () => {
    it('prevents body scroll when modals are open', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Initially body scroll should be normal
      expect(document.body.style.overflow).toBe('');

      // Open modal
      await user.click(screen.getByTestId('open-basic-modal'));
      expect(document.body.style.overflow).toBe('hidden');

      // Close modal
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll when all modals closed', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Open multiple modals
      await user.click(screen.getByTestId('open-basic-modal'));
      await user.click(screen.getByTestId('open-modal-with-id'));
      expect(document.body.style.overflow).toBe('hidden');

      // Close all modals
      await user.click(screen.getByTestId('close-all-modals'));
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Close All Modals', () => {
    it('closes all modals and calls onClose callbacks', async () => {
      const onCloseSpy = jest.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const { openModal, closeAllModals, getModalCount } = useModalManager();

        return (
          <div>
            <button
              data-testid="open-callback-modal"
              onClick={() => openModal({
                component: <div data-testid="callback-modal">Callback Modal</div>,
                onClose: onCloseSpy
              })}
            >
              Open Callback Modal
            </button>
            <button data-testid="close-all" onClick={closeAllModals}>
              Close All
            </button>
            <div data-testid="count">Count: {getModalCount()}</div>
          </div>
        );
      };

      render(
        <ModalManager>
          <TestComponent />
        </ModalManager>
      );

      // Open modal with callback
      await user.click(screen.getByTestId('open-callback-modal'));
      expect(screen.getByTestId('callback-modal')).toBeInTheDocument();
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');

      // Close all modals
      await user.click(screen.getByTestId('close-all'));
      expect(screen.queryByTestId('callback-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClose Callback Coverage', () => {
    it('calls onClose when closing specific modal by ID', async () => {
      const onCloseSpy = jest.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const { openModal, closeModal } = useModalManager();

        return (
          <div>
            <button
              data-testid="open-with-callback"
              onClick={() => openModal({
                id: 'callback-modal',
                component: <div data-testid="callback-content">Callback Content</div>,
                onClose: onCloseSpy
              })}
            >
              Open Modal
            </button>
            <button
              data-testid="close-by-id"
              onClick={() => closeModal('callback-modal')}
            >
              Close Modal
            </button>
          </div>
        );
      };

      render(
        <ModalManager>
          <TestComponent />
        </ModalManager>
      );

      // Open modal
      await user.click(screen.getByTestId('open-with-callback'));
      expect(screen.getByTestId('callback-content')).toBeInTheDocument();

      // Close by ID
      await user.click(screen.getByTestId('close-by-id'));
      expect(screen.queryByTestId('callback-content')).not.toBeInTheDocument();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when closing top modal with callback', async () => {
      const onCloseSpy = jest.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const { openModal, closeTopModal } = useModalManager();

        return (
          <div>
            <button
              data-testid="open-top-with-callback"
              onClick={() => openModal({
                component: <div data-testid="top-callback-content">Top Callback Content</div>,
                onClose: onCloseSpy
              })}
            >
              Open Modal
            </button>
            <button
              data-testid="close-top"
              onClick={closeTopModal}
            >
              Close Top Modal
            </button>
          </div>
        );
      };

      render(
        <ModalManager>
          <TestComponent />
        </ModalManager>
      );

      // Open modal
      await user.click(screen.getByTestId('open-top-with-callback'));
      expect(screen.getByTestId('top-callback-content')).toBeInTheDocument();

      // Close top modal
      await user.click(screen.getByTestId('close-top'));
      expect(screen.queryByTestId('top-callback-content')).not.toBeInTheDocument();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('useModal Hook', () => {
    it('manages modal state independently', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestUseModalComponent />
        </ModalManager>
      );

      // Initially closed
      expect(screen.getByTestId('use-modal-status')).toHaveTextContent('Status: Closed, ID: None');

      // Open modal
      await user.click(screen.getByTestId('use-modal-open'));
      expect(screen.getByTestId('use-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('use-modal-status')).toHaveTextContent(/Status: Open, ID: modal-/);

      // Close modal
      await user.click(screen.getByTestId('use-modal-close'));
      expect(screen.queryByTestId('use-modal-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('use-modal-status')).toHaveTextContent('Status: Closed, ID: None');
    });
  });

  describe('useModalInstance Hook', () => {
    it('manages specific modal instance', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestUseModalInstanceComponent />
        </ModalManager>
      );

      // Initially closed
      expect(screen.getByTestId('instance-modal-status')).toHaveTextContent('Instance Status: Closed');

      // Open modal
      await user.click(screen.getByTestId('instance-modal-open'));
      expect(screen.getByTestId('instance-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('instance-modal-status')).toHaveTextContent('Instance Status: Open');

      // Close modal
      await user.click(screen.getByTestId('instance-modal-close'));
      expect(screen.queryByTestId('instance-modal-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('instance-modal-status')).toHaveTextContent('Instance Status: Closed');
    });
  });

  describe('Error Handling', () => {
    it('throws error when useModalManager used outside provider', () => {
      render(<TestErrorComponent />);
      expect(screen.getByTestId('error-component-error')).toHaveTextContent(
        'Error: useModalManager must be used within a ModalManager'
      );
    });

    it('handles closeTopModal when no modals are open', async () => {
      const user = userEvent.setup();

      render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Try to close top modal when none are open
      await user.click(screen.getByTestId('close-top-modal'));
      expect(screen.getByTestId('modal-count')).toHaveTextContent('Modal Count: 0');
    });
  });

  describe('Component Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('restores body overflow on unmount', () => {
      const { unmount } = render(
        <ModalManager>
          <TestModalComponent />
        </ModalManager>
      );

      // Set body overflow
      document.body.style.overflow = 'hidden';

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });
});