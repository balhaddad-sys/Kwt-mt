import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auto-setup first user as admin
async function setupAsAdmin(user: FirebaseUser): Promise<void> {
  try {
    const adminDocRef = doc(db, 'admin', 'admins', 'users', user.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists()) {
      // Make this user a super admin
      await setDoc(adminDocRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
        role: 'super_admin',
        photoURL: user.photoURL || null,
        isActive: true,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
      });
      console.log('User set up as super admin:', user.email);
    } else {
      // Update last login
      await setDoc(adminDocRef, { lastLogin: Timestamp.now() }, { merge: true });
    }
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

// Check if user is admin
async function checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const adminDocRef = doc(db, 'admin', 'admins', 'users', userId);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists() && adminDoc.data()?.isActive === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Auto-setup user as admin (for first users)
        await setupAsAdmin(user);

        // Check admin status
        const adminStatus = await checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as User);
          } else {
            // Create user profile if doesn't exist
            const newProfile: User = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || undefined,
              role: adminStatus ? 'admin' : 'member',
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set a basic profile without Firestore
          setUserProfile({
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || undefined,
            role: adminStatus ? 'admin' : 'member',
            createdAt: new Date(),
          });
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const newProfile: User = {
      id: user.uid,
      email: user.email || '',
      displayName,
      role: 'member',
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
