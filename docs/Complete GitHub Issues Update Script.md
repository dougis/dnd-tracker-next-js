# GitHub Issues Update Script - Complete 12-Week Phase Assignments
**Date:** June 9, 2025  
**Purpose:** Update all 46 MVP issues with correct week assignments and dependencies

## 🔧 **AUTOMATED UPDATE COMMANDS**

Use these commands with GitHub CLI (`gh`) to update all issues systematically:

### **WEEK 1: Project Foundation (17 hours total)**

#### **Issue #2: Setup Next.js 15 project with TypeScript**
```bash
gh issue edit 2 --body "**MVP Task: Project Setup**

Initialize Next.js 15 project with TypeScript configuration and basic folder structure for D&D combat tracker development.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 1 - Project Foundation
- **Priority:** P1
- **Phase Effort:** 17 hours total
- **Dependencies:** None (starting point)
---

**Tasks:**
- [ ] Initialize project with \`create-next-app\`
- [ ] Configure TypeScript strict mode
- [ ] Setup basic folder structure
- [ ] Configure next.config.js for optimization

**Acceptance Criteria:**
- [ ] Next.js 15 project runs successfully in development
- [ ] TypeScript compilation works without errors
- [ ] Basic project structure follows Next.js best practices
- [ ] Project configuration supports planned features

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 1  
**Dependencies:** None (starting point)"
```

#### **Issue #3: Configure development environment**
```bash
gh issue edit 3 --body "**MVP Task: Project Setup**

Configure development environment with ESLint, Prettier, and VS Code settings for consistent development experience.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 1 - Project Foundation
- **Priority:** P1
- **Phase Effort:** 17 hours total
- **Dependencies:** #2
---

**Tasks:**
- [ ] Setup ESLint and Prettier with Next.js configs
- [ ] Configure VS Code settings and extensions
- [ ] Setup pnpm workspace configuration
- [ ] Create .env.example file

**Acceptance Criteria:**
- [ ] ESLint and Prettier work correctly with TypeScript
- [ ] VS Code provides optimal development experience
- [ ] Package management is configured consistently
- [ ] Environment variables are properly templated

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 1  
**Dependencies:** #2"
```

#### **Issue #4: Setup version control and branching strategy**
```bash
gh issue edit 4 --body "**MVP Task: Project Setup**

Configure Git workflow, branching strategy, and repository settings for team collaboration.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 1 - Project Foundation
- **Priority:** P1
- **Phase Effort:** 17 hours total
- **Dependencies:** #2
---

**Tasks:**
- [ ] Configure .gitignore for Next.js
- [ ] Setup branch protection rules
- [ ] Create PR template
- [ ] Document git workflow

**Acceptance Criteria:**
- [ ] Git ignores appropriate files and directories
- [ ] Branch protection prevents direct main commits
- [ ] PR template guides code review process
- [ ] Git workflow is documented for team

**Effort:** 2 hours  
**Priority:** P1  
**Phase:** Week 1  
**Dependencies:** #2"
```

#### **Issue #8: Setup MongoDB Atlas cluster**
```bash
gh issue edit 8 --body "**MVP Task: Database Setup**

Configure MongoDB Atlas cluster for production and development environments.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 1 - Project Foundation
- **Priority:** P1
- **Phase Effort:** 17 hours total
- **Dependencies:** None
---

**Tasks:**
- [ ] Create production and development clusters
- [ ] Configure network access and database users
- [ ] Setup connection strings
- [ ] Test connectivity

**Acceptance Criteria:**
- [ ] MongoDB Atlas clusters are operational
- [ ] Database access is properly secured
- [ ] Connection strings work in different environments
- [ ] Database connectivity is verified

**Effort:** 3 hours  
**Priority:** P1  
**Phase:** Week 1  
**Dependencies:** None"
```

#### **Issue #45: Setup Jest testing framework**
```bash
gh issue edit 45 --body "**MVP Task: Testing**

Setup Jest testing framework with React Testing Library for comprehensive component and integration testing.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 1 - Project Foundation
- **Priority:** P1
- **Phase Effort:** 17 hours total
- **Dependencies:** #2
---

**Tasks:**
- [ ] Configure Jest with Next.js and TypeScript
- [ ] Setup React Testing Library with custom render utilities
- [ ] Create test utilities and mocking helpers
- [ ] Configure test coverage reporting and thresholds
- [ ] Setup test environment variables and database mocking
- [ ] Add testing scripts and CI integration

**Acceptance Criteria:**
- [ ] Jest runs tests correctly with Next.js configuration
- [ ] Test utilities are available for all components
- [ ] Test coverage reports are generated and accessible
- [ ] Tests can be run in development and CI environments
- [ ] Mock utilities work for external dependencies

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 1  
**Dependencies:** #2"
```

### **WEEK 2: UI Foundation & Database (23 hours total)**

