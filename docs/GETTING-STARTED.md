# 🚀 Getting Started - Day 1
**Start Time:** 5 minutes to running code  
**Full Docs:** [PROJECT-STARTUP-GUIDE.md](./PROJECT-STARTUP-GUIDE.md)

## ⚡ **Immediate Setup (Next 30 minutes)**

### **1. Clone & Setup (5 minutes)**
```bash
# Clone repository
git clone https://github.com/dougis/dnd-tracker-next-js.git
cd dnd-tracker-next-js

# Create your development branch
git checkout -b setup/project-foundation
git push -u origin setup/project-foundation

# Check Node.js version (need 22+)
node --version
```

### **2. Read Essential Context (10 minutes)**
**Must Read:**
- [README.md](../README.md) - Project overview
- [Product Requirements Document](./Product%20Requirements%20Document.md) - What we're building

**Skim for Reference:**
- [High Level Design](./High%20Level%20Design.md) - Technical architecture

### **3. Start First Issue (15 minutes)**
**Issue #2: Setup Next.js 15 project with TypeScript**

```bash
# Initialize Next.js 15 with all the options we need
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Start development server
npm run dev
```

**✅ Success:** Browser opens to http://localhost:3000 with Next.js welcome page

---

## 🎯 **Your First Day Tasks**

### **Issue #2**: Setup Next.js 15 project *(4 hours)*
- [x] Initialize Next.js with TypeScript
- [ ] Verify Tailwind CSS works
- [ ] Configure ESLint
- [ ] Test build process
- [ ] Commit and push changes

### **Issue #3**: Configure development environment *(4 hours)*
- [ ] Create `.env.local` and `.env.example`
- [ ] Install additional dev dependencies
- [ ] Configure Prettier
- [ ] Setup Jest testing
- [ ] Document environment setup

---

## 📋 **What You Need Today**

### **Required Software**
- ✅ **Node.js 22 LTS** - [Download](https://nodejs.org/)
- ✅ **Git** - Should already have
- ✅ **VS Code** - [Download](https://code.visualstudio.com/)

### **Recommended VS Code Extensions**
```
ES7+ React/Redux/React-Native snippets
TypeScript Importer
Tailwind CSS IntelliSense
Prettier - Code formatter
ESLint
```

### **Accounts Needed (Setup Later)**
- **MongoDB Atlas** - Database (Week 2)
- **Vercel** - Deployment (Week 2) 
- **GitHub** - Already have for repo access

---

## 🔧 **Essential Commands**

### **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

### **Git Workflow**
```bash
git checkout -b feature/issue-number-description
git add .
git commit -m "feat: implement feature description"
git push origin feature/issue-number-description
# Then create PR on GitHub
```

---

## 📊 **Progress Tracking**

### **GitHub Issues**
- **Total MVP Issues**: 45
- **Week 1 Focus**: Issues #2, #3, #4, #8, #45
- **Your Priority**: Start with #2, then #3

### **Success Today**
- [ ] Next.js project running locally
- [ ] TypeScript compilation working
- [ ] Git workflow established
- [ ] Development environment documented

---

## 🆘 **If You Get Stuck**

### **Common Issues**
- **Node.js Version**: Use `nvm install 22 && nvm use 22`
- **Permission Errors**: Try `npm cache clean --force`
- **Git Issues**: Ensure SSH keys or personal access token configured

### **Resources**
- **Next.js Docs**: https://nextjs.org/docs
- **Full Project Guide**: [PROJECT-STARTUP-GUIDE.md](./PROJECT-STARTUP-GUIDE.md)
- **Issue Details**: https://github.com/dougis/dnd-tracker-next-js/issues

---

## 🎯 **Tomorrow's Plan**

### **Issue #4**: Version control strategy *(2 hours)*
### **Issue #8**: MongoDB Atlas setup *(3 hours)*
### **Issue #45**: Jest testing framework *(4 hours)*

**Preparation**: Create MongoDB Atlas account (free) - we'll set this up tomorrow

---

**🚀 Ready? Run the clone command above and let's build!** ⚔️

*Need more detail? Check [PROJECT-STARTUP-GUIDE.md](./PROJECT-STARTUP-GUIDE.md) for comprehensive instructions.*