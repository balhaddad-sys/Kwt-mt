# KSA Malta CMS Platform

A professional content management system with visual editing capabilities for the Kuwaiti Students Association in Malta website.

## 🌟 Features

- **Visual Page Editor**: Powered by GrapesJS with drag-and-drop interface
- **Draft → Preview → Publish Workflow**: Professional publishing pipeline
- **Version History**: Track and restore previous versions of pages
- **Role-Based Access Control**: Super Admin, Admin, and Editor roles
- **Bilingual Support**: English and Arabic with RTL support
- **Audit Logging**: Complete activity tracking
- **Custom Content Blocks**: Pre-designed components for common content types
- **Firebase Backend**: Firestore for data, Storage for assets, Auth for security

## 📁 Project Structure

```
├── admin/                      # CMS Admin Interface
│   ├── login.html             # Admin login page
│   ├── index.html             # Admin dashboard
│   ├── editor.html            # Visual page editor (GrapesJS)
│   └── js/
│       └── firebase-config.js # Firebase configuration
├── public/                     # Public CMS pages
│   ├── cms.html               # CMS-managed content viewer (published)
│   └── preview.html           # Draft preview (auth required)
├── functions/                  # Cloud Functions
│   ├── index.js               # Admin role management functions
│   └── package.json           # Functions dependencies
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── firebase.json              # Firebase hosting configuration
└── deploy-cms.sh              # Deployment script
```

## 🚀 Quick Start

### 1. Configure Firebase

Update your Firebase configuration in `admin/js/firebase-config.js`:

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

You can find these values in:
- Firebase Console → Project Settings → General → Your apps

### 2. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### 3. Deploy Cloud Functions

```bash
# Install function dependencies
cd functions
npm install
cd ..

# Deploy functions
firebase deploy --only functions
```

### 4. Create First Super Admin

After deploying functions, create your first super admin user:

1. Create a user in Firebase Console → Authentication
2. Note the user's UID
3. Set a secret for the function (IMPORTANT for security):
   ```bash
   firebase functions:config:set admin.secret="YOUR_SECURE_SECRET_HERE"
   firebase deploy --only functions
   ```
4. Call the createFirstAdmin function:
   ```
   https://YOUR_PROJECT_ID.cloudfunctions.net/createFirstAdmin?uid=USER_UID&secret=YOUR_SECURE_SECRET_HERE
   ```

5. **IMPORTANT**: After creating the first admin, either:
   - Remove the `createFirstAdmin` function from `functions/index.js`
   - Or secure it with stricter authentication

### 5. Build and Deploy

```bash
# Build React app + Copy CMS files
npm run build:cms

# Deploy everything
npm run deploy:all

# Or deploy individually:
npm run deploy:hosting     # Deploy hosting only
npm run deploy:rules       # Deploy security rules only
npm run deploy:functions   # Deploy cloud functions only
```

## 📚 Firestore Schema

### Collection: `pages/{slug}`

```javascript
{
  meta: {
    title: string,              // Page title (English)
    title_ar: string,           // Page title (Arabic)
    description: string,        // Meta description
    ogImage: string,            // Open Graph image URL
    createdAt: timestamp,
    lastPublishedAt: timestamp
  },
  draft: {
    html: string,               // Draft HTML content
    css: string,                // Draft CSS styles
    components: string,         // GrapesJS JSON (for re-editing)
    styles: string,
    updatedAt: timestamp,
    updatedBy: string           // Email of last updater
  },
  published: {
    html: string,               // Published HTML content
    css: string,                // Published CSS styles
    publishedAt: timestamp,
    publishedBy: string,        // Email of publisher
    versionId: string           // Reference to version
  }
}
```

### Subcollection: `pages/{slug}/versions/{versionId}`

```javascript
{
  html: string,
  css: string,
  components: string,
  styles: string,
  note: string,                 // Version note/comment
  createdAt: timestamp,
  createdBy: string
}
```

### Collection: `audit_logs/{logId}`

```javascript
{
  action: string,               // "draft_save" | "publish" | "rollback"
  pageSlug: string,
  userId: string,
  userEmail: string,
  timestamp: timestamp,
  details: object,              // Additional action-specific data
  versionId: string,            // For publish/rollback actions
  note: string                  // Optional note
}
```

## 👥 User Roles

### Super Admin
- Full access to everything
- Can set/remove roles for other users
- Can create, edit, publish, and delete pages
- Can view all audit logs

### Admin
- Can publish pages to production
- Can create, edit, and delete pages
- Can view audit logs
- Cannot manage user roles

### Editor
- Can create and edit pages
- Can save drafts
- Can preview drafts
- Cannot publish or delete pages
- Cannot view audit logs

## 🔐 Role Management

### Using Cloud Functions

After logging in as a super admin, use the Firebase Functions to manage roles:

```javascript
// Get callable function reference
const functions = firebase.functions();

// Set a user's role
const setAdminRole = functions.httpsCallable('setAdminRole');
await setAdminRole({ uid: 'user-uid', role: 'admin' });

// Get user's role
const getUserRole = functions.httpsCallable('getUserRole');
const result = await getUserRole({ uid: 'user-uid' });

// List all users
const listUsers = functions.httpsCallable('listUsers');
const users = await listUsers();

// Remove a user's role
const removeUserRole = functions.httpsCallable('removeUserRole');
await removeUserRole({ uid: 'user-uid' });
```

