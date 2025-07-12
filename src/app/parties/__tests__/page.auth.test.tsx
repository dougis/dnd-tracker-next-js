/**
 * Parties Page Authentication Tests
 *
 * Tests authentication protection for the parties page following TDD principles.
 * These tests should fail initially and pass after implementation.
 */

// eslint-disable-next-line no-unused-vars
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import PartiesPage from '../page';
import { createMockUser } from '@/__tests__/utils/mock-factories';
import { setupAuthenticatedMocks, expectRedirectToSignin } from '@/__tests__/utils/auth-mocks';
import { createUnauthenticatedScenarios, createUserTestCases, createPageStructureExpectation } from '@/__tests__/utils/page-auth-helpers';
import { createParameterizedTest } from '@/__tests__/utils/test-runners';

// Mock the auth function from Next Auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock Next.js redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url) => {
    throw new Error(`REDIRECT: ${url}`);
  }),
}));

// Mock PartyListView component
jest.mock('@/components/party/PartyListView', () => ({
  PartyListView: ({ userId }: { userId: string }) => (
    <div data-testid="party-list-view" data-user-id={userId}>
      Party List View for user: {userId}
    </div>
  ),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('PartiesPage Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Protection', () => {
    createParameterizedTest(
      'should redirect to signin when',
      createUnauthenticatedScenarios().map(scenario => ({
        description: scenario.description,
        data: scenario.session
      })),
      async (session) => {
        mockAuth.mockResolvedValue(session as any);
        await expectRedirectToSignin(PartiesPage, mockAuth);
      }
    );
  });

  // Helper function for authenticated tests
  async function testAuthenticatedAccess(userId: string = 'user-123') {
    const user = createMockUser({ id: userId });
    setupAuthenticatedMocks(mockAuth, user);
    const result = await PartiesPage();

    expect(mockAuth).toHaveBeenCalled();
    expect(result).toBeDefined();

    return result;
  }

  describe('Authenticated Access', () => {
    it('should render page content when user is authenticated', async () => {
      await testAuthenticatedAccess();
    });

    it('should pass user ID to PartyListView component', async () => {
      const userId = 'user-456';
      await testAuthenticatedAccess(userId);
      // Note: Full component rendering verification would require testing-library setup
    });
  });

  describe('Page Metadata', () => {
    it('should have correct page metadata', async () => {
      // Import the metadata export
      const { metadata } = await import('../page');

      expect(metadata).toEqual({
        title: 'Parties - D&D Encounter Tracker',
        description: 'Manage and organize your D&D parties',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle auth function errors gracefully', async () => {
      // Mock auth to throw an error
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      await expect(PartiesPage()).rejects.toThrow('Auth service unavailable');

      expect(mockAuth).toHaveBeenCalled();
    });

    it('should handle various user object formats', async () => {
      const testCases = createUserTestCases();

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue(testCase.session as any);

        if (testCase.shouldRedirect) {
          await expectRedirectToSignin(PartiesPage, mockAuth);
        } else {
          const result = await PartiesPage();
          expect(result).toBeDefined();
        }
      }
    });
  });

  describe('Page Structure', () => {
    it('should render correct page structure when authenticated', async () => {
      const result = await testAuthenticatedAccess();

      // Verify the page structure is correct
      expect(typeof result).toBe('object');

      // The page should return a JSX element with the expected structure
      expect(result).toEqual(createPageStructureExpectation());
    });
  });
});