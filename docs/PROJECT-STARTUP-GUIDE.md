# D&D Tracker - Project Startup Guide
**Version:** 1.0  
**Date:** June 9, 2025  
**Status:** Ready for Development

## 🎯 **Project Overview**

This guide provides step-by-step instructions to start development on the D&D Encounter Tracker, a Next.js full-stack application for managing D&D combat encounters with a freemium subscription model.

**Current Status:** ✅ All planning complete, ready for immediate development start  
**Repository:** https://github.com/dougis/dnd-tracker-next-js  
**MVP Timeline:** 12 weeks (268 hours)  
**Issues Created:** 45 MVP issues with priorities assigned

---

## 📋 **Prerequisites**

### **Required Software**
- **Node.js 22 LTS** - Latest LTS version for Next.js 15 compatibility
- **npm/yarn/pnpm** - Package manager (npm recommended)
- **Git** - Version control (2.40+)
- **VS Code** - Recommended IDE with extensions
- **MongoDB Compass** - Database GUI (optional but recommended)

### **Required Accounts**
- **GitHub Account** - Repository access and project management
- **MongoDB Atlas** - Cloud database hosting (free tier)
- **Vercel Account** - Deployment platform (free tier)
- **Stripe Account** - Future payment processing (not needed for MVP)

### **Recommended VS Code Extensions**
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- GitLens

---

## 🚀 **Phase 1: Environment Setup (Week 1)**

### **Step 1: Clone Repository**
```bash
# Clone the repository
git clone https://github.com/dougis/dnd-tracker-next-js.git
cd dnd-tracker-next-js

# Verify repository structure
ls -la
# Should see: docs/, README.md, .gitignore
```

### **Step 2: Review Project Documentation**
**📖 Essential Reading Order:**
1. **[README.md](./README.md)** - Project overview and status
2. **[Product Requirements Document](./docs/Product%20Requirements%20Document.md)** - Business requirements
3. **[High Level Design](./docs/High%20Level%20Design.md)** - Technical architecture
4. **[12-Week MVP Plan](./docs/12-Week%20MVP%20Development%20Phase%20Plan.md)** - Development timeline

### **Step 3: Setup Development Environment**
```bash
# Verify Node.js version (should be 22+)
node --version

# Create development branch
git checkout -b setup/project-foundation
git push -u origin setup/project-foundation

# Create initial project structure
mkdir -p src/{app,components,lib,types,hooks,utils}
mkdir -p public/{images,icons}
mkdir -p tests/{__mocks__,integration,e2e}
```

### **Step 4: GitHub Project Management Setup**

#### **A. Create GitHub Project Board**
1. Go to https://github.com/dougis/dnd-tracker-next-js
2. Click **Projects** tab → **New Project**
3. Select **Table** view → Name: "D&D Tracker MVP Development"
4. Add custom fields:
   - **Phase** (Single select): Phase-1, Phase-2, Phase-3
   - **Week** (Number): 1-12
   - **Effort** (Number): Hours estimate
   - **Status** (Status): Backlog, In Progress, In Review, Done

#### **B. Configure Project Views**
Create these filtered views:
- **Current Sprint** (filter by current week)
- **By Phase** (group by Phase field)
- **By Priority** (group by Priority labels)
- **Dependencies** (custom view showing blocking issues)

### **Step 5: Issue Assignment Strategy**
```bash
# Review all issues with priorities
# P1: 42 critical MVP issues
# P2: 3 important features  
# P3: 1 nice-to-have feature

# Start with these first issues:
# #2: Setup Next.js 15 project with TypeScript
# #3: Configure development environment  
# #4: Setup version control and branching strategy
```

---

## 🛠️ **Phase 2: Technical Foundation (Week 1-2)**

### **Step 6: Initialize Next.js Project**
**📝 Corresponds to Issue #2**

```bash
# Initialize Next.js 15 with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Verify installation
npm run dev
# Should open http://localhost:3000 with Next.js welcome page
```

### **Step 7: Configure Development Environment**
**📝 Corresponds to Issue #3**

```bash
# Install additional development dependencies
npm install -D prettier prettier-plugin-tailwindcss
npm install -D @types/node @types/react @types/react-dom
npm install -D jest @testing-library/react @testing-library/jest-dom

# Create configuration files
touch .env.local .env.example
touch prettier.config.js
touch jest.config.js
touch next.config.js
```

