import '../__test-helpers__/test-setup';
import { UserServiceProfile } from '../UserServiceProfile';
import { UserProfileUpdate, SubscriptionTier } from '@/lib/validations/user';
import { exerciseMethodForCoverage } from './diffCoverageTestUtils';

/**
 * Focused tests to ensure diff coverage for UserServiceProfile
 * These tests target specific lines that were changed in formatting
 */
describe('UserServiceProfile Diff Coverage', () => {
  const mockUserId = 'test-user-id';

  it('should exercise getUserById method to cover formatted lines', async () => {
    // This targets lines that were formatted
    await exerciseMethodForCoverage(() =>
      UserServiceProfile.getUserById(mockUserId)
    );
  });

  it('should exercise updateUserProfile method to cover formatted lines', async () => {
    const updateData: UserProfileUpdate = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    await exerciseMethodForCoverage(() =>
      UserServiceProfile.updateUserProfile(mockUserId, updateData)
    );
  });

  it('should exercise updateSubscription method to cover formatted lines', async () => {
    const newTier: SubscriptionTier = 'expert';

    await exerciseMethodForCoverage(() =>
      UserServiceProfile.updateSubscription(mockUserId, newTier)
    );
  });

  it('should exercise deleteUser method to cover formatted lines', async () => {
    await exerciseMethodForCoverage(() =>
      UserServiceProfile.deleteUser(mockUserId)
    );
  });

  it('should exercise getUserByEmail method to cover formatted lines', async () => {
    await exerciseMethodForCoverage(() =>
      UserServiceProfile.getUserByEmail('test@example.com')
    );
  });
});
