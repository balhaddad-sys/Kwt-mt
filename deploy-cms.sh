#!/bin/bash

# KSA Malta CMS Deployment Script
# This script prepares the CMS files for deployment alongside the main React app

set -e

echo "🚀 KSA Malta CMS Deployment Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build the React app
echo -e "${YELLOW}Step 1: Building React application...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist directory not found. Build failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ React app built successfully${NC}"
echo ""

# Step 2: Copy admin CMS files to dist
echo -e "${YELLOW}Step 2: Copying CMS admin files to dist...${NC}"

# Create admin directory in dist
mkdir -p dist/admin
mkdir -p dist/admin/js
mkdir -p dist/admin/css
mkdir -p dist/admin/blocks

# Copy admin HTML files
cp admin/login.html dist/admin/
cp admin/index.html dist/admin/
cp admin/editor.html dist/admin/

# Copy admin JavaScript
cp admin/js/firebase-config.js dist/admin/js/

echo -e "${GREEN}✓ Admin files copied${NC}"
echo ""

# Step 3: Copy public CMS files to dist
echo -e "${YELLOW}Step 3: Copying public CMS files to dist...${NC}"

# Copy CMS public pages
cp public/cms.html dist/
cp public/preview.html dist/

echo -e "${GREEN}✓ Public CMS files copied${NC}"
echo ""

# Step 4: Verify Firebase config
echo -e "${YELLOW}Step 4: Checking Firebase configuration...${NC}"

if grep -q "YOUR_API_KEY" dist/admin/js/firebase-config.js; then
    echo -e "${RED}⚠️  WARNING: Firebase config contains placeholder values!${NC}"
    echo -e "${RED}   Please update admin/js/firebase-config.js with your actual Firebase credentials${NC}"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Configuration check complete${NC}"
echo ""

# Step 5: Show deployment summary
echo -e "${GREEN}===================================="
echo "✓ CMS Deployment Preparation Complete"
echo "====================================${NC}"
echo ""
echo "Files ready for deployment in dist/ directory:"
echo "  - React App: dist/index.html + assets"
echo "  - Admin CMS: dist/admin/"
echo "  - CMS Public: dist/cms.html"
echo "  - Preview: dist/preview.html"
echo ""
echo "Next steps:"
echo "  1. Review Firebase configuration in dist/admin/js/firebase-config.js"
echo "  2. Deploy Firestore rules: firebase deploy --only firestore:rules"
echo "  3. Deploy Storage rules: firebase deploy --only storage"
echo "  4. Deploy Functions: cd functions && npm install && cd .. && firebase deploy --only functions"
echo "  5. Deploy Hosting: firebase deploy --only hosting"
echo ""
echo "Or deploy everything at once:"
echo "  firebase deploy"
echo ""
