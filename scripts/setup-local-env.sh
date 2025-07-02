#!/bin/bash
# Setup script for local development environment

set -e

echo "🔧 Setting up D&D Encounter Tracker Local Development Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) found"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup environment file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "📋 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "⚠️  Please edit .env.local and configure your environment variables"
    else
        echo "❌ .env.example not found. Cannot create .env.local"
        exit 1
    fi
else
    echo "✅ .env.local already exists"
fi

# Generate NextAuth secret if not configured
if grep -q "your-nextauth-secret-here" .env.local 2>/dev/null; then
    echo "🔐 Generating NextAuth secret..."
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        # Replace the placeholder in .env.local
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your-nextauth-secret-here/$SECRET/" .env.local
        else
            # Linux
            sed -i "s/your-nextauth-secret-here/$SECRET/" .env.local
        fi
        echo "✅ NextAuth secret generated and saved to .env.local"
    else
        echo "⚠️  OpenSSL not found. Please manually set NEXTAUTH_SECRET in .env.local"
    fi
fi

# Check Docker availability for local containerized development
if command -v docker &> /dev/null; then
    echo "✅ Docker found - containerized development available"
    echo "   Run: docker build -f Dockerfile-local -t dnd-tracker-local ."
    echo "   Then: docker run -p 3000:3000 --env-file .env.local dnd-tracker-local"
else
    echo "⚠️  Docker not found - only local Node.js development available"
fi

# Run initial build to verify setup
echo "🔨 Running initial build to verify setup..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Check your configuration and dependencies."
    exit 1
fi

# Run tests to verify authentication setup
echo "🧪 Running authentication tests..."
if npm test -- --testNamePattern="auth" --passWithNoTests; then
    echo "✅ Authentication tests passed!"
else
    echo "⚠️  Some authentication tests failed. This may be expected if database is not configured."
fi

echo ""
echo "🎉 Local development environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your MongoDB connection string"
echo "   2. Configure optional email settings for password reset"
echo "   3. Start development server: npm run dev"
echo "   4. Open browser to: http://localhost:3000"
echo ""
echo "🔧 Available development commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm run test         - Run test suite"
echo "   npm run lint         - Lint code"
echo "   npm run format       - Format code"
echo ""
echo "📖 For more information, see:"
echo "   - docs/NEXTAUTH_SETUP_GUIDE.md"
echo "   - README.md"