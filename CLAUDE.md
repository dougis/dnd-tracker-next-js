# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D&D Encounter Tracker - a Next.js 15 full-stack web application for Dungeon Masters to manage combat encounters efficiently. The project is currently in the **planning complete** phase with 46 GitHub issues created for a 12-week MVP development timeline.

**Key Features:**

- Initiative tracking with dexterity tiebreakers
- HP/AC management with damage and healing tracking
- Character management (PCs and NPCs) with multiclass support
- Encounter building with participant organization
- Lair actions support (unique competitive advantage)
- Freemium subscription model with 5 pricing tiers

## Technology Stack

- **Frontend:** Next.js 15 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js v5 with MongoDB sessions
- **Deployment:** Vercel with GitHub Actions CI/CD
- **Testing:** Jest and React Testing Library

## Development Commands

**Note:** This project is currently in planning phase. The following commands will be available once development begins:

```bash
# Project setup (Week 1)
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Development workflow
npm run lint         # ESLint checking
npm run lint:fix     # ESLint checking with automatic fixes
npm run format       # Prettier formatting
npm run format:check # Check Prettier formatting
npm run typecheck    # TypeScript compilation check
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Database operations (to be implemented in Week 1-2)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed development data
```

## Git Workflow

### Branching Strategy

This project follows a **GitHub Flow** branching strategy optimized for continuous deployment:

- **`main`** - Production-ready code, protected branch
- **Feature branches** - `feature/issue-{number}-{short-description}` (e.g., `feature/issue-15-character-creation`)
- **Bugfix branches** - `bugfix/issue-{number}-{short-description}` (e.g., `bugfix/issue-23-login-validation`)
- **Hotfix branches** - `hotfix/critical-{description}` (for urgent production fixes)

### Development Workflow

1. **Start New Work**

   ```bash
   # Create and switch to new feature branch from main
   git checkout main
   git pull origin main
   git checkout -b feature/issue-{number}-{description}

   # Push branch to remote immediately
   git push -u origin feature/issue-{number}-{description}
   ```

2. **Development Process**

   ```bash
   # Make changes and commit frequently with descriptive messages
   git add .
   git commit -m "Add character creation form validation

   - Implement HP and AC field validation
   - Add error handling for invalid ability scores
   - Update tests for validation logic

   Relates to #15"

   # Push changes regularly
   git push origin feature/issue-{number}-{description}
   ```

3. **Quality Checks Before PR**

   ```bash
   # Run all quality checks locally
   npm run lint              # Fix any linting issues
   npm run format           # Format code consistently
   npm run typecheck        # Ensure TypeScript compiles
   npm test                 # All tests must pass
   npm run build            # Verify production build
   ```

4. **Create Pull Request**

   ```bash
   # Create PR using GitHub CLI (preferred)
   gh pr create --title "Add character creation form validation" \
                --body "Implements validation for character creation form as specified in #15"

   # Or create via GitHub web interface
   ```

5. **Code Review Process**
   - All PRs require at least 1 approval
   - Address all reviewer feedback
   - Ensure CI/CD checks pass
   - Maintain clean commit history

6. **Merge and Cleanup**
   ```bash
   # After PR approval, merge via GitHub interface
   # Then clean up locally
   git checkout main
   git pull origin main
   git branch -d feature/issue-{number}-{description}
   git remote prune origin
   ```

### Commit Message Standards

Follow **Conventional Commits** for consistent commit history:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**

```bash
feat(character): add multiclass support to character creation
fix(combat): resolve initiative tiebreaker calculation
docs: update API documentation for encounter endpoints
test(character): add comprehensive validation tests
```

### Branch Protection Rules

**Main Branch Protection** (configured via GitHub settings):

- ✅ Require pull request reviews (minimum 1 approval)
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

**Required Status Checks:**

- ✅ Build successfully completes (`npm run build`)
- ✅ All tests pass (`npm test`)
- ✅ Linting passes (`npm run lint`)
- ✅ TypeScript compilation succeeds (`npm run typecheck`)
- ✅ Codacy quality gate passes

### Pull Request Guidelines

Use the provided PR template (`.github/pull_request_template.md`) which includes:

- **Summary** - Clear description of changes
- **Related Issue** - Link to GitHub issue
- **Type of Change** - Bug fix, feature, breaking change, etc.
- **Testing** - How changes were tested
- **Checklist** - Quality assurance items

### Emergency Procedures

**Hotfix Process:**

```bash
# For critical production issues
git checkout main
git pull origin main
git checkout -b hotfix/critical-{description}

# Make minimal fix
git commit -m "hotfix: resolve critical login issue"
git push -u origin hotfix/critical-{description}

# Create emergency PR with expedited review
gh pr create --title "HOTFIX: Critical login issue" --label "hotfix"
```

