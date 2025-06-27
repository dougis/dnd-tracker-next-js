# D&D Encounter Tracker

## Application Overview

A modern web application for D&D Dungeon Masters to manage combat encounters efficiently

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/bdc83f4c2f544b96ac52d06a62ae2d7f)](https://app.codacy.com/gh/dougis/dnd-tracker-next-js/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

## 🎯 **Project Status: Ready for Development**

- ✅ **Planning Phase Complete**: All business requirements, technical architecture,
  and development planning finished
- 🚀 **Development Ready**: 46 MVP issues created with 12-week roadmap
- 📋 **Total Effort**: 268 hours estimated over 12 weeks

---

## 🏗️ **Project Overview**

The D&D Encounter Tracker is a Next.js full-stack application that enables Dungeon Masters
to efficiently manage D&D 5e combat encounters with features like:

- **Initiative Tracking** with dexterity tiebreakers
- **HP/AC Management** with damage and healing tracking
- **Character Management** supporting multiclass PCs and NPCs
- **Encounter Building** with participant organization
- **Lair Actions** with initiative count 20 triggers
- **Freemium Subscription Model** with 5 pricing tiers

### **Competitive Advantage**

- Modern, responsive UI optimized for mobile and desktop
- Lair actions support (unique feature vs. competitors)
- Real-time collaboration capabilities
- Superior user experience compared to existing tools

---

## 📋 **Project Documentation**

### **📊 Business & Requirements**

- **[Product Requirements Document](./docs/Product%20Requirements%20Document.md)** -
  Complete business requirements, subscription model, and success metrics
- **[High Level Design](./docs/High%20Level%20Design.md)** -
  Technical architecture, database design, and API specifications

### **🗓️ Implementation Planning**

- **[Project Roadmap](./docs/Project%20Roadmap.md)** -
  Comprehensive task breakdown with MVP identification
- **[12-Week MVP Development Phase Plan](./docs/12-Week%20MVP%20Development%20Phase%20Plan.md)** -
  Detailed weekly development schedule
- **[GitHub Issues Update Guide](./docs/GitHub%20Issues%20Update%20Guide%20-%20Phase%20Assignments.md)** -
  Instructions for applying phase assignments

### **📈 Project Tracking**

- **[Project State Summary](./docs/D%26D%20Encounter%20Tracker%20-%20Project%20State%20Summary.md)** -
  Current project status and readiness
- **[GitHub Issues Progress](./docs/D%26D%20Tracker%20MVP%20GitHub%20Issues%20-%20Progress%20State.md)** -
  Issue creation and management tracking
- **[Final Planning Summary](./docs/FINAL%20PROJECT%20PLANNING%20SUMMARY.md)** -
  Complete planning achievement overview

---

## 🚀 **Getting Started**

### **For Development Team**

1. **Review Business Requirements**: Start with the [Product Requirements Document](./docs/Product%20Requirements%20Document.md)
2. **Understand Architecture**: Read the [High Level Design](./docs/High%20Level%20Design.md)
3. **Check Development Plan**: Review the [12-Week MVP Plan](./docs/12-Week%20MVP%20Development%20Phase%20Plan.md)
4. **Setup Project Board**: Follow instructions in the [GitHub Issues Update Guide](./docs/GitHub%20Issues%20Update%20Guide%20-%20Phase%20Assignments.md)
5. **Start Development**: Begin with Week 1 foundation tasks

### **For Project Managers**

1. **Project Status**: Check [Project State Summary](./docs/D%26D%20Encounter%20Tracker%20-%20Project%20State%20Summary.md)
2. **Issue Tracking**: Review [GitHub Issues Progress](./docs/D%26D%20Tracker%20MVP%20GitHub%20Issues%20-%20Progress%20State.md)
3. **Sprint Planning**: Use the [12-Week MVP Plan](./docs/12-Week%20MVP%20Development%20Phase%20Plan.md)
   for weekly sprints

### **For Stakeholders**

1. **Business Case**: Review [Product Requirements Document](./docs/Product%20Requirements%20Document.md)
2. **Success Metrics**: Check business goals and validation criteria
3. **Timeline**: Review [Project State Summary](./docs/D%26D%20Encounter%20Tracker%20-%20Project%20State%20Summary.md)
   for delivery timeline

---

## 🛠️ **Technology Stack**

### **Frontend**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library

### **Backend**

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB 7.0+** - Document database with Atlas hosting
- **NextAuth.js v5** - Authentication and session management
- **Mongoose** - ODM for MongoDB

### **DevOps & Tools**

- **Vercel** - Hosting and deployment platform
- **GitHub Actions** - CI/CD pipeline
- **Jest** - Testing framework
- **Sentry** - Error monitoring
- **Codacy** - Code quality and test coverage analysis

---

## 📊 **MVP Development Schedule**

### **12-Week Development Plan**

| Week | Theme                            | Hours | Key Deliverables                     |
| ---- | -------------------------------- | ----- | ------------------------------------ |
| 1    | Project Foundation              | 17h   | Next.js setup, MongoDB, Testing      |
| 2    | UI Foundation & Database        | 23h   | Tailwind, shadcn/ui, Mongoose, CI/CD |
| 3    | Authentication & Core Components| 24h   | NextAuth.js, Layout, Forms           |
| 4    | Authentication & Data Models    | 24h   | User registration, Models, Landing   |
| 5    | Character Data Layer            | 22h   | Character models, Creation, Stats    |
| 6    | Character Management            | 24h   | Character list, Editing, Validation  |
| 7    | Encounter Data Layer & NPCs     | 22h   | Encounter models, NPCs, Modals       |
| 8    | Encounter Management            | 24h   | Participants, Lists, Dashboard       |
| 9    | Combat Foundation               | 24h   | Combat state, Initiative, Rounds     |
| 10   | Combat Core Systems             | 21h   | Turn management, HP tracking         |
| 11   | Advanced Combat & Settings      | 16h   | Damage calculations, Import/export   |
| 12   | Final Polish & Completion       | 20h   | Bug fixes, Optimization, Deployment  |

#### Development Metrics

Total: 261 hours | Average: 22.3 hours/week

---

## 🎯 **MVP Features**

### **Core Functionality**

- ✅ User authentication and registration
- ✅ Character creation and management (PCs and NPCs)
- ✅ Encounter building with participant management
- ✅ Initiative tracking with automatic rolling and tiebreakers
- ✅ Turn-based combat management
- ✅ HP tracking with damage/healing
- ✅ Combat state persistence

### **User Experience**

- ✅ Mobile-first responsive design
- ✅ Intuitive drag-and-drop interfaces
- ✅ Real-time form validation
- ✅ Error handling and user feedback
- ✅ Loading states and performance optimization

---

## 🎲 **Target Audience**

### **Primary Users**

- **Dungeon Masters** running D&D 5e campaigns
- **New DMs** seeking user-friendly combat management tools
- **Experienced DMs** wanting modern alternatives to existing tools

### **Market Opportunity**

- **D&D Community**: Growing market with millions of active players
- **Existing Tools**: Competing with Roll20, D&D Beyond, Foundry VTT
- **Differentiation**: Modern UX, lair actions, mobile optimization

---

## 💰 **Business Model**

### **Freemium Subscription Tiers**

- **Free Adventurer** - $0/month (1 party, 3 encounters, 10 creatures)
- **Seasoned Adventurer** - $4.99/month (3 parties, 15 encounters, 50 creatures)
- **Expert Dungeon Master** - $9.99/month (10 parties, 50 encounters, 200 creatures)
- **Master of Dungeons** - $19.99/month (25 parties, 100 encounters, 500 creatures)
- **Guild Master** - $39.99/month (Unlimited + organization features)

### **Revenue Targets**

- **12 Months**: $25,000+ MRR with 5,000+ users
- **Conversion Rate**: 15%+ free-to-paid conversion
- **LTV/CAC**: >4:1 ratio for sustainable growth

---

## 📁 **Repository Structure**

```text
dnd-tracker-next-js/
├── docs/                          # All project documentation
│   ├── Product Requirements Document.md
│   ├── High Level Design.md
│   ├── 12-Week MVP Development Phase Plan.md
│   └── [Additional planning docs]
├── src/                           # Application source code (to be created)
├── public/                        # Static assets (to be created)
├── tests/                         # Test files (to be created)
└── README.md                      # This file
```

---

## 🔗 **Important Links**

### **GitHub**

- **Repository**: <https://github.com/dougis/dnd-tracker-next-js>
- **Issues**: <https://github.com/dougis/dnd-tracker-next-js/issues> (46 MVP issues)
- **Project Board**: _To be created during Week 1_

### **Planning Documents**

- All documentation is in the [`docs/`](./docs/) folder
- Start with [Project State Summary](./docs/D%26D%20Encounter%20Tracker%20-%20Project%20State%20Summary.md)
  for current status

---

## 🤝 **Contributing**

### **For Development Contributors**

1. Review all documentation in [`docs/`](./docs/) folder
2. Follow the [12-Week MVP Plan](./docs/12-Week%20MVP%20Development%20Phase%20Plan.md)
3. Use GitHub issues for task management
4. Follow established coding standards and PR process

### **For Project Management**

1. Setup GitHub Project Board using [update guide](./docs/GitHub%20Issues%20Update%20Guide%20-%20Phase%20Assignments.md)
2. Track progress against weekly milestones
3. Monitor dependencies and critical path

---

## 📧 **Contact & Support**

### **Project Information**

- **Planning Completed**: June 9, 2025
- **Development Start**: Ready for immediate start
- **Estimated MVP Delivery**: 12 weeks from development start

### **Key Personnel**

- **Project Owner**: dougis (GitHub)
- **Planning & Architecture**: Completed by Claude (Anthropic)

---

## 🏆 **Project Achievements**

- ✅ **Complete Business Requirements**: Validated subscription model and market opportunity
- ✅ **Technical Architecture**: Modern, scalable Next.js 15 full-stack design
- ✅ **Implementation Plan**: 46 detailed development issues with dependencies
- ✅ **12-Week Roadmap**: Realistic timeline with 20% buffer and quality gates
- ✅ **Risk Mitigation**: Clear dependencies, critical path, and contingency planning

**Status: Ready for development team to begin implementation immediately.**

---

_This project represents a comprehensive approach to building a modern D&D combat tracker
that will compete effectively in the TTRPG market while providing superior user experience
for Dungeon Masters worldwide._ ⚔️🎲