**Create `.env.example`:**
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dnd-tracker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Development
NODE_ENV=development
```

### **Step 8: Setup Version Control Strategy**
**📝 Corresponds to Issue #4**

```bash
# Create branch protection rules (via GitHub UI)
# Main branch protection:
# - Require pull request reviews
# - Require status checks to pass
# - Require linear history
# - Include administrators

# Setup conventional commit message format
echo "feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks" > .gitmessage

git config commit.template .gitmessage
```

### **Step 9: Configure Tailwind CSS & shadcn/ui**
**📝 Corresponds to Issues #5, #6**

```bash
# Tailwind should already be installed, configure shadcn/ui
npx shadcn-ui@latest init

# Install essential shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
```

---

## 🗄️ **Phase 3: Database Setup (Week 2)**

### **Step 10: MongoDB Atlas Setup**
**📝 Corresponds to Issue #8**

#### **A. Create MongoDB Atlas Cluster**
1. Go to https://cloud.mongodb.com/
2. Create account or sign in
3. Create new project: "DnD-Tracker"
4. Build a cluster (free tier M0)
5. Choose cloud provider and region (closest to your location)
6. Cluster name: "dnd-tracker-cluster"

#### **B. Configure Database Access**
1. **Database Access** → **Add New Database User**
   - Username: `dnd-tracker-user`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

2. **Network Access** → **Add IP Address**
   - Add current IP: `Add Current IP Address`
   - For development: `Allow Access from Anywhere` (0.0.0.0/0)

#### **C. Get Connection String**
1. **Clusters** → **Connect** → **Connect your application**
2. Copy connection string
3. Replace `<password>` with your database user password
4. Add to `.env.local`:
```bash
MONGODB_URI=mongodb+srv://dnd-tracker-user:<password>@dnd-tracker-cluster.xxxxx.mongodb.net/dnd-tracker?retryWrites=true&w=majority
```

### **Step 11: Install and Configure Mongoose**
**📝 Corresponds to Issue #9**

```bash
# Install Mongoose and related packages
npm install mongoose
npm install -D @types/mongoose

# Create database connection utility
mkdir src/lib/database
touch src/lib/database/mongodb.ts
touch src/lib/database/models/index.ts
```

**Create `src/lib/database/mongodb.ts`:**
```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
```

---

## 🔐 **Phase 4: Authentication Setup (Week 3-4)**

### **Step 12: NextAuth.js Configuration**
**📝 Corresponds to Issues #10, #11, #21**

```bash
# Install NextAuth.js v5 and dependencies
npm install next-auth@beta
npm install @auth/mongodb-adapter
npm install bcryptjs
npm install -D @types/bcryptjs

# Create auth configuration
mkdir src/lib/auth
touch src/lib/auth/config.ts
touch src/app/api/auth/[...nextauth]/route.ts
```

**Add to `.env.local`:**
```bash
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 📊 **Phase 5: Project Management & Tracking**

### **Step 13: Setup Development Workflow**

#### **A. Create Branch Naming Convention**
```bash
# Feature branches
git checkout -b feature/issue-number-short-description
# Example: git checkout -b feature/12-character-creation-form

# Bug fixes  
git checkout -b fix/issue-number-short-description

# Hotfixes
git checkout -b hotfix/critical-issue-description
```

#### **B. Setup Issue Workflow**
1. **Assign Issues**: Assign yourself to issues you're working on
2. **Move to In Progress**: Update project board status
3. **Create Branch**: Use naming convention above
4. **Link PR to Issue**: Use "Closes #issue-number" in PR description
5. **Request Review**: Get code review before merging

### **Step 14: Setup CI/CD Pipeline**
**📝 Corresponds to Issue #46**

```bash
# Create GitHub Actions workflow
mkdir .github/workflows
touch .github/workflows/ci.yml
touch .github/workflows/deploy.yml
```

---

## 🎯 **Phase 6: Development Kickoff**

### **Step 15: First Development Sprint Planning**

#### **Week 1 Priority Issues (17 hours total):**
- **#2**: Setup Next.js 15 project with TypeScript *(4h)*
- **#3**: Configure development environment *(4h)*
- **#4**: Setup version control and branching strategy *(2h)*
- **#8**: Setup MongoDB Atlas cluster *(3h)*  
- **#45**: Setup Jest testing framework *(4h)*

