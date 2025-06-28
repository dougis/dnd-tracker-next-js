# Branch Protection Setup Instructions

## Manual Setup Required

Due to GitHub API limitations, branch protection rules need to be configured manually through the GitHub web interface.

## Steps to Configure Branch Protection

1. **Navigate to Repository Settings**
   - Go to: <https://github.com/dougis/dnd-tracker-next-js/settings>
   - Click on "Branches" in the left sidebar

2. **Add Branch Protection Rule**
   - Click "Add rule"
   - Enter branch name pattern: `main`

3. **Configure Protection Settings**

### Required Reviews

- ✅ **Require a pull request before merging**
- ✅ **Require approvals**: 1
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ❌ **Require review from code owners** (not needed for solo development)

### Status Checks

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**

  **Required status checks to add when CI/CD is configured:**

- `build` - Build process completion
- `test` - Test suite execution
- `lint` - ESLint validation
- `typecheck` - TypeScript compilation

### Additional Restrictions

- ✅ **Restrict pushes that create files larger than 100MB**
- ✅ **Require signed commits** (recommended for security)
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**

### Administrative Settings

- ❌ **Allow force pushes** (for emergency situations only)
- ❌ **Allow deletions**

1. **Apply Rules**
   - Click "Create" to save the branch protection rule

## Verification

After setup, verify that:

- Direct pushes to `main` are blocked
- Pull requests are required for all changes
- Status checks are enforced (once CI/CD is configured)

## CI/CD Integration

When GitHub Actions workflow is added (Issue #46), update the required status checks to include:

- Build verification
- Test execution
- Code quality checks
- Security scans

## Notes

- These settings can be updated as the project evolves
- Consider requiring signed commits for enhanced security
- Status checks will need to be added incrementally as CI/CD pipeline is built
