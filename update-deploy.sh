#!/bin/bash

# Quick CMS Update Deployment Script
# For deploying CMS updates to existing Firebase project

set -e

echo "🚀 KSA Malta CMS - Quick Update Deployment"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check for Firebase token
if [ -z "$FIREBASE_TOKEN" ]; then
    echo -e "${YELLOW}Firebase authentication required${NC}"
    echo ""
    echo "Run this on your LOCAL MACHINE:"
    echo -e "  ${GREEN}npx firebase login:ci${NC}"
    echo ""
    echo "Then set the token here:"
    echo -e "  ${GREEN}export FIREBASE_TOKEN=\"your-token\"${NC}"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✓ Firebase token found${NC}"
echo -e "${BLUE}Project: kwt-mt${NC}"
echo ""

# Function to deploy with token
deploy() {
    npx firebase deploy $1 --token "$FIREBASE_TOKEN"
}

echo "=========================================="
echo "Deploying CMS Updates..."
echo "=========================================="
echo ""

# Step 1: Deploy Security Rules
echo "1/4 Deploying security rules..."
deploy "--only firestore:rules,storage"
echo -e "${GREEN}✓ Security rules deployed${NC}"
echo ""

# Step 2: Deploy Cloud Functions
echo "2/4 Deploying Cloud Functions..."
cd functions
if [ ! -d "node_modules" ]; then
    echo "  Installing function dependencies..."
    npm install
fi
cd ..

# Set admin secret if not already set
if ! npx firebase functions:config:get admin.secret --token "$FIREBASE_TOKEN" &> /dev/null; then
    echo "  Setting admin secret..."
    npx firebase functions:config:set admin.secret="ksa-malta-cms-2026-secure" --token "$FIREBASE_TOKEN"
fi

deploy "--only functions"
echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
echo ""

# Step 3: Build Application
echo "3/4 Building application..."
npm run build:cms
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 4: Deploy Hosting
echo "4/4 Deploying to Firebase Hosting..."
deploy "--only hosting"
echo -e "${GREEN}✓ Hosting deployed${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Your CMS is now live at:"
echo -e "  ${BLUE}https://kwt-mt.web.app${NC}"
echo -e "  ${BLUE}https://kwt-mt.firebaseapp.com${NC}"
echo ""
echo "Admin Panel:"
echo -e "  ${BLUE}https://kwt-mt.web.app/admin/login.html${NC}"
echo ""
echo "CMS Pages:"
echo -e "  ${BLUE}https://kwt-mt.web.app/cms.html?page=home${NC}"
echo ""
echo "Next steps:"
echo "1. Create admin user in Firebase Console (Authentication → Users)"
echo "2. Grant super_admin role using createFirstAdmin function"
echo "3. Login and start creating pages!"
echo ""