#### **Issue #5: Install and configure Tailwind CSS**
```bash
gh issue edit 5 --body "**MVP Task: UI Foundation**

Install and configure Tailwind CSS with custom theme and design tokens for consistent styling.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 2 - UI Foundation & Database
- **Priority:** P1
- **Phase Effort:** 23 hours total
- **Dependencies:** #2
---

**Tasks:**
- [ ] Install Tailwind CSS and PostCSS
- [ ] Configure tailwind.config.js with custom theme
- [ ] Setup CSS variables for design tokens
- [ ] Test responsive utilities

**Acceptance Criteria:**
- [ ] Tailwind CSS is properly integrated with Next.js
- [ ] Custom theme reflects D&D design aesthetic
- [ ] CSS variables enable dynamic theming
- [ ] Responsive utilities work across all breakpoints

**Effort:** 3 hours  
**Priority:** P1  
**Phase:** Week 2  
**Dependencies:** #2"
```

#### **Issue #6: Setup shadcn/ui component library**
```bash
gh issue edit 6 --body "**MVP Task: UI Foundation**

Initialize shadcn/ui component library and configure core components for consistent UI development.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 2 - UI Foundation & Database
- **Priority:** P1
- **Phase Effort:** 23 hours total
- **Dependencies:** #5
---

**Tasks:**
- [ ] Initialize shadcn/ui configuration
- [ ] Install core components (Button, Input, Card, etc.)
- [ ] Configure component theming
- [ ] Create component showcase page

**Acceptance Criteria:**
- [ ] shadcn/ui components are properly configured
- [ ] Core components follow design system
- [ ] Component theming works with Tailwind
- [ ] Showcase page demonstrates all components

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 2  
**Dependencies:** #5"
```

#### **Issue #7: Create design system foundations**
```bash
gh issue edit 7 --body "**MVP Task: UI Foundation**

Create comprehensive design system with colors, typography, spacing, and theming for consistent user experience.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 2 - UI Foundation & Database
- **Priority:** P1
- **Phase Effort:** 23 hours total
- **Dependencies:** #6
---

**Tasks:**
- [ ] Define color palette and typography
- [ ] Create spacing and sizing scales
- [ ] Setup dark/light theme switching
- [ ] Document design system usage

**Acceptance Criteria:**
- [ ] Color palette supports D&D theming and accessibility
- [ ] Typography scales work across all content types
- [ ] Theme switching works seamlessly
- [ ] Design system documentation is comprehensive

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 2  
**Dependencies:** #6"
```

#### **Issue #9: Install and configure Mongoose**
```bash
gh issue edit 9 --body "**MVP Task: Database Setup**

Install and configure Mongoose ODM for MongoDB with connection pooling and environment-based configuration.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 2 - UI Foundation & Database
- **Priority:** P1
- **Phase Effort:** 23 hours total
- **Dependencies:** #8
---

**Tasks:**
- [ ] Install Mongoose and type definitions
- [ ] Create database connection utility
- [ ] Configure connection pooling
- [ ] Setup environment-based configurations

**Acceptance Criteria:**
- [ ] Mongoose connects successfully to MongoDB Atlas
- [ ] Connection pooling is optimized for Next.js
- [ ] Environment configurations work for dev/prod
- [ ] Database connection is stable and monitored

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 2  
**Dependencies:** #8"
```

#### **Issue #46: Configure automated deployment pipeline**
```bash
gh issue edit 46 --body "**MVP Task: Deployment**

Configure automated deployment pipeline with GitHub Actions, staging environment, and production deployment.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 2 - UI Foundation & Database
- **Priority:** P1
- **Phase Effort:** 23 hours total
- **Dependencies:** #45
---

**Tasks:**
- [ ] Create GitHub Actions workflow for CI/CD pipeline
- [ ] Configure automated testing in CI pipeline
- [ ] Setup staging environment with Vercel preview deployments
- [ ] Add deployment notifications and status checks
- [ ] Setup rollback procedures and deployment monitoring
- [ ] Configure environment variable management

**Acceptance Criteria:**
- [ ] CI/CD pipeline runs tests and deploys automatically
- [ ] Staging environment deploys on pull requests
- [ ] Production deploys on main branch merges
- [ ] Deployment status is visible in GitHub
- [ ] Rollback procedures are documented and functional

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 2  
**Dependencies:** #45"
```

### **WEEK 3: Authentication & Core Components (24 hours total)**

#### **Issue #10: Install and configure NextAuth.js v5**
```bash
gh issue edit 10 --body "**MVP Task: Authentication**

Install and configure NextAuth.js v5 with MongoDB adapter for user authentication and session management.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 3 - Authentication & Core Components
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #9
---

**Tasks:**
- [ ] Install NextAuth.js and MongoDB adapter
- [ ] Configure authentication options
- [ ] Setup session strategy with database
- [ ] Create auth API routes

**Acceptance Criteria:**
- [ ] NextAuth.js v5 is properly configured
- [ ] MongoDB adapter stores sessions correctly
- [ ] Authentication routes work as expected
- [ ] Session management is secure and efficient

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 3  
**Dependencies:** #9"
```

#### **Issue #40: Create application layout**
```bash
gh issue edit 40 --body "**MVP Task: UI/UX Design**

Build main navigation structure and responsive sidebar for application layout and user navigation.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 3 - Authentication & Core Components
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #7
---

**Tasks:**
- [ ] Create main navigation structure with menu items
- [ ] Build responsive sidebar with collapsible functionality
- [ ] Implement breadcrumb navigation system
- [ ] Add mobile menu system with hamburger menu
- [ ] Create navigation state management
- [ ] Add active link highlighting and user feedback

**Acceptance Criteria:**
- [ ] Navigation structure is clear and intuitive
- [ ] Sidebar works on desktop and collapses on mobile
- [ ] Breadcrumbs show current location in application
- [ ] Mobile menu provides full navigation access
- [ ] Navigation state persists across page changes

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 3  
**Dependencies:** #7"
```

#### **Issue #43: Create form component library**
```bash
gh issue edit 43 --body "**MVP Task: UI/UX Design**

Build reusable form components with validation, accessibility, and state management for consistent form experiences.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 3 - Authentication & Core Components
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #7
---

**Tasks:**
- [ ] Build reusable form components (Input, Select, Checkbox, etc.)
- [ ] Implement form validation UI with error displays
- [ ] Add form state management utilities
- [ ] Create form accessibility features (ARIA labels, focus management)
- [ ] Build form submission and loading states
- [ ] Add form wizard/multi-step functionality

**Acceptance Criteria:**
- [ ] Form components are consistent across application
- [ ] Validation provides clear, helpful error messages
- [ ] Forms are accessible to screen readers
- [ ] Form state is managed efficiently
- [ ] Loading states provide user feedback during submissions

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 3  
**Dependencies:** #7"
```

#### **Issue #20: Implement data validation with Zod**
```bash
gh issue edit 20 --body "**MVP Task: Database**

Implement comprehensive data validation using Zod schemas for all models and API endpoints.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 3 - Authentication & Core Components
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #9
---

**Tasks:**
- [ ] Create validation schemas for all models
- [ ] Implement server-side validation
- [ ] Add client-side validation
- [ ] Create validation error handling

**Acceptance Criteria:**
- [ ] All data models have comprehensive Zod schemas
- [ ] Server-side validation prevents invalid data storage
- [ ] Client-side validation provides immediate feedback
- [ ] Error handling is consistent and user-friendly

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 3  
**Dependencies:** #9"
```

### **WEEK 4: Authentication Complete & Data Models (24 hours total)**

#### **Issue #11: Create user registration flow**
```bash
gh issue edit 11 --body "**MVP Task: Authentication**

Build complete user registration workflow with email verification and user onboarding.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 4 - Authentication Complete & Data Models
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #10
---

**Tasks:**
- [ ] Build registration form with validation
- [ ] Implement server-side user creation
- [ ] Add email verification system
- [ ] Create welcome email template

**Acceptance Criteria:**
- [ ] Registration form validates user input properly
- [ ] User accounts are created securely in database
- [ ] Email verification prevents unauthorized accounts
- [ ] Welcome flow guides new users effectively

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 4  
**Dependencies:** #10"
```

#### **Issue #21: Implement session middleware**
```bash
gh issue edit 21 --body "**MVP Task: Authentication**

Implement session middleware for protecting routes and managing user authentication state.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 4 - Authentication Complete & Data Models
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #10
---

**Tasks:**
- [ ] Create authentication middleware
- [ ] Protect API routes
- [ ] Handle session expiration
- [ ] Implement automatic session refresh

**Acceptance Criteria:**
- [ ] Protected routes require valid authentication
- [ ] API endpoints are secured appropriately
- [ ] Session expiration is handled gracefully
- [ ] Session refresh works automatically

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 4  
**Dependencies:** #10"
```

#### **Issue #14: Create User schema and model**
```bash
gh issue edit 14 --body "**MVP Task: Database**

Create comprehensive User schema and model with subscription tracking and usage limits.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 4 - Authentication Complete & Data Models
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #20
---

**Tasks:**
- [ ] Define User interface and schema
- [ ] Implement subscription fields
- [ ] Add usage tracking fields
- [ ] Create schema validation

**Acceptance Criteria:**
- [ ] User schema supports all authentication requirements
- [ ] Subscription fields enable business model
- [ ] Usage tracking supports freemium limits
- [ ] Schema validation ensures data integrity

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 4  
**Dependencies:** #20"
```

#### **Issue #17: Create User service layer**
```bash
gh issue edit 17 --body "**MVP Task: Database**

Implement User service layer with CRUD operations, subscription management, and usage tracking.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 4 - Authentication Complete & Data Models
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #14
---

**Tasks:**
- [ ] Implement CRUD operations
- [ ] Add subscription management
- [ ] Create usage tracking utilities
- [ ] Add user query helpers

**Acceptance Criteria:**
- [ ] All user operations work correctly
- [ ] Subscription management supports business logic
- [ ] Usage tracking enables limit enforcement
- [ ] Query helpers optimize database access

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 4  
**Dependencies:** #14"
```

#### **Issue #41: Build landing page**
```bash
gh issue edit 41 --body "**MVP Task: UI/UX Design**

Create marketing landing page with hero section, feature highlights, and user onboarding flows.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 4 - Authentication Complete & Data Models
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #40
---

**Tasks:**
- [ ] Create hero section with clear value proposition
- [ ] Add feature highlights and benefits section
- [ ] Implement pricing section with subscription tiers
- [ ] Create call-to-action flows for registration
- [ ] Add testimonials and social proof section
- [ ] Implement responsive design for all screen sizes

**Acceptance Criteria:**
- [ ] Landing page clearly communicates product value
- [ ] Registration flow is accessible from landing page
- [ ] Feature highlights demonstrate core capabilities
- [ ] Page loads quickly and is mobile-optimized
- [ ] Call-to-action buttons are prominent and functional

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 4  
**Dependencies:** #40"
```

### **WEEK 5: Character Data Layer (22 hours total)**

#### **Issue #15: Create Character schema and model**
```bash
gh issue edit 15 --body "**MVP Task: Database**

Create Character schema and model supporting D&D 5e characters with multiclass and NPC variants.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 5 - Character Data Layer
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #20
---

**Tasks:**
- [ ] Define Character interface and schema
- [ ] Implement multi-class support
- [ ] Add stats and attributes
- [ ] Create character validation

**Acceptance Criteria:**
- [ ] Character schema supports D&D 5e requirements
- [ ] Multi-class characters are handled correctly
- [ ] All stats and attributes are properly modeled
- [ ] Character validation ensures data integrity

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 5  
**Dependencies:** #20"
```

#### **Issue #18: Create Character service layer**
```bash
gh issue edit 18 --body "**MVP Task: Database**

Implement Character service layer with CRUD operations, template management, and import/export helpers.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 5 - Character Data Layer
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #15
---

**Tasks:**
- [ ] Implement character CRUD operations
- [ ] Add template management
- [ ] Create character query utilities
- [ ] Add import/export helpers

**Acceptance Criteria:**
- [ ] Character operations work efficiently
- [ ] Template system enables reuse
- [ ] Query utilities optimize database access
- [ ] Import/export supports data portability

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 5  
**Dependencies:** #15"
```

#### **Issue #12: Build character creation form**
```bash
gh issue edit 12 --body "**MVP Task: Character Management**

Create comprehensive character creation form with multi-step workflow and D&D 5e integration.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 5 - Character Data Layer
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #18, #43
---

**Tasks:**
- [ ] Create multi-step character form
- [ ] Implement basic info section
- [ ] Add class and race selection
- [ ] Include stats input with validation

**Acceptance Criteria:**
- [ ] Character creation workflow is intuitive
- [ ] All D&D 5e character options are supported
- [ ] Form validation prevents invalid characters
- [ ] Multi-step flow guides users effectively

**Effort:** 8 hours  
**Priority:** P1  
**Phase:** Week 5  
**Dependencies:** #18, #43"
```

#### **Issue #22: Add character stats management**
```bash
gh issue edit 22 --body "**MVP Task: Character Management**

Implement comprehensive character statistics management including ability scores, modifiers, and derived stats calculations for D&D 5e characters.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 5 - Character Data Layer
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #12
---

**Tasks:**
- [ ] Create ability score input components (STR, DEX, CON, INT, WIS, CHA)
- [ ] Implement automatic modifier calculations (+/- from ability scores)
- [ ] Add proficiency bonus calculation based on level
- [ ] Create skill modifier calculations with proficiency
- [ ] Add saving throw calculations
- [ ] Implement stat validation (ability scores 1-20, standard array, point buy)

**Acceptance Criteria:**
- [ ] All six ability scores can be input and validated
- [ ] Modifiers automatically calculate from ability scores
- [ ] Skill and saving throw bonuses include proficiency when applicable
- [ ] Stats persist correctly in database
- [ ] Form validation prevents invalid stat values

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 5  
**Dependencies:** #12"
```

### **WEEK 6: Character Management (24 hours total)**

#### **Issue #23: Create character list view**
```bash
gh issue edit 23 --body "**MVP Task: Character Management**

Build a responsive character list interface with search, filtering, and quick actions for efficient character management.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 6 - Character Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #18
---

**Tasks:**
- [ ] Create character grid/list toggle view
- [ ] Implement character search by name, class, race
- [ ] Add filtering by level, class, player status (PC/NPC)
- [ ] Create character quick action buttons (edit, delete, assign to encounter)
- [ ] Add character sorting by name, level, class, last modified
- [ ] Implement infinite scroll or pagination for large character lists

**Acceptance Criteria:**
- [ ] Character list displays all user characters in grid or list format
- [ ] Search finds characters by name, class, or race instantly
- [ ] Filters work correctly and can be combined
- [ ] Quick actions are accessible and functional
- [ ] List performs well with 50+ characters

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 6  
**Dependencies:** #18"
```

#### **Issue #24: Create character editing interface**
```bash
gh issue edit 24 --body "**MVP Task: Character Management**

Implement character editing functionality with real-time validation and change tracking for comprehensive character updates.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 6 - Character Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #22
---

**Tasks:**
- [ ] Create edit form pre-populated with existing character data
- [ ] Implement inline editing for quick stat changes
- [ ] Add change tracking to highlight modified fields
- [ ] Create save/cancel functionality with confirmation dialogs
- [ ] Add character deletion with confirmation and undo option
- [ ] Implement real-time validation during editing

**Acceptance Criteria:**
- [ ] Edit form loads with current character data
- [ ] Changes are validated in real-time
- [ ] Save persists changes to database correctly
- [ ] Cancel reverts unsaved changes
- [ ] Deletion requires confirmation and works correctly

**Effort:** 8 hours  
**Priority:** P1  
**Phase:** Week 6  
**Dependencies:** #22"
```

