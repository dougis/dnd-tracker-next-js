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

# Development workflow (to be implemented in Week 2)
npm run lint         # ESLint checking
npm run typecheck    # TypeScript compilation check
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode

# Database operations (to be implemented in Week 1-2)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed development data
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

## Current Status

- ✅ **Planning Phase Complete:** All requirements, architecture, and development planning finished
- 🚀 **Development Ready:** Ready for immediate implementation
- 📋 **Total Effort:** 268 hours estimated over 12 weeks
- 📊 **MVP Issues:** 46 detailed GitHub issues created

**Next Action:** Begin Week 1 development with Issue #2 (Next.js 15 project setup)