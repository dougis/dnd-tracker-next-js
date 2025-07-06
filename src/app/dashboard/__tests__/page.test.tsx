import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardPage from '../page';
import { createDashboardPageTests, applyTestSuite } from '@/components/layout/__tests__/dashboard-test-helpers';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock child components
jest.mock('@/components/dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard-component">Dashboard Component</div>,
}));

jest.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe('Dashboard Page', () => {
  const testSuites = createDashboardPageTests(DashboardPage, mockUseSession);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User', () => {
    applyTestSuite(testSuites.authenticated);
  });

  describe('Loading State', () => {
    applyTestSuite(testSuites.loading);
  });

  describe('Unauthenticated User', () => {
    applyTestSuite(testSuites.unauthenticated);
  });

  describe('Accessibility', () => {
    applyTestSuite({
      'has proper heading structure': testSuites.authenticated['has proper heading structure'],
      'contains main content area': testSuites.authenticated['contains main content area'],
    });
  });
});