# KSA Malta CMS - Quick Setup Guide

Follow these steps to set up the CMS platform from scratch.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created at https://console.firebase.google.com
- Git installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase

#### A. Update Firebase Configuration

Edit `admin/js/firebase-config.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Get these values from:
- Firebase Console → Project Settings → General → Your apps → Web app

#### B. Initialize Firebase (if not already done)

```bash
firebase login
firebase init
```

Select:
- Firestore
- Functions
- Hosting
- Storage

### 3. Enable Firebase Services

In Firebase Console:

1. **Authentication**
   - Enable Email/Password authentication
   - (Optional) Enable Google sign-in

2. **Firestore Database**
   - Create database in production mode
   - Rules will be deployed later

3. **Storage**
   - Enable Storage
   - Rules will be deployed later

4. **Functions**
   - Upgrade to Blaze (pay-as-you-go) plan
   - Required for Cloud Functions

### 4. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### 5. Configure and Deploy Cloud Functions

#### A. Set Function Configuration (IMPORTANT)

Set a secret for the createFirstAdmin function:

```bash
firebase functions:config:set admin.secret="CHOOSE_A_STRONG_SECRET_HERE"
```

#### B. Deploy Functions

```bash
firebase deploy --only functions
```

Wait for deployment to complete (may take 2-3 minutes).

### 6. Create Your First Admin User

#### A. Create User in Firebase Console

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Click "Add user"
5. Copy the UID (looks like: `xJ8kL2mN9pQ5rS6tU7vW8`)

#### B. Grant Super Admin Role

Open in browser (replace placeholders):
```
https://YOUR_PROJECT_ID.cloudfunctions.net/createFirstAdmin?uid=USER_UID&secret=YOUR_SECRET
```

You should see: "SUCCESS: Super admin role set for user ..."

#### C. Secure the Function (CRITICAL)

After creating the first admin, **remove or secure** the `createFirstAdmin` function:

Option 1 - Remove the function:
```bash
# Edit functions/index.js and delete the createFirstAdmin export
# Then redeploy:
firebase deploy --only functions
```

Option 2 - Change the secret to something nobody knows

### 7. Create Initial Pages

The CMS needs at least one page to work with. You can either:

#### Option A: Create via Firestore Console

1. Go to Firestore → Start Collection → `pages`
2. Document ID: `home`
3. Add fields:
```
meta (map):
  - title: "Home"
  - title_ar: "الرئيسية"
  - description: "KSA Malta Homepage"
  - createdAt: [Click "+" → timestamp → now]
  - lastPublishedAt: null

draft (map):
  - html: "<h1>Welcome to KSA Malta</h1><p>Start editing!</p>"
  - css: ""
  - components: ""
  - updatedAt: [timestamp now]
  - updatedBy: "your-email@example.com"
```

#### Option B: Create via Admin Dashboard

1. Log in to `/admin/login.html` with your super admin account
2. Click "Create New Page"
3. Fill in page details
4. Start editing!

### 8. Build and Deploy Website

```bash
# Build React app and prepare CMS files
npm run build:cms

# Deploy everything to Firebase Hosting
firebase deploy --only hosting
```

Your site will be live at: `https://YOUR_PROJECT_ID.web.app`

### 9. Test the CMS

1. **Login**: Visit `https://yoursite.com/admin/login.html`
2. **Dashboard**: Should see your pages listed
3. **Editor**: Click "Edit" on a page
4. **Create Content**: Use the visual editor
5. **Save Draft**: Click "💾 Save Draft"
6. **Preview**: Click "👁️ Preview"
7. **Publish**: Click "🚀 Publish"
8. **View Public**: Visit `https://yoursite.com/cms.html?page=home`

## Common Issues

### Issue: "Permission denied" when saving

**Solution**:
- Ensure Firestore rules are deployed
- Verify user has correct role (check in Functions logs)
- Try logging out and back in

### Issue: Admin page shows "not authorized"

**Solution**:
- Verify custom claims were set correctly
- Check Firebase Functions logs
- Force token refresh by logging out and back in

### Issue: Images won't upload

**Solution**:
- Deploy Storage rules: `firebase deploy --only storage`
- Check Storage bucket name in firebase-config.js
- Verify user has editor/admin role

### Issue: Functions not working

**Solution**:
```bash
# Check functions logs
firebase functions:log

# Verify functions are deployed
firebase functions:list

# Redeploy
firebase deploy --only functions
```

## Next Steps

1. **Create more pages**: arrivals, housing, souq, archive
2. **Customize content blocks**: Edit `admin/editor.html`
3. **Add more admins**: Use the `setAdminRole` function
4. **Configure emergency contacts**: Edit `public/cms.html`
5. **Add emergency contacts collection** in Firestore
6. **Customize branding**: Update colors and logos
7. **Set up custom domain**: Firebase Hosting → Custom domain

## Useful Commands

```bash
# Development
npm run dev              # Run React app locally
npm run build           # Build React app
npm run build:cms       # Build React app + copy CMS files

# Deployment
npm run deploy:all      # Deploy everything
npm run deploy:hosting  # Deploy hosting only
npm run deploy:rules    # Deploy security rules only
npm run deploy:functions # Deploy functions only

# Firebase CLI
firebase serve          # Test locally
firebase deploy         # Deploy everything
firebase functions:log  # View function logs
firebase hosting:channel:deploy CHANNEL_NAME  # Deploy to preview channel
```

## Security Checklist

- [ ] Changed admin.secret from default
- [ ] Removed/secured createFirstAdmin function
- [ ] Deployed Firestore rules
- [ ] Deployed Storage rules
- [ ] Limited super_admin role to 1-2 people
- [ ] Enabled 2FA for admin accounts (in Firebase Console)
- [ ] Reviewed audit logs regularly
- [ ] Set up Firebase App Check (recommended for production)

## Getting Help

- Check `CMS_README.md` for detailed documentation
- Review Firebase Console logs
- Check Firestore `audit_logs` collection
- Check browser console for JavaScript errors

---

**You're all set! Happy content managing! 🚀**
