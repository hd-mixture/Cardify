
'use server';

import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin'; // Using admin db
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';


// This is a simplified representation. In a real app, you might want more details.
export interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  creationTime: string;
  lastSignInTime: string;
  sessions: {
    mobile: number;
    desktop: number;
  };
}

// Function to get active sessions for all users
async function getActiveSessions(): Promise<Map<string, { mobile: number; desktop: number }>> {
  const sessionsSnapshot = await db.collection('sessions').get();
  const userSessions = new Map<string, { mobile: number; desktop: number }>();

  sessionsSnapshot.forEach(doc => {
    const session = doc.data();
    const userId = session.userId;
    const deviceType = session.deviceType || 'desktop';

    if (!userSessions.has(userId)) {
      userSessions.set(userId, { mobile: 0, desktop: 0 });
    }

    const currentUserSessions = userSessions.get(userId)!;
    if (deviceType === 'mobile') {
      currentUserSessions.mobile += 1;
    } else {
      currentUserSessions.desktop += 1;
    }
  });

  return userSessions;
}


export async function listAllUsers(): Promise<UserRecord[]> {
  try {
    const [userRecords, activeSessions] = await Promise.all([
      adminAuth.listUsers(),
      getActiveSessions()
    ]);
    
    return userRecords.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      sessions: activeSessions.get(user.uid) || { mobile: 0, desktop: 0 },
    }));
  } catch (error: any) {
    console.error('Error listing users:', error);
    // Propagate a serializable error
    throw new Error(`Error loading users: ${error.message}`);
  }
}

export async function deleteUser(uid: string): Promise<{ success: boolean; message?: string }> {
    try {
        await adminAuth.deleteUser(uid);
        console.log(`Successfully deleted user ${uid}`);
        
        // Also delete all of the user's sessions from Firestore
        const sessionsQuery = db.collection('sessions').where('userId', '==', uid);
        const sessionsSnapshot = await sessionsQuery.get();
        
        if (!sessionsSnapshot.empty) {
            const batch = db.batch();
            sessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Successfully deleted all sessions for user ${uid}`);
        }

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, message: error.message };
    }
}


export async function resetUserPasswordToDefault(uid: string): Promise<{ success: boolean; message?: string }> {
    if (!uid) {
        return { success: false, message: "User ID is required." };
    }
    try {
        const newPassword = "Cardify@2025";
        await adminAuth.updateUser(uid, {
            password: newPassword,
        });
        console.log(`Password for user ${uid} has been reset to the default.`);
        return { success: true, message: `Password has been successfully reset to "Cardify@2025".` };
    } catch (error: any) {
        console.error('Error resetting user password:', error);
        let message = error.message;
        if (error.code === 'auth/user-not-found') {
            message = "No user found with this ID.";
        }
        return { success: false, message };
    }
}

export async function incrementVisitorCount(): Promise<void> {
  const statsRef = db.collection('site_stats').doc('visitors');
  try {
    // Atomically increment the count
    await statsRef.set({ count: FieldValue.increment(1) }, { merge: true });
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    // We don't throw an error here to avoid breaking the client app
  }
}

export async function getVisitorCount(): Promise<number> {
  const statsRef = db.collection('site_stats').doc('visitors');
  try {
    const doc = await statsRef.get();
    if (!doc.exists) {
      return 0; // If the document doesn't exist, count is 0
    }
    return doc.data()?.count || 0;
  } catch (error) {
    console.error("Error getting visitor count:", error);
    return 0; // Return 0 on error
  }
}