#### **Week 2 Priority Issues (23 hours total):**
- **#5**: Install and configure Tailwind CSS *(3h)*
- **#6**: Setup shadcn/ui component library *(4h)*
- **#9**: Install and configure Mongoose *(4h)*
- **#46**: Configure automated deployment pipeline *(6h)*
- **#7**: Create design system foundations *(6h)*

### **Step 16: Development Team Coordination**

#### **Daily Standup Format:**
- **Yesterday**: What issues did you complete?
- **Today**: Which issues are you working on?
- **Blockers**: Any dependencies or problems?
- **PR Status**: What needs review?

#### **Weekly Sprint Review:**
- **Completed Issues**: Verify acceptance criteria met
- **Upcoming Issues**: Plan next week's priorities  
- **Dependencies**: Check for blocking issues
- **Risks**: Identify and mitigate development risks

---

## 📚 **Reference Resources**

### **Technical Documentation**
- **Next.js 15 Docs**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **MongoDB**: https://docs.mongodb.com/
- **NextAuth.js**: https://authjs.dev/

### **Project Resources**
- **GitHub Repository**: https://github.com/dougis/dnd-tracker-next-js
- **Issues Board**: https://github.com/dougis/dnd-tracker-next-js/issues  
- **Project Planning**: All docs in `docs/` folder
- **12-Week Timeline**: docs/12-Week MVP Development Phase Plan.md

### **D&D 5e References**
- **Basic Rules**: https://www.dndbeyond.com/sources/basic-rules
- **SRD Content**: https://dnd.wizards.com/resources/systems-reference-document
- **Combat Rules**: Understanding initiative, actions, legendary actions

---

## ✅ **Success Checklist**

### **Week 1 Completion Criteria:**
- [ ] Next.js 15 project running locally
- [ ] TypeScript compilation working
- [ ] MongoDB Atlas cluster created and accessible
- [ ] GitHub repository properly configured
- [ ] Development environment fully setup
- [ ] First 3-5 issues completed and merged

### **Week 2 Completion Criteria:**
- [ ] Tailwind CSS and shadcn/ui working
- [ ] Mongoose connected to database
- [ ] Basic testing framework setup
- [ ] CI/CD pipeline configured
- [ ] Design system foundations in place

### **Week 4 Completion Criteria:**
- [ ] NextAuth.js authentication working
- [ ] User registration flow functional
- [ ] Database models created
- [ ] Basic layouts and navigation
- [ ] 15+ issues completed

---

## 🚨 **Common Issues & Solutions**

### **Node.js Version Issues**
```bash
# Use nvm to manage Node.js versions
nvm install 22
nvm use 22
nvm alias default 22
```

### **MongoDB Connection Issues**
- Verify IP whitelist includes your current IP
- Check connection string format
- Ensure database user has correct permissions
- Test connection with MongoDB Compass

### **NextAuth.js Configuration**
- Ensure NEXTAUTH_SECRET is set and secure
- Verify NEXTAUTH_URL matches your development URL
- Check MongoDB adapter configuration

### **Tailwind CSS Not Working**
- Verify tailwind.config.js content paths
- Check if Tailwind directives are in globals.css
- Restart development server after config changes

---

## 🎯 **Next Steps After Setup**

1. **Begin Development**: Start with Week 1 issues (#2, #3, #4, #8, #45)
2. **Setup Project Board**: Configure GitHub project for issue tracking
3. **Team Communication**: Establish daily standup rhythm
4. **Code Reviews**: Setup pull request review process
5. **Testing Strategy**: Plan unit and integration testing approach

---

## 📞 **Support & Resources**

### **When You're Stuck:**
1. **Check Documentation**: Review the comprehensive docs in `docs/` folder
2. **Review Issues**: Look at issue descriptions and acceptance criteria
3. **Reference Architecture**: Use High Level Design document for guidance
4. **Community Resources**: Next.js Discord, Stack Overflow, GitHub Discussions

### **Important Notes:**
- **MVP Focus**: Prioritize P1 issues for 12-week timeline
- **Quality Over Speed**: Ensure proper testing and code review
- **Documentation**: Update docs as architecture evolves
- **User Experience**: Keep D&D user workflow in mind for all decisions

---

**🚀 Ready to build the future of D&D combat tracking! Let's get started!** ⚔️🎲