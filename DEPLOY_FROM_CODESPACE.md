# Deploy KSA Malta CMS from GitHub Codespace

This guide will help you deploy the CMS platform to Firebase from your GitHub Codespace.

## Current Status

✅ Firebase CLI installed (v15.5.1)
✅ Firebase project configured: `kwt-mt`
✅ All CMS files ready

## Step 1: Login to Firebase

Since you're in a GitHub Codespace, use one of these methods:

### Option A: Use Firebase CI Token (Recommended for Codespaces)

1. On your local machine (or any environment with a browser):
   ```bash
   firebase login:ci
   ```

2. Follow the browser authentication flow

3. Copy the token provided

4. In your Codespace, set the token as an environment variable:
   ```bash
   export FIREBASE_TOKEN="your-token-here"
   ```

5. Now you can deploy using:
   ```bash
   firebase deploy --token "$FIREBASE_TOKEN"
   ```

### Option B: Interactive Login (if Codespace supports it)

```bash
firebase login --no-localhost
```

Follow the URL provided and paste the authorization code back.

## Step 2: Get Your Firebase Project Config

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `kwt-mt`
3. Go to Project Settings (gear icon) → General
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" → Web (</>) icon
6. Copy the configuration object

## Step 3: Update Firebase Configuration

Update the config in `admin/js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "kwt-mt.firebaseapp.com",
    projectId: "kwt-mt",
    storageBucket: "kwt-mt.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Also update in `public/cms.html` and `public/preview.html` (search for firebaseConfig).

## Step 4: Enable Firebase Services

In Firebase Console for project `kwt-mt`:

### Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. (Optional) Enable Google sign-in

### Firestore
1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode
4. Choose your region (closest to Malta: europe-west)

### Storage
1. Go to Storage
2. Click "Get started"
3. Start in production mode

### Functions
1. Upgrade to Blaze (pay-as-you-go) plan if not already
   - Go to Project Settings → Usage and billing
   - Click "Modify plan"

## Step 5: Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

## Step 6: Deploy Cloud Functions

```bash
# Install function dependencies
cd functions
npm install
cd ..

# Set the admin secret (IMPORTANT)
firebase functions:config:set admin.secret="CHOOSE_A_STRONG_SECRET"

# Deploy functions
firebase deploy --only functions
```

This will deploy these functions:
- `setAdminRole` - Manage user roles
- `getUserRole` - Get user info
- `listUsers` - List all users
- `removeUserRole` - Remove roles
- `createFirstAdmin` - Initial admin setup
- `logPageChanges` - Auto audit logging
- `refreshUserToken` - Force token refresh

## Step 7: Create First Admin User

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password (e.g., admin@ksamalta.org)
4. Click "Add user"
5. Copy the UID

6. Call the createFirstAdmin function:
   ```bash
   # Get your function URL
   curl "https://us-central1-kwt-mt.cloudfunctions.net/createFirstAdmin?uid=YOUR_USER_UID&secret=YOUR_SECRET"
   ```

   Or visit in browser:
   ```
   https://us-central1-kwt-mt.cloudfunctions.net/createFirstAdmin?uid=YOUR_USER_UID&secret=YOUR_SECRET
   ```

7. You should see: "SUCCESS: Super admin role set for user ..."

## Step 8: Build and Deploy Website

```bash
# Build the React app and prepare CMS files
npm run build:cms

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your site will be live at: `https://kwt-mt.web.app` or `https://kwt-mt.firebaseapp.com`

## Step 9: Test the CMS

1. Visit: `https://kwt-mt.web.app/admin/login.html`
2. Login with the admin credentials you created
3. Create your first page (home, arrivals, housing, etc.)
4. Use the visual editor to build content
5. Save draft, preview, and publish!

## Quick Deploy Commands

After initial setup, use these npm scripts:

```bash
# Deploy everything
npm run deploy:all

# Deploy only hosting (after code changes)
npm run deploy:hosting

# Deploy only security rules
npm run deploy:rules

# Deploy only functions
npm run deploy:functions
```

## Troubleshooting

### "Permission denied" errors
```bash
# Make sure you're logged in
firebase login --reauth

# Or use token
firebase deploy --token "$FIREBASE_TOKEN"
```

### Functions deployment fails
```bash
# Check if Blaze plan is enabled
firebase projects:list

# View function logs
firebase functions:log
```

### Build fails
```bash
# Install dependencies
npm install

# Try building again
npm run build:cms
```

### Firebase config not found
- Make sure you updated `admin/js/firebase-config.js`
- Also update config in `public/cms.html` and `public/preview.html`

## Security Checklist

After deployment:

- [ ] Removed or secured `createFirstAdmin` function
- [ ] Changed admin.secret to a strong value
- [ ] Limited super_admin role to 1-2 trusted people
- [ ] Verified Firestore rules are deployed
- [ ] Verified Storage rules are deployed
- [ ] Tested login and permissions
- [ ] Set up billing alerts in Firebase Console

## Next Steps

1. Create initial pages (home, arrivals, housing, souq, archive)
2. Add more admin users via the dashboard
3. Customize content blocks in `admin/editor.html`
4. Set up custom domain (optional)
5. Configure Firebase App Check (recommended)

---

Need help? Check `CMS_README.md` and `SETUP_GUIDE.md` for more details.
