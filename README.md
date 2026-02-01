# Kuwaiti Student Association Malta - Website

A modern, professional website for the Kuwaiti Student Association in Malta. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Responsive Design**: Mobile-first design that works beautifully on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Event Management**: Browse upcoming events, view event details, and RSVP
- **Member Directory**: Connect with fellow Kuwaiti students
- **Photo Gallery**: View memories from community events with lightbox
- **Contact Forms**: Easy-to-use contact and membership application forms
- **Admin Dashboard**: Manage events, members, gallery, and messages
- **Firebase Integration**: Real-time database, authentication, and storage

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project (for full functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kuwaitimalta.git
   cd kuwaitimalta
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "Kuwaiti-Association-Malta"
3. Enable the following services:
   - **Firestore Database** (start in test mode)
   - **Authentication** (Email/Password and Google)
   - **Storage** (for images)
   - **Hosting** (for deployment)

### 2. Configure Authentication

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Email/Password"
3. Enable "Google" sign-in

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access
    match /events/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /members/{document} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /gallery/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /contact_messages/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /membership_applications/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (EventCard, MemberCard, etc.)
│   ├── layout/          # Layout components (Navbar, Footer, Layout)
│   └── ui/              # UI primitives (Button, Card, Loading, Section)
├── contexts/
│   ├── AuthContext.tsx  # Authentication context
│   └── ThemeContext.tsx # Theme/dark mode context
├── data/
│   └── mockData.ts      # Sample data for development
├── hooks/               # Custom React hooks
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── EventsPage.tsx
│   ├── MembersPage.tsx
│   ├── GalleryPage.tsx
│   ├── ContactPage.tsx
│   ├── LoginPage.tsx
│   ├── AdminPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   └── firebase.ts      # Firebase configuration
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx
├── main.tsx
└── index.css            # Tailwind CSS imports and custom styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Color Scheme

- **Primary (Deep Blue)**: `#003366` - Represents Kuwait's flag
- **Accent (Gold)**: `#D4AF37` - Dignity & heritage
- **Neutral**: White/Gray backgrounds for readability

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

- **Email**: info@kuwaitimalta.org
- **Website**: https://kuwaitimalta.org
- **Instagram**: @kuwaitimalta
