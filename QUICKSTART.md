# 🚀 Quick Start - Deploy KSA Malta CMS

## Prerequisites

You're in a GitHub Codespace, so most things are already set up!

✅ Firebase CLI installed
✅ Project configured: `kwt-mt`
✅ All code ready to deploy

## Step 1: Get Firebase CI Token

**On your LOCAL MACHINE** (where you have a browser):

```bash
firebase login:ci
```

This will:
1. Open your browser
2. Ask you to login to Firebase
3. Show you a token

**Copy the token!**

## Step 2: Set Token in Codespace

Back in **this Codespace**, run:

```bash
export FIREBASE_TOKEN="paste-your-token-here"
```

## Step 3: Update Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/project/kwt-mt/settings/general)
2. Under "Your apps", find or create a Web app
3. Copy the `firebaseConfig` object
4. Update in these files:
   - `admin/js/firebase-config.js`
   - `public/cms.html` (search for `firebaseConfig`)
   - `public/preview.html` (search for `firebaseConfig`)

## Step 4: Run Deployment Script

```bash
./deploy-setup.sh
```

Choose option **4** (Deploy Everything) for first deployment.

## Step 5: Create First Admin

1. Go to [Firebase Authentication](https://console.firebase.google.com/project/kwt-mt/authentication/users)
2. Click "Add user"
3. Enter email/password
4. Copy the UID
5. Visit (replace with your values):
   ```
   https://us-central1-kwt-mt.cloudfunctions.net/createFirstAdmin?uid=YOUR_UID&secret=YOUR_SECRET
   ```

## Step 6: Access Your CMS

Visit: **https://kwt-mt.web.app/admin/login.html**

Login with the credentials from Step 5.

---

## Quick Commands

After initial setup:

```bash
# Deploy everything
npm run deploy:all

# Deploy only website changes
npm run deploy:hosting

# Deploy only security rules
npm run deploy:rules

# Deploy only functions
npm run deploy:functions
```

All commands will use `$FIREBASE_TOKEN` automatically.

## Need Help?

- **Full docs**: See `CMS_README.md`
- **Detailed setup**: See `SETUP_GUIDE.md`
- **Codespace specific**: See `DEPLOY_FROM_CODESPACE.md`

---

**That's it! You're ready to deploy! 🎉**
