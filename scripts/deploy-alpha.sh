#!/bin/bash
# Deploy script for Alpha environment (Fly.io)

set -e

echo "🚀 Deploying D&D Encounter Tracker to Alpha Environment (Fly.io)"

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly.io CLI not found. Please install: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged in to Fly.io
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run: fly auth login"
    exit 1
fi

# Verify environment configuration
if [ ! -f ".env.alpha" ]; then
    echo "❌ .env.alpha file not found. Copy .env.alpha.example and configure values."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Load alpha environment variables
export $(grep -v '^#' .env.alpha | xargs)

# Set Fly.io secrets
echo "🔐 Setting Fly.io secrets..."
fly secrets set \
    NEXTAUTH_URL="$NEXTAUTH_URL" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    MONGODB_URI="$MONGODB_URI" \
    MONGODB_DB_NAME="$MONGODB_DB_NAME" \
    NODE_ENV="$NODE_ENV" \
    --app dnd-tracker-next-js

# Set optional email secrets if configured
if [ -n "$EMAIL_SERVER_HOST" ]; then
    echo "📧 Setting email configuration..."
    fly secrets set \
        EMAIL_SERVER_HOST="$EMAIL_SERVER_HOST" \
        EMAIL_SERVER_PORT="$EMAIL_SERVER_PORT" \
        EMAIL_SERVER_USER="$EMAIL_SERVER_USER" \
        EMAIL_SERVER_PASSWORD="$EMAIL_SERVER_PASSWORD" \
        EMAIL_FROM="$EMAIL_FROM" \
        --app dnd-tracker-next-js
fi

# Set optional OAuth secrets if configured
if [ -n "$GITHUB_ID" ]; then
    echo "🔐 Setting GitHub OAuth configuration..."
    fly secrets set \
        GITHUB_ID="$GITHUB_ID" \
        GITHUB_SECRET="$GITHUB_SECRET" \
        --app dnd-tracker-next-js
fi

if [ -n "$GOOGLE_ID" ]; then
    echo "🔐 Setting Google OAuth configuration..."
    fly secrets set \
        GOOGLE_ID="$GOOGLE_ID" \
        GOOGLE_SECRET="$GOOGLE_SECRET" \
        --app dnd-tracker-next-js
fi

# Build and deploy
echo "🔨 Building and deploying application..."
fly deploy --app dnd-tracker-next-js

# Check deployment status
echo "🔍 Checking deployment status..."
fly status --app dnd-tracker-next-js

# Run health check
echo "🏥 Running health check..."
HEALTH_URL="$NEXTAUTH_URL/api/health/db"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Health check passed! Application is running at: $NEXTAUTH_URL"
else
    echo "❌ Health check failed (HTTP $HTTP_STATUS). Check logs: fly logs --app dnd-tracker-next-js"
    exit 1
fi

echo "🎉 Alpha deployment completed successfully!"
echo "📋 Next steps:"
echo "   1. Test authentication flows at: $NEXTAUTH_URL/auth/signin"
echo "   2. Verify database connectivity"
echo "   3. Test password reset emails (if configured)"
echo "   4. Monitor logs: fly logs --app dnd-tracker-next-js"