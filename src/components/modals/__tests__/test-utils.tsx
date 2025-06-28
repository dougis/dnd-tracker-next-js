import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock the ModalManagerContext to prevent context errors
jest.mock('../ModalManager', () => {

    const originalModule = jest.requireActual('../ModalManager');

    // Create a mock context with required methods
    const mockModalManager = {
        openModal: jest.fn(),
        closeModal: jest.fn(),
        updateModal: jest.fn(),
        isModalOpen: jest.fn().mockReturnValue(false),
        getModalProps: jest.fn().mockReturnValue({}),
    };

    return {
        ...originalModule,
        ModalManager: ({ children, maxModals }) => (
            <div data-testid="modal-manager" data-max-modals={maxModals || 5}>
                {children}
            </div>
        ),
        useModal: () => ({
            openModal: mockModalManager.openModal,
            closeModal: mockModalManager.closeModal,
            updateModal: mockModalManager.updateModal,
        }),
        useModalManager: () => mockModalManager,
        ModalManagerContext: {
            Provider: ({ children, _value }) => <div>{children}</div>,
        },
    };

});

// Create a wrapper component that provides dialog title and description
// to prevent React errors about missing Dialog components
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {

    return <div>{children}</div>;

};

// Custom render method for testing components
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