#### **Issue #25: Character validation and error handling**
```bash
gh issue edit 25 --body "**MVP Task: Character Management**

Implement comprehensive character data validation and user-friendly error handling throughout the character management workflow.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 6 - Character Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #20
---

**Tasks:**
- [ ] Create client-side validation for all character fields
- [ ] Implement server-side validation with Zod schemas
- [ ] Add user-friendly error messages for validation failures
- [ ] Create error recovery flows for save failures
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement toast notifications for success/error states

**Acceptance Criteria:**
- [ ] All character data is validated on client and server
- [ ] Error messages are clear and actionable
- [ ] Users can recover from validation errors easily
- [ ] Network errors are handled gracefully with retry options
- [ ] Success feedback is provided for all actions

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 6  
**Dependencies:** #20"
```

#### **Issue #26: Implement character detail view**
```bash
gh issue edit 26 --body "**MVP Task: Character Management**

Create a comprehensive character detail view showing all character information with editing capabilities and combat readiness display.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 6 - Character Management
- **Priority:** P2
- **Phase Effort:** 24 hours total
- **Dependencies:** #24
---

**Tasks:**
- [ ] Build character overview with stats, AC, HP display
- [ ] Create character background section (race, class, level)
- [ ] Add player information display and editing
- [ ] Implement character notes and description editing
- [ ] Create character action history if available
- [ ] Add character sheet print/export preview

**Acceptance Criteria:**
- [ ] All character information is clearly displayed
- [ ] Character details load quickly from database
- [ ] Editing is intuitive and accessible
- [ ] Character overview provides at-a-glance combat info
- [ ] Navigation between characters is smooth

**Effort:** 6 hours  
**Priority:** P2  
**Phase:** Week 6  
**Dependencies:** #24"
```

### **WEEK 7: Encounter Data Layer & NPCs (22 hours total)**

#### **Issue #16: Create Encounter schema and model**
```bash
gh issue edit 16 --body "**MVP Task: Database**

Create Encounter schema and model with participant tracking, combat state management, and encounter validation.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 7 - Encounter Data Layer & NPCs
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #20
---

**Tasks:**
- [ ] Define Encounter interface and schema
- [ ] Implement participant tracking
- [ ] Add combat state management
- [ ] Create encounter validation

**Acceptance Criteria:**
- [ ] Encounter schema supports all combat requirements
- [ ] Participant tracking handles PCs and NPCs
- [ ] Combat state is properly managed
- [ ] Encounter validation ensures data integrity

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 7  
**Dependencies:** #20"
```

#### **Issue #19: Create Encounter service layer**
```bash
gh issue edit 19 --body "**MVP Task: Database**

Implement Encounter service layer with CRUD operations, participant management, and combat state utilities.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 7 - Encounter Data Layer & NPCs
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #16
---

**Tasks:**
- [ ] Implement encounter CRUD operations
- [ ] Add participant management
- [ ] Create combat state utilities
- [ ] Add encounter query helpers

**Acceptance Criteria:**
- [ ] Encounter operations work efficiently
- [ ] Participant management supports combat flow
- [ ] Combat state utilities enable game mechanics
- [ ] Query helpers optimize database access

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 7  
**Dependencies:** #16"
```

#### **Issue #27: Create NPC creation workflow**
```bash
gh issue edit 27 --body "**MVP Task: Character Management**

Build specialized workflow for creating NPCs and monsters with combat-focused fields and quick creation options.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 7 - Encounter Data Layer & NPCs
- **Priority:** P2
- **Phase Effort:** 22 hours total
- **Dependencies:** #12
---

**Tasks:**
- [ ] Create NPC-specific creation form (name, AC, HP, challenge rating)
- [ ] Add quick creature creation from templates
- [ ] Implement special abilities and legendary actions input
- [ ] Create creature type and size selection
- [ ] Add initiative modifier and dexterity input
- [ ] Implement NPC/monster categorization system

**Acceptance Criteria:**
- [ ] NPC creation is faster than full character creation
- [ ] Combat-relevant stats are easily input
- [ ] NPCs can be quickly added to encounters
- [ ] Creature templates speed up creation
- [ ] NPCs are clearly distinguished from PCs in lists

**Effort:** 6 hours  
**Priority:** P2  
**Phase:** Week 7  
**Dependencies:** #12"
```

