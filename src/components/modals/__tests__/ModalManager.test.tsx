import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalManager, useModalManager, useModal } from '../ModalManager';

// Test component that uses the modal manager
function TestComponent() {
  const { openModal, closeAllModals, getModalCount } = useModalManager();

  const openTestModal = () => {
    openModal({
      component: <div>Test Modal Content</div>,
    });
  };

  const openSecondModal = () => {
    openModal({
      id: 'second-modal',
      component: <div>Second Modal Content</div>,
    });
  };

  return (
    <div>
      <button onClick={openTestModal}>Open Modal</button>
      <button onClick={openSecondModal}>Open Second Modal</button>
      <button onClick={closeAllModals}>Close All</button>
      <div data-testid="modal-count">{getModalCount()}</div>
    </div>
  );
}

function TestWithUseModal() {
  const { open, close, isOpen } = useModal();

  const openTestModal = () => {
    open({
      component: <div>Use Modal Content</div>,
    });
  };

  return (
    <div>
      <button onClick={openTestModal}>Open Modal</button>
      <button onClick={close}>Close Modal</button>
      <div data-testid="is-open">{isOpen ? 'open' : 'closed'}</div>
    </div>
  );
}

describe('ModalManager', () => {
  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  it('renders children correctly', () => {
    render(
      <ModalManager>
        <div>App Content</div>
      </ModalManager>
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('opens and closes modals correctly', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestComponent />
      </ModalManager>
    );

    // Initially no modals
    expect(screen.getByTestId('modal-count')).toHaveTextContent('0');

    // Open a modal
    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();
    expect(screen.getByTestId('modal-count')).toHaveTextContent('1');
  });

  it('manages multiple modals with stacking', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestComponent />
      </ModalManager>
    );

    // Open first modal
    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('1');

    // Open second modal
    await user.click(screen.getByText('Open Second Modal'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('2');

    // Both modals should be present
    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Second Modal Content')).toBeInTheDocument();
  });

  it('closes all modals when requested', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestComponent />
      </ModalManager>
    );

    // Open multiple modals
    await user.click(screen.getByText('Open Modal'));
    await user.click(screen.getByText('Open Second Modal'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('2');

    // Close all modals
    await user.click(screen.getByText('Close All'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('0');

    // Modals should be gone
    expect(screen.queryByText('Test Modal Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Second Modal Content')).not.toBeInTheDocument();
  });

  it('handles escape key to close top modal', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestComponent />
      </ModalManager>
    );

    // Open modals
    await user.click(screen.getByText('Open Modal'));
    await user.click(screen.getByText('Open Second Modal'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('2');

    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Only top modal should be closed
    expect(screen.getByTestId('modal-count')).toHaveTextContent('1');
    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();
    expect(screen.queryByText('Second Modal Content')).not.toBeInTheDocument();
  });

  it('prevents body scroll when modals are open', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestComponent />
      </ModalManager>
    );

    // Initially body should not have overflow hidden
    expect(document.body.style.overflow).toBe('');

    // Open modal
    await user.click(screen.getByText('Open Modal'));

    // Body should now have overflow hidden
    expect(document.body.style.overflow).toBe('hidden');

    // Close all modals
    await user.click(screen.getByText('Close All'));

    // Body should restore overflow
    expect(document.body.style.overflow).toBe('');
  });

  it('respects maxModals limit', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager maxModals={1}>
        <TestComponent />
      </ModalManager>
    );

    // Open first modal
    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('1');

    // Try to open second modal - should be prevented
    await user.click(screen.getByText('Open Second Modal'));
    expect(screen.getByTestId('modal-count')).toHaveTextContent('1');

    // Only first modal should be present
    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();
    expect(screen.queryByText('Second Modal Content')).not.toBeInTheDocument();
  });

  it('handles onClose callback', async () => {
    const onClose = jest.fn();

    function TestComponentWithCallback() {
      const { openModal, closeModal } = useModalManager();

      const openTestModal = () => {
        openModal({
          id: 'callback-modal',
          component: <div>Callback Modal</div>,
          onClose,
        });
      };

      const closeTestModal = () => {
        closeModal('callback-modal');
      };

      return (
        <div>
          <button onClick={openTestModal}>Open Modal</button>
          <button onClick={closeTestModal}>Close Modal</button>
        </div>
      );
    }

    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestComponentWithCallback />
      </ModalManager>
    );

    // Open modal
    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Callback Modal')).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByText('Close Modal'));

    // onClose should have been called
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText('Callback Modal')).not.toBeInTheDocument();
  });
});

describe('useModal hook', () => {
  it('manages modal state correctly', async () => {
    const user = userEvent.setup();

    render(
      <ModalManager>
        <TestWithUseModal />
      </ModalManager>
    );

    // Initially closed
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');

    // Open modal
    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Use Modal Content')).toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('open');

    // Close modal
    await user.click(screen.getByText('Close Modal'));
    expect(screen.queryByText('Use Modal Content')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');
  });
});
