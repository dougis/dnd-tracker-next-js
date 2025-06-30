const mockUseSession = jest.fn(() => ({
  data: null,
  status: 'unauthenticated',
  update: jest.fn(),
}));

const mockSessionProvider = ({ children }) => children;

const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();

module.exports = {
  useSession: mockUseSession,
  SessionProvider: mockSessionProvider,
  signIn: mockSignIn,
  signOut: mockSignOut,
  getSession: mockGetSession,
};
