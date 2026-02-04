#!/bin/bash
# Quick deploy for KSA Malta CMS from Codespace
# Usage: ./quick-deploy.sh

set -e

echo "🚀 KSA Malta CMS - Quick Deploy"
echo "================================"
echo ""

# Check for Firebase token
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "⚠️  FIREBASE_TOKEN not set"
    echo ""
    echo "Get your token:"
    echo "  1. On LOCAL machine: npx firebase login:ci"
    echo "  2. Copy the token"
    echo "  3. Here: export FIREBASE_TOKEN=\"your-token\""
    echo ""
    echo "Then run: ./quick-deploy.sh"
    exit 1
fi

# Pull latest
echo "📥 Pulling latest code..."
git pull origin claude/ksa-malta-cms-platform-Xs18g

# Install function dependencies
echo "📦 Installing function dependencies..."
cd functions && npm install && cd ..

# Build app + CMS
echo "🔨 Building application..."
npm run build:cms

# Deploy
echo "🚀 Deploying to Firebase..."
npx firebase deploy --token "$FIREBASE_TOKEN"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site: https://kwt-mt.web.app"
echo "🔐 Admin: https://kwt-mt.web.app/admin/login.html"
echo ""
