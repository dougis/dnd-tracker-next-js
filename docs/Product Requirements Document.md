# Product Requirements Document (PRD)
**Product Name:** D&D Encounter Tracker Web App  
**Version:** 2.1  
**Date:** June 8, 2025

## 1. Purpose
The D&D Encounter Tracker Web App enables Dungeon Masters to manage combat efficiently with a freemium subscription model. It supports initiative tracking, HP/AC management, class/race tracking, legendary actions, lair actions, and Dexterity-based tiebreakers. The platform offers multiple subscription tiers to monetize advanced features while providing a robust free tier for new users.

## 2. Scope
- **Core Features**: Party/encounter management, initiative and combat tracking
- **Monetization**: Multi-tier subscription system with usage limits and premium features
- **Data Management**: Cloud sync, automated backups, and data persistence
- **User Management**: Account creation, subscription management, and billing integration

## 3. Subscription Tiers & Monetization Strategy

### 3.1 Subscription Tiers

#### **Free Adventurer** - $0/month
**Target Audience:** New users, casual DMs, trial users
- 1 party, 3 encounters, 10 creatures
- 6 max participants per encounter
- Local storage only
- Basic combat tracking (including lair actions)
- Community support

#### **Seasoned Adventurer** - $4.99/month ($49.99/year)
**Target Audience:** Regular DMs running ongoing campaigns
- 3 parties, 15 encounters, 50 creatures
- 10 max participants per encounter
- Cloud sync and automated backups
- Advanced combat logging
- Export features (PDF, JSON)
- Email support

#### **Expert Dungeon Master** - $9.99/month ($99.99/year)
**Target Audience:** Serious DMs with multiple campaigns
- 10 parties, 50 encounters, 200 creatures
- 20 max participants per encounter
- Custom themes and UI customization
- Collaborative mode (shared campaigns)
- Priority email support
- Beta access to new features

#### **Master of Dungeons** - $19.99/month ($199.99/year)
**Target Audience:** Power users, content creators, professional DMs
- 25 parties, 100 encounters, 500 creatures
- 30 max participants per encounter
- Advanced analytics and reporting
- White-label options
- API access for integrations
- Priority phone/chat support

#### **Guild Master** - $39.99/month ($399.99/year)
**Target Audience:** Gaming communities, D&D clubs, professional operations
- Unlimited parties, encounters, creatures
- 50 max participants per encounter
- Multi-user organization management
- Custom branding and themes
- Dedicated account manager
- Custom integrations and enterprise features

### 3.2 Feature Gating Strategy

| Feature | Free | Seasoned | Expert | Master | Guild |
|---------|------|----------|--------|--------|-------|
| **Content Limits** |
| Parties | 1 | 3 | 10 | 25 | ∞ |
| Encounters | 3 | 15 | 50 | 100 | ∞ |
| Creatures | 10 | 50 | 200 | 500 | ∞ |
| Max Participants | 6 | 10 | 20 | 30 | 50 |
| **Data & Sync** |
| Cloud Sync | ❌ | ✅ | ✅ | ✅ | ✅ |
| Automated Backups | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Advanced Features** |
| Advanced Combat Log | ❌ | ✅ | ✅ | ✅ | ✅ |
| Custom Themes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export Features | ❌ | ✅ | ✅ | ✅ | ✅ |
| Collaborative Mode | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Support & Access** |
| Beta Access | ❌ | ❌ | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ | ✅ |

## 4. Core Features

### 4.1 User Management & Authentication
- **Account Creation**: Email/password registration with email verification
- **Subscription Management**: Self-service upgrade/downgrade, billing history
- **Usage Tracking**: Real-time monitoring of limits and feature usage
- **Trial System**: 14-day free trial of premium features for new users

### 4.2 Party Management
- **Character Creation**: Name, race, class(es) with multiclassing support, Dexterity, AC, max/current HP
- **Player Assignment**: Link characters to player names and contact info
- **Party Templates**: Save and reuse common party compositions
- **Import/Export**: Character data import from D&D Beyond, Roll20, etc.

### 4.3 Encounter Management
- **NPC/Monster Creation**: Name, AC, Dexterity, initiative modifier, HP, legendary actions, lair actions
- **Creature Library**: Searchable database with filtering by CR, type, source, special abilities
- **Template System**: Save custom creatures as templates for reuse
- **Encounter Builder**: Drag-and-drop encounter creation with CR calculation
- **Lair Configuration**: Define lair action triggers, descriptions, and environmental effects

### 4.4 Initiative & Combat Tracker
- **Initiative Rolling**: Automated or manual initiative input
- **Smart Sorting**: Initiative > Dexterity > manual override with tie-breaking
- **Turn Management**: Clear current turn indication, next/previous controls
- **Round Tracking**: Automatic round advancement with duration tracking
- **Lair Action Integration**: Automatic lair action prompts on initiative count 20

### 4.5 Combat Management
- **HP Tracking**: Damage/healing with undo functionality
- **Status Effects**: Comprehensive condition tracking with duration timers
- **Legendary Actions**: Counter management with action descriptions and usage tracking
- **Lair Actions**: Automated initiative count 20 triggers with customizable effects
  - Environment-based action descriptions
  - Visual indicators for lair action timing
  - Optional automation for recurring environmental effects
  - Integration with initiative tracker for seamless flow
- **Combat Log**: Detailed action history with timestamps including lair action usage (premium feature)

### 4.6 Data Persistence & Sync
- **Local Storage**: IndexedDB for offline functionality (free tier)
- **Cloud Sync**: Real-time data synchronization across devices (paid tiers)
- **Automated Backups**: Regular data backups with restoration options
- **Import/Export**: JSON, PDF export for data portability

## 5. User Experience Requirements

### 5.1 Onboarding
- **Welcome Flow**: Feature tour highlighting key capabilities including lair actions
- **Quick Start**: Guided encounter creation for new users with lair action examples
- **Trial Promotion**: Clear value proposition for premium features
- **Upgrade Prompts**: Contextual subscription offers when hitting limits

### 5.2 Subscription Management
- **Billing Dashboard**: Current plan, usage metrics, billing history
- **Plan Comparison**: Feature matrix with clear upgrade benefits
- **Payment Integration**: Stripe/PayPal integration with saved payment methods
- **Cancellation Flow**: Retention offers and feedback collection

### 5.3 Responsive Design
- **Mobile-First**: Touch-optimized interface for tablets and phones
- **Desktop Enhancement**: Keyboard shortcuts and multi-panel layout
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

### 5.4 Combat Flow Enhancement
- **Lair Action UX**: Clear visual cues for initiative count 20
- **Action Notifications**: Prominent alerts when lair actions are available
- **Quick Actions**: One-click lair action execution with customizable descriptions
- **Environmental Integration**: Visual themes that reflect lair-specific effects

## 6. Technical Requirements

### 6.1 Performance
- **Load Time**: Initial page load < 3 seconds
- **Responsiveness**: UI interactions < 100ms response time
- **Offline Capability**: Core features available without internet
- **Scalability**: Support for 10,000+ concurrent users

### 6.2 Security
- **Data Encryption**: TLS 1.3 for data in transit, AES-256 for data at rest
- **Authentication**: JWT tokens with refresh token rotation
- **Payment Security**: PCI DSS compliance through payment processor
- **Data Privacy**: GDPR compliance with data export/deletion

### 6.3 Integration
- **Payment Processors**: Stripe (primary), PayPal (secondary)
- **Analytics**: Mixpanel for user behavior, Stripe for subscription metrics
- **Support**: Intercom for customer support and user communication
- **CDN**: CloudFlare for global content delivery

## 7. Technology Stack

### 7.1 Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for client state, React Query for server state
- **Build Tool**: Vite for fast development and optimized builds

### 7.2 Backend
- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom JWT implementation with refresh tokens
- **File Storage**: AWS S3 for user uploads and backups

### 7.3 Infrastructure
- **Hosting**: Vercel (frontend), Railway or AWS (backend)
- **Database**: MongoDB Atlas with automated scaling
- **Monitoring**: Sentry for error tracking, Uptime Robot for availability
- **Deployment**: CI/CD pipeline with automated testing

## 8. Success Metrics

### 8.1 Business Metrics
- **Monthly Recurring Revenue (MRR)**: Target $10k MRR within 12 months
- **Customer Acquisition Cost (CAC)**: < $25 per paid customer
- **Lifetime Value (LTV)**: > $100 per paid customer
- **Churn Rate**: < 5% monthly churn for paid subscribers

