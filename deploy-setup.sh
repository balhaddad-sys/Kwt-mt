#!/bin/bash

# KSA Malta CMS - Deployment Setup Script for GitHub Codespace
# This script helps you deploy the CMS platform to Firebase

set -e

echo "🚀 KSA Malta CMS - Firebase Deployment Setup"
echo "============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure Firebase CLI is available (installed as devDependency)
if ! npx firebase --version &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI not found locally. Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✓ Firebase CLI installed${NC}"
echo ""

# Check for Firebase token
if [ -z "$FIREBASE_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No Firebase token found${NC}"
    echo ""
    echo "To deploy from GitHub Codespace, you need a Firebase CI token."
    echo ""
    echo -e "${BLUE}Follow these steps:${NC}"
    echo ""
    echo "1. On your LOCAL MACHINE (with a browser), run:"
    echo -e "   ${GREEN}npx firebase login:ci${NC}"
    echo ""
    echo "2. Complete the authentication in your browser"
    echo ""
    echo "3. Copy the token provided"
    echo ""
    echo "4. Back in this Codespace, run:"
    echo -e "   ${GREEN}export FIREBASE_TOKEN=\"your-token-here\"${NC}"
    echo ""
    echo "5. Then run this script again:"
    echo -e "   ${GREEN}./deploy-setup.sh${NC}"
    echo ""
    echo "Or deploy directly with:"
    echo -e "   ${GREEN}npx firebase deploy --token \"\$FIREBASE_TOKEN\"${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Firebase token found${NC}"
echo ""

# Verify we can access Firebase
echo "Verifying Firebase authentication..."
if npx firebase projects:list --token "$FIREBASE_TOKEN" &> /dev/null; then
    echo -e "${GREEN}✓ Successfully authenticated with Firebase${NC}"
else
    echo -e "${RED}✗ Firebase authentication failed${NC}"
    echo "Please check your token and try again."
    exit 1
fi

echo ""
echo -e "${BLUE}Current Firebase project:${NC} kwt-mt"
echo ""

# Check if Firebase config is updated
if grep -q "YOUR_API_KEY" admin/js/firebase-config.js; then
    echo -e "${YELLOW}⚠️  Firebase configuration not updated!${NC}"
    echo ""
    echo "You need to update your Firebase configuration:"
    echo ""
    echo "1. Go to: https://console.firebase.google.com/project/kwt-mt/settings/general"
    echo "2. Scroll to 'Your apps' section"
    echo "3. Copy the firebaseConfig object"
    echo "4. Update these files:"
    echo "   - admin/js/firebase-config.js"
    echo "   - public/cms.html (search for firebaseConfig)"
    echo "   - public/preview.html (search for firebaseConfig)"
    echo ""
    read -p "Have you updated the Firebase config? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Please update the Firebase config first.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Firebase configuration ready${NC}"
echo ""

# Deployment menu
echo "=========================================="
echo "What would you like to deploy?"
echo "=========================================="
echo "1) Security Rules (Firestore + Storage)"
echo "2) Cloud Functions"
echo "3) Build and Deploy Hosting"
echo "4) Deploy Everything"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Deploying security rules..."
        npx firebase deploy --only firestore:rules,storage --token "$FIREBASE_TOKEN"
        echo -e "${GREEN}✓ Security rules deployed${NC}"
        ;;
    2)
        echo ""
        echo "Installing function dependencies..."
        cd functions
        npm install
        cd ..
        echo ""
        echo "Setting admin secret..."
        read -sp "Enter a strong secret for admin functions: " admin_secret
        echo ""
        npx firebase functions:config:set admin.secret="$admin_secret" --token "$FIREBASE_TOKEN"
        echo ""
        echo "Deploying Cloud Functions..."
        npx firebase deploy --only functions --token "$FIREBASE_TOKEN"
        echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
        ;;
    3)
        echo ""
        echo "Building React app and preparing CMS files..."
        npm run build:cms
        echo ""
        echo "Deploying to Firebase Hosting..."
        npx firebase deploy --only hosting --token "$FIREBASE_TOKEN"
        echo -e "${GREEN}✓ Hosting deployed${NC}"
        echo ""
        echo "Your site is live at: https://kwt-mt.web.app"
        ;;
    4)
        echo ""
        echo "=== FULL DEPLOYMENT ==="
        echo ""

        # Security Rules
        echo "1/4 Deploying security rules..."
        npx firebase deploy --only firestore:rules,storage --token "$FIREBASE_TOKEN"
        echo -e "${GREEN}✓ Security rules deployed${NC}"
        echo ""

        # Functions
        echo "2/4 Installing function dependencies..."
        cd functions
        npm install
        cd ..
        echo ""
        echo "Setting admin secret..."
        read -sp "Enter a strong secret for admin functions: " admin_secret
        echo ""
        npx firebase functions:config:set admin.secret="$admin_secret" --token "$FIREBASE_TOKEN"
        echo ""
        echo "Deploying Cloud Functions..."
        npx firebase deploy --only functions --token "$FIREBASE_TOKEN"
        echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
        echo ""

        # Build
        echo "3/4 Building application..."
        npm run build:cms
        echo -e "${GREEN}✓ Build complete${NC}"
        echo ""

        # Hosting
        echo "4/4 Deploying to Firebase Hosting..."
        npx firebase deploy --only hosting --token "$FIREBASE_TOKEN"
        echo -e "${GREEN}✓ Hosting deployed${NC}"
        echo ""

        echo "=========================================="
        echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
        echo "=========================================="
        echo ""
        echo "Your site is live at:"
        echo -e "  ${BLUE}https://kwt-mt.web.app${NC}"
        echo -e "  ${BLUE}https://kwt-mt.firebaseapp.com${NC}"
        echo ""
        echo "Admin Panel:"
        echo -e "  ${BLUE}https://kwt-mt.web.app/admin/login.html${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Create your first admin user in Firebase Console"
        echo "2. Call createFirstAdmin function to grant super_admin role"
        echo "3. Log in to the admin panel"
        echo "4. Create your first page!"
        echo ""
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