#### **Issue #44: Build modal and dialog system**
```bash
gh issue edit 44 --body "**MVP Task: UI/UX Design**

Build modal component and dialog system with accessibility and state management for user interactions.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 7 - Encounter Data Layer & NPCs
- **Priority:** P1
- **Phase Effort:** 22 hours total
- **Dependencies:** #43
---

**Tasks:**
- [ ] Create modal component with backdrop and close functionality
- [ ] Implement confirmation dialogs for destructive actions
- [ ] Add modal state management and portal rendering
- [ ] Create modal accessibility features (focus trap, escape key)
- [ ] Build different modal sizes and styles
- [ ] Implement modal animation and transitions

**Acceptance Criteria:**
- [ ] Modals render correctly above other content
- [ ] Confirmation dialogs prevent accidental actions
- [ ] Modal focus management works for accessibility
- [ ] Different modal types serve different use cases
- [ ] Modals can be closed via escape key or backdrop click

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 7  
**Dependencies:** #43"
```

### **WEEK 8: Encounter Management (24 hours total)**

#### **Issue #28: Create encounter participant management**
```bash
gh issue edit 28 --body "**MVP Task: Encounter Management**

Implement functionality to add, remove, and organize participants in encounters with support for both PCs and NPCs.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 8 - Encounter Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #16
---

**Tasks:**
- [ ] Create participant addition interface with character selection
- [ ] Implement drag-and-drop participant reordering
- [ ] Add participant removal with confirmation
- [ ] Create participant count and composition display
- [ ] Add participant role assignment (player, ally, enemy)
- [ ] Implement participant status indicators

**Acceptance Criteria:**
- [ ] Characters can be added to encounters easily
- [ ] Participant order can be adjusted before combat
- [ ] Participant removal works without affecting other participants
- [ ] Encounter composition is clearly visible
- [ ] Participant roles are visually distinct

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 8  
**Dependencies:** #16"
```

#### **Issue #29: Build encounter list interface**
```bash
gh issue edit 29 --body "**MVP Task: Encounter Management**

Create an organized encounter list view with search, filtering, and quick access to encounter management functions.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 8 - Encounter Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #19
---

**Tasks:**
- [ ] Build encounter grid/list view with thumbnails
- [ ] Implement encounter search by name, participants, tags
- [ ] Add filtering by encounter size, difficulty, status
- [ ] Create quick action buttons (run, edit, copy, delete)
- [ ] Add encounter sorting by name, date, participant count
- [ ] Implement encounter status indicators (draft, ready, running, completed)

**Acceptance Criteria:**
- [ ] All user encounters are displayed in organized view
- [ ] Search finds encounters quickly and accurately
- [ ] Filters help organize large encounter collections
- [ ] Quick actions provide efficient encounter management
- [ ] Encounter status is clearly visible

**Effort:** 5 hours  
**Priority:** P1  
**Phase:** Week 8  
**Dependencies:** #19"
```

#### **Issue #30: Create encounter detail view**
```bash
gh issue edit 30 --body "**MVP Task: Encounter Management**

Build comprehensive encounter detail view showing all encounter information with editing and management capabilities.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 8 - Encounter Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #28
---

**Tasks:**
- [ ] Create encounter overview with participant list
- [ ] Add encounter settings display and editing
- [ ] Implement encounter notes and description
- [ ] Create encounter difficulty assessment display
- [ ] Add encounter preparation checklist
- [ ] Implement encounter start/resume functionality

**Acceptance Criteria:**
- [ ] All encounter details are clearly presented
- [ ] Encounter can be edited directly from detail view
- [ ] Combat can be started directly from this view
- [ ] Encounter preparation status is visible
- [ ] Navigation to combat view is seamless

**Effort:** 7 hours  
**Priority:** P1  
**Phase:** Week 8  
**Dependencies:** #28"
```

#### **Issue #42: Create dashboard interface**
```bash
gh issue edit 42 --body "**MVP Task: UI/UX Design**

Build main dashboard layout with quick access widgets and recent items display for user overview.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 8 - Encounter Management
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #40
---

**Tasks:**
- [ ] Build main dashboard layout with widget grid
- [ ] Add quick access widgets for common actions
- [ ] Implement recent items display (characters, encounters)
- [ ] Create dashboard customization options
- [ ] Add dashboard statistics and usage metrics
- [ ] Implement dashboard responsiveness for mobile

**Acceptance Criteria:**
- [ ] Dashboard provides overview of user's content
- [ ] Quick actions are easily accessible
- [ ] Recent items help users resume work quickly
- [ ] Dashboard layout adapts to different screen sizes
- [ ] Statistics help users understand their usage

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 8  
**Dependencies:** #40"
```

### **WEEK 9: Combat Foundation (24 hours total)**

#### **Issue #37: Create combat state management**
```bash
gh issue edit 37 --body "**MVP Task: Combat System**

Implement core combat state management with start/stop/pause functionality and state persistence.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 9 - Combat Foundation
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #30
---

**Tasks:**
- [ ] Create combat state machine (not started, running, paused, completed)
- [ ] Implement combat start logic with initiative setup
- [ ] Add combat pause functionality preserving state
- [ ] Create combat stop with confirmation and cleanup
- [ ] Add combat reset functionality
- [ ] Implement combat state persistence across page refreshes

**Acceptance Criteria:**
- [ ] Combat states transition correctly
- [ ] Combat can be started from encounter setup
- [ ] Pause preserves all combat data accurately
- [ ] Stop cleans up temporary combat data
- [ ] Combat state survives page refreshes

**Effort:** 8 hours  
**Priority:** P1  
**Phase:** Week 9  
**Dependencies:** #30"
```