### 8.2 Product Metrics
- **Free-to-Paid Conversion**: > 5% of free users upgrade within 30 days
- **Feature Adoption**: > 70% of premium users use advanced features
- **User Engagement**: > 4 sessions per month for active users
- **NPS Score**: > 50 Net Promoter Score from user surveys
- **Lair Action Usage**: > 60% of encounters with legendary creatures also use lair actions

### 8.3 Technical Metrics
- **Uptime**: 99.9% availability SLA
- **Performance**: < 3s page load time, < 100ms API response time
- **Error Rate**: < 0.1% of requests result in errors
- **Data Loss**: Zero tolerance for user data loss

## 9. Development Roadmap

### 9.1 Phase 1: MVP (Months 1-3)
- Core encounter tracking functionality
- Free tier with basic features including lair actions
- User registration and authentication
- Local data storage

### 9.2 Phase 2: Monetization (Months 4-6)
- Subscription system implementation
- Payment processing integration
- Cloud sync and backup features
- Advanced combat logging with lair action tracking

### 9.3 Phase 3: Growth Features (Months 7-9)
- Collaborative mode and sharing
- Mobile app development
- Advanced analytics and reporting
- Third-party integrations

### 9.4 Phase 4: Enterprise (Months 10-12)
- Organization management features
- White-label options
- API development
- Advanced customization options

## 10. Risk Assessment

### 10.1 Market Risks
- **Competition**: Established tools like Roll20, D&D Beyond
- **Market Size**: Limited to D&D community, potential for expansion
- **User Acquisition**: Competing for attention in crowded TTRPG market

### 10.2 Technical Risks
- **Scaling Challenges**: Database performance with large datasets
- **Payment Processing**: Integration complexity and fraud management
- **Data Synchronization**: Conflict resolution in collaborative features
- **Combat Complexity**: Managing multiple overlapping combat mechanics

### 10.3 Business Risks
- **Pricing Strategy**: Finding optimal price points for each tier
- **Feature Creep**: Balancing free vs. paid feature allocation
- **Churn Management**: Retaining subscribers long-term

## 11. Success Criteria

### 11.1 Launch Criteria
- All MVP features fully functional and tested including lair actions
- Payment processing integration complete and tested
- User onboarding flow optimized for conversion
- Basic customer support infrastructure in place

### 11.2 6-Month Success Metrics
- 1,000+ registered users with 10%+ paid conversion rate
- $5,000+ MRR with positive unit economics
- < 5% monthly churn rate for paid subscribers
- 95%+ uptime with responsive customer support

### 11.3 12-Month Success Metrics
- 5,000+ registered users with 15%+ paid conversion rate
- $25,000+ MRR with clear path to profitability
- Feature parity with major competitors
- Established brand presence in D&D community

## 12. Future Enhancement Opportunities

### 12.1 Platform Expansion
- **Mobile Apps**: Native iOS and Android applications
- **Desktop Apps**: Electron-based desktop applications for offline use
- **Browser Extensions**: Quick access tools for popular VTT platforms

### 12.2 Content Integration
- **Official Content**: Licensed D&D monster statblocks with lair actions and encounters
- **Community Content**: User-generated content marketplace for custom lairs
- **Third-Party APIs**: Integration with D&D Beyond, Roll20, Foundry VTT

### 12.3 Advanced Features
- **AI-Powered Tools**: Encounter balancing suggestions, automatic statblock generation with lair actions
- **Campaign Management**: Session planning, note-taking, story tracking
- **Analytics Dashboard**: Play style analytics and optimization suggestions
- **Environmental Effects**: Advanced lair action automation with visual effects

### 12.4 Lair Action Enhancements
- **Lair Templates**: Pre-built lair configurations for popular monster types
- **Environmental Animations**: Visual effects that trigger with lair actions
- **Conditional Lair Actions**: Complex triggers based on HP thresholds or turn counts
- **Lair Evolution**: Dynamic lair actions that change throughout combat

This updated PRD reflects the integration of lair actions as a core combat feature that enhances the tactical depth of encounter management while maintaining the freemium business model.