**Rollback Process:**

```bash
# If needed, revert to previous stable commit
git revert {commit-hash}
git push origin main
```

## Architecture Overview

### Project Structure (to be created during development)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group (login, register)
│   ├── (dashboard)/       # Protected routes (parties, encounters, combat)
│   ├── api/               # API routes for all endpoints
│   ├── globals.css
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components with validation
│   ├── combat/            # Combat-specific components
│   └── layout/            # Layout and navigation components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # MongoDB connection
│   ├── stripe.ts          # Stripe configuration
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript definitions
    ├── auth.ts
    ├── character.ts
    ├── encounter.ts
    └── subscription.ts
```

### Database Schema (MongoDB)

- **Users:** Authentication, subscription tiers, preferences
- **Characters:** PCs and NPCs with full D&D 5e stats, multiclass support
- **Parties:** Character groupings with DM assignments
- **Encounters:** Combat scenarios with participants and settings
- **Combat Sessions:** Active combat state with initiative, turns, HP tracking

### Key Components Architecture

- **Combat Tracker:** Initiative management, turn progression, HP/AC tracking
- **Encounter Builder:** Drag-and-drop creature addition, CR calculation
- **Party Manager:** Character creation/editing, player assignment
- **Subscription Manager:** Freemium tier enforcement and upgrade flows

## Development Workflow

### Phase-Based Development (12 Weeks)

1. **Weeks 1-2:** Foundation (Next.js, MongoDB, UI setup)
2. **Weeks 3-4:** Authentication and core components
3. **Weeks 5-6:** Character management system
4. **Weeks 7-8:** Encounter management system
5. **Weeks 9-10:** Combat system core
6. **Weeks 11-12:** Advanced features and polish

### Issue Management

- **46 MVP issues** created with detailed specifications
- Issues are tagged with week assignments (Phase 1-3)
- Dependencies mapped to prevent blocking
- Start with **Issue #2: "Setup Next.js 15 project with TypeScript"**

### Testing Strategy

- Unit tests for all utility functions and business logic
- Component tests for UI interactions
- Integration tests for API endpoints
- E2E tests for critical user workflows

## Key Business Context

### Subscription Tiers (Freemium Model)

- **Free Adventurer:** $0/month (1 party, 3 encounters, 10 creatures)
- **Seasoned Adventurer:** $4.99/month (3 parties, 15 encounters, 50 creatures)
- **Expert Dungeon Master:** $9.99/month (10 parties, 50 encounters, 200 creatures)
- **Master of Dungeons:** $19.99/month (25 parties, 100 encounters, 500 creatures)
- **Guild Master:** $39.99/month (Unlimited + organization features)

### Competitive Advantages

- Modern, responsive UI optimized for mobile and desktop
- Lair actions support (unique vs. competitors like Roll20, D&D Beyond)
- Superior user experience with real-time collaboration
- Optimized for D&D 5e combat mechanics

## Documentation

All comprehensive project documentation is in the `docs/` folder:

- **[README.md](./docs/README.md):** Complete documentation index
- **[High Level Design.md](./docs/High%20Level%20Design.md):** Technical architecture
- **[12-Week MVP Development Phase Plan.md](./docs/12-Week%20MVP%20Development%20Phase%20Plan.md):** Detailed development schedule
- **[Product Requirements Document.md](./docs/Product%20Requirements%20Document.md):** Business requirements
- **[QUICK REFERENCE FOR OTHER CHATS.md](./docs/QUICK%20REFERENCE%20FOR%20OTHER%20CHATS.md):** Quick orientation guide

## Development Notes

### Starting Development

1. Begin with Issue #2 (Next.js setup) - no dependencies
2. Follow the 12-week development plan for proper sequencing
3. All business requirements and technical architecture are pre-defined
4. Focus on MVP features first before advanced functionality

### Code Conventions

- Use TypeScript strictly with proper type definitions
- Follow Next.js 15 App Router patterns
- Implement proper error handling and loading states
- Follow shadcn/ui component patterns for consistency
- Use Mongoose for all database operations

### Quality Gates

- Each week has defined deliverables and acceptance criteria
- Test coverage requirements for all new features
- Mobile responsiveness validation
- Performance optimization checks
- Codacy scans should be performed on all code changes

## Current Status

- ✅ **Planning Phase Complete:** All requirements, architecture, and development planning finished
- 🚀 **Development Ready:** Ready for immediate implementation
- 📋 **Total Effort:** 268 hours estimated over 12 weeks
- 📊 **MVP Issues:** 46 detailed GitHub issues created

**Next Action:** Begin Week 1 development with Issue #2 (Next.js 15 project setup)