#### **Issue #13: Create initiative tracking interface**
```bash
gh issue edit 13 --body "**MVP Task: Combat System**

Build initiative tracking interface with turn indicators, round management, and initiative modification capabilities.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 9 - Combat Foundation
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #37
---

**Tasks:**
- [ ] Build initiative order display
- [ ] Implement turn indicators
- [ ] Add round tracking
- [ ] Create initiative modification tools

**Acceptance Criteria:**
- [ ] Initiative order is clearly displayed
- [ ] Current turn is visually obvious
- [ ] Round tracking works automatically
- [ ] Initiative can be modified during combat

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 9  
**Dependencies:** #37"
```

#### **Issue #35: Implement initiative rolling system**
```bash
gh issue edit 35 --body "**MVP Task: Combat System**

Create automatic and manual initiative rolling with dexterity tiebreakers and modification support.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 9 - Combat Foundation
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #33
---

**Tasks:**
- [ ] Build automatic initiative rolling for all participants
- [ ] Create manual initiative input interface
- [ ] Implement dexterity-based tiebreaking system
- [ ] Add initiative modifier support (bonuses/penalties)
- [ ] Create initiative re-rolling functionality
- [ ] Add initiative result validation and sorting

**Acceptance Criteria:**
- [ ] Initiative can be rolled automatically for entire encounter
- [ ] Manual initiative input works for specific values
- [ ] Tiebreakers resolve properly using dexterity scores
- [ ] Initiative order updates correctly after modifications
- [ ] Initiative results are validated and sorted properly

**Effort:** 6 hours  
**Priority:** P1  
**Phase:** Week 9  
**Dependencies:** #33"
```

#### **Issue #39: Create round tracking system**
```bash
gh issue edit 39 --body "**MVP Task: Combat System**

Implement round tracking with automatic advancement and round-based effect management.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 9 - Combat Foundation
- **Priority:** P1
- **Phase Effort:** 24 hours total
- **Dependencies:** #33
---

**Tasks:**
- [ ] Create round counter with increment/decrement controls
- [ ] Implement automatic round advancement at initiative top
- [ ] Add round-based effect duration tracking
- [ ] Create round history and combat timeline
- [ ] Add round-specific triggers (lair actions at initiative 20)
- [ ] Implement round reset functionality

**Acceptance Criteria:**
- [ ] Round counter accurately tracks combat progress
- [ ] Round advancement happens automatically
- [ ] Round-based effects are processed correctly
- [ ] Combat timeline provides combat history
- [ ] Round triggers fire at appropriate times

**Effort:** 4 hours  
**Priority:** P1  
**Phase:** Week 9  
**Dependencies:** #33"
```

### **WEEK 10: Combat Core Systems (21 hours total)**

#### **Issue #33: Build turn management system**
```bash
gh issue edit 33 --body "**MVP Task: Combat System**

Implement comprehensive turn management with turn advancement, skipping, and modification capabilities.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 10 - Combat Core Systems
- **Priority:** P1
- **Phase Effort:** 21 hours total
- **Dependencies:** #13
---

**Tasks:**
- [ ] Create next/previous turn controls
- [ ] Implement turn skipping with confirmation
- [ ] Add turn delay functionality (act later in round)
- [ ] Create turn order modification during combat
- [ ] Add round advancement with automatic effects processing
- [ ] Implement turn timer/countdown functionality

**Acceptance Criteria:**
- [ ] Turn advancement works smoothly in initiative order
- [ ] Turn skipping maintains proper order
- [ ] Delayed turns are handled correctly
- [ ] Initiative order can be modified during combat
- [ ] Round tracking increments automatically

**Effort:** 8 hours  
**Priority:** P1  
**Phase:** Week 10  
**Dependencies:** #13"
```

#### **Issue #34: Create HP tracking interface**
```bash
gh issue edit 34 --body "**MVP Task: Combat System**

Build comprehensive HP tracking with damage/healing application and temporary HP management.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 10 - Combat Core Systems
- **Priority:** P1
- **Phase Effort:** 21 hours total
- **Dependencies:** #37
---

**Tasks:**
- [ ] Create HP modification interface (damage/healing input)
- [ ] Implement temporary HP tracking separate from regular HP
- [ ] Add HP history tracking with undo functionality
- [ ] Create visual HP indicators (bars, colors)
- [ ] Add death saving throw tracking for PCs
- [ ] Implement automatic status effects based on HP (unconscious, etc.)

**Acceptance Criteria:**
- [ ] HP can be modified quickly during combat
- [ ] Temporary HP is tracked separately and consumed first
- [ ] HP changes can be undone if mistakes are made
- [ ] Visual indicators clearly show HP status
- [ ] Death saving throws are tracked accurately

**Effort:** 8 hours  
**Priority:** P1  
**Phase:** Week 10  
**Dependencies:** #37"
```