### Available Roles
- `super_admin` - Full system access
- `admin` - Can publish content
- `editor` - Can edit and save drafts
- `null` - No CMS access (regular user)

## 📝 Content Workflow

### 1. Create a Page
1. Log in to `/admin/login.html`
2. Click "Create New Page" on the dashboard
3. Enter page title and URL slug
4. Click "Create Page"

### 2. Edit Content
1. Click "Edit" on any page in the dashboard
2. Use the visual editor to build your page
3. Drag and drop custom blocks (Hero Banner, Event Card, etc.)
4. Customize text, images, and styles

### 3. Save Draft
- Click "💾 Save Draft" button (or Ctrl/Cmd + S)
- Draft is saved to Firestore
- Not visible to public yet

### 4. Preview
- Click "👁️ Preview" button (or Ctrl/Cmd + P)
- Opens preview in new tab
- Shows how the page will look when published
- Requires authentication

### 5. Publish
- Click "🚀 Publish" button
- Confirm publication
- Add version note (optional)
- Page goes live immediately
- Version snapshot created

### 6. Restore Version
- View version history in right sidebar
- Click "Restore This Version" on any version
- Confirms and loads that version into editor
- Save as draft or publish

## 🎨 Custom Content Blocks

The editor includes pre-designed blocks for common KSA Malta content:

### Layout Blocks
- **Hero Banner**: Full-width banner with title, description, and CTA
- **Two Columns**: Responsive two-column layout

### Content Blocks
- **Event Card**: Event date, title, location, time, and registration
- **Contact Card**: Person card with photo, name, role, and contact links
- **Announcement Box**: Highlighted announcement with icon
- **FAQ Item**: Question and answer format
- **Info Box**: Information callout box

All blocks are fully customizable in the editor.

## 🌍 Bilingual Support

### Language Toggle
- Users can switch between English (EN) and Arabic (AR)
- Language preference stored in localStorage
- Automatic RTL layout for Arabic

### Implementation
Pages should include both languages:

```html
<!-- In your content blocks -->
<h1 data-lang-en="Welcome" data-lang-ar="مرحباً">Welcome</h1>
```

Or use the `meta.title` and `meta.title_ar` fields in Firestore.

## 🔍 Accessing CMS Pages

### Admin Interface
- Login: `https://yoursite.com/admin/login.html`
- Dashboard: `https://yoursite.com/admin/index.html`
- Editor: `https://yoursite.com/admin/editor.html?page=SLUG`

### Public CMS Content
- CMS Page: `https://yoursite.com/cms.html?page=SLUG`
- Preview (auth required): `https://yoursite.com/preview.html?page=SLUG`

### Available Pages (examples)
- `?page=home` - Homepage
- `?page=arrivals` - New student arrivals guide
- `?page=housing` - Housing information
- `?page=souq` - Student marketplace
- `?page=archive` - Photo/event archive

## 🛠️ Customization

### Adding Custom Blocks

Edit `admin/editor.html` and add to the `addCustomBlocks()` function:

```javascript
blockManager.add('my-custom-block', {
    label: 'My Block',
    category: 'KSA Malta',
    content: `
        <div style="...">
            Your HTML here
        </div>
    `,
    media: '<svg>...</svg>' // Block icon
});
```

### Styling

Add global styles in the `addCustomStyles()` function:

```javascript
const css = `
    .my-custom-class {
        color: #1a365d;
    }
`;
editor.setStyle(css);
```

### Color Scheme

Current brand colors:
- **Primary (Deep Blue)**: `#1a365d` - Kuwait flag blue
- **Accent (Gold)**: `#d4a853` - Heritage and dignity
- **Text**: `#212529` - Main text
- **Muted**: `#6c757d` - Secondary text

## 🔒 Security Best Practices

1. **Never commit Firebase credentials** to version control
2. **Enable App Check** in Firebase Console for production
3. **Use environment variables** for sensitive data
4. **Regularly review audit logs** for suspicious activity
5. **Limit super_admin role** to trusted individuals only
6. **Enable 2FA** for admin accounts
7. **Review Firestore rules** regularly
8. **Remove or secure** `createFirstAdmin` function after first use

## 🐛 Troubleshooting

### "Permission Denied" when accessing admin
- Check if user has correct role claim
- Try logging out and back in (forces token refresh)
- Verify Firestore rules are deployed

### Changes not appearing in preview
- Ensure draft was saved successfully
- Check browser console for errors
- Verify Firebase config is correct

### "Page not found" on published site
- Check if page was published (not just saved as draft)
- Verify URL slug is correct
- Check Firestore for published content

### Images not uploading
- Verify Storage rules are deployed
- Check file size (limit: 10MB for CMS assets)
- Ensure user has editor/admin role
- Check Firebase Storage quota

## 📞 Support

For questions or issues:
- Check Firebase Console logs
- Review `audit_logs` collection in Firestore
- Check browser console for JavaScript errors

## 📄 License

This CMS platform is part of the KSA Malta project.

---

**Built with ❤️ for the Kuwaiti Students Association in Malta**
