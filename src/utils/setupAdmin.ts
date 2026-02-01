import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from 'firebase/auth';

/**
 * Sets up the first user as a super admin
 * Call this after a user signs in to automatically make them admin
 */
export async function setupFirstAdmin(user: User): Promise<boolean> {
  if (!user) return false;

  try {
    // Check if this user is already an admin
    const adminDocRef = doc(db, 'admin', 'admins', 'users', user.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (adminDoc.exists()) {
      console.log('User is already an admin');
      return true;
    }

    // Create admin entry for this user
    await setDoc(adminDocRef, {
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
      role: 'super_admin',
      photoURL: user.photoURL || null,
      isActive: true,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    });

    console.log('Successfully set up user as super admin:', user.email);
    return true;
  } catch (error) {
    console.error('Error setting up admin:', error);
    return false;
  }
}

/**
 * Check if a user is an admin
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const adminDocRef = doc(db, 'admin', 'admins', 'users', userId);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists() && adminDoc.data()?.isActive === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