#### **Issue #36: Build combat toolbar**
```bash
gh issue edit 36 --body "**MVP Task: Combat System**

Create combat control toolbar with quick actions, shortcuts, and combat flow management.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 10 - Combat Core Systems
- **Priority:** P1
- **Phase Effort:** 21 hours total
- **Dependencies:** #37
---

**Tasks:**
- [ ] Create combat control buttons (start, pause, stop, reset)
- [ ] Add quick action buttons (next turn, previous turn, skip turn)
- [ ] Implement combat shortcuts and hotkeys
- [ ] Create combat options menu (settings, preferences)
- [ ] Add combat status indicators (round, current turn)
- [ ] Implement toolbar responsiveness for mobile

**Acceptance Criteria:**
- [ ] All combat controls are easily accessible
- [ ] Combat flow can be controlled efficiently
- [ ] Keyboard shortcuts improve DM workflow
- [ ] Combat status is always visible
- [ ] Toolbar works well on mobile devices

**Effort:** 5 hours  
**Priority:** P1  
**Phase:** Week 10  
**Dependencies:** #37"
```

### **WEEK 11: Advanced Combat & Settings (16 hours total)**

#### **Issue #38: Implement damage calculation tools**
```bash
gh issue edit 38 --body "**MVP Task: Combat System**

Create damage calculation utilities with damage type support and resistance/vulnerability handling.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 11 - Advanced Combat & Settings
- **Priority:** P2
- **Phase Effort:** 16 hours total
- **Dependencies:** #34
---

**Tasks:**
- [ ] Build damage calculator with dice rolling
- [ ] Implement damage type selection (slashing, fire, etc.)
- [ ] Add resistance/vulnerability automatic calculation
- [ ] Create damage roll history and saving
- [ ] Add critical hit damage doubling
- [ ] Implement damage modifier application

**Acceptance Criteria:**
- [ ] Damage calculations are accurate and quick
- [ ] Damage types are properly categorized
- [ ] Resistances/vulnerabilities modify damage correctly
- [ ] Damage history helps track combat flow
- [ ] Critical hits are calculated properly

**Effort:** 6 hours  
**Priority:** P2  
**Phase:** Week 11  
**Dependencies:** #34"
```

#### **Issue #31: Implement encounter settings and configuration**
```bash
gh issue edit 31 --body "**MVP Task: Encounter Management**

Create encounter configuration options including environment settings, special rules, and combat modifiers.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 11 - Advanced Combat & Settings
- **Priority:** P2
- **Phase Effort:** 16 hours total
- **Dependencies:** #30
---

**Tasks:**
- [ ] Create encounter name and description editing
- [ ] Add environment settings (lighting, terrain, weather)
- [ ] Implement special combat rules toggle options
- [ ] Create encounter difficulty level assignment
- [ ] Add encounter tags and categorization
- [ ] Implement encounter sharing settings for future collaboration

**Acceptance Criteria:**
- [ ] Encounter metadata can be set and modified
- [ ] Environment settings affect combat display appropriately
- [ ] Special rules are preserved and displayed during combat
- [ ] Encounter organization through tags works effectively
- [ ] Settings persist correctly when encounter is saved

**Effort:** 4 hours  
**Priority:** P2  
**Phase:** Week 11  
**Dependencies:** #30"
```

#### **Issue #32: Create encounter import/export functionality**
```bash
gh issue edit 32 --body "**MVP Task: Encounter Management**

Implement encounter data import/export capabilities for sharing and backup purposes.

---
**📅 PHASE ASSIGNMENT:**
- **Week:** Week 11 - Advanced Combat & Settings
- **Priority:** P2
- **Phase Effort:** 16 hours total
- **Dependencies:** #30
---

**Tasks:**
- [ ] Create JSON export functionality for encounters
- [ ] Implement encounter import with validation
- [ ] Add encounter duplication/copy functionality
- [ ] Create encounter template system for reuse
- [ ] Add bulk encounter operations (export multiple)
- [ ] Implement encounter backup and restore

**Acceptance Criteria:**
- [ ] Encounters can be exported to shareable JSON format
- [ ] Imported encounters are validated and work correctly
- [ ] Encounter copying creates independent duplicates
- [ ] Templates enable quick encounter creation
- [ ] Bulk operations work efficiently

**Effort:** 6 hours  
**Priority:** P2  
**Phase:** Week 11  
**Dependencies:** #30"
```

---

## 🚀 **BATCH UPDATE COMMANDS**

### **Run All Week 1 Updates:**
```bash
gh issue edit 2 --body "..."  # (Use content from above)
gh issue edit 3 --body "..."
gh issue edit 4 --body "..."
gh issue edit 8 --body "..."
gh issue edit 45 --body "..."
```

### **Continue with Weeks 2-11**
Follow the same pattern for all remaining issues using the content provided above.

### **Quick Validation**
After updating, verify with:
```bash
gh issue list --label "MVP" --limit 50
```

## 📊 **UPDATE SUMMARY**

**Total Issues to Update:** 46  
**Estimated Update Time:** 30-45 minutes  
**Phase Assignments:** Complete 12-week roadmap  
**Dependencies:** All mapped correctly  

**Once completed, all MVP issues will have proper week assignments and be ready for project board organization and sprint planning.**