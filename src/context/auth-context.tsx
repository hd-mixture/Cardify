
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    fetchSignInMethodsForEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    Auth // Import Auth type
} from 'firebase/auth';
import { app, db, doc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from '@/lib/firebase'; // Import additional firestore functions
import { useMediaQuery } from '@/hooks/use-media-query';
import Cookies from 'js-cookie';


interface AuthContextType {
    user: User | null;
    loading: boolean;
    auth: Auth; // Expose auth object
    logout: () => Promise<void>;
    googleLogin: () => Promise<any>;
    emailLogin: (email: string, password: string) => Promise<any>;
    signup: (email: string, password: string, name: string) => Promise<any>;
    updateUserProfile: (updates: { name?: string; photoURL?: string }) => Promise<void>;
    checkEmailExists: (email: string) => Promise<string[]>;
    reauthenticateAndChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    
    const auth = getAuth(app);
    const sessionIdRef = React.useRef<string | null>(null);
    
    const createSession = useCallback(async (user: User) => {
        if (!user || isDesktop === null) return;
        const sessionId = doc(db, 'sessions', `${user.uid}_${Date.now()}`).id;
        sessionIdRef.current = sessionId;
        const sessionRef = doc(db, 'sessions', sessionId);
        await setDoc(sessionRef, {
            userId: user.uid,
            loginTime: new Date().toISOString(),
            deviceType: isDesktop ? 'desktop' : 'mobile'
        });
    }, [isDesktop]);

    const removeCurrentSession = useCallback(async () => {
        if (sessionIdRef.current) {
            const sessionRef = doc(db, 'sessions', sessionIdRef.current);
            await deleteDoc(sessionRef);
            sessionIdRef.current = null;
        }
    }, []);

    const removeAllUserSessions = async (userId: string) => {
        const sessionsRef = collection(db, 'sessions');
        const q = query(sessionsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        sessionIdRef.current = null;
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                createSession(user);
            } else {
                // If user is null (logged out), remove their current session
                removeCurrentSession();
                setUser(null);
            }
            setLoading(false);
        });
        
        // Handle user closing tab
        const handleBeforeUnload = () => {
             // Note: This is not guaranteed to run, but it's the best we can do for tab closes.
             // Modern browsers are very restrictive about this event.
            removeCurrentSession();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Final cleanup attempt
            removeCurrentSession();
        };
    }, [auth, createSession, removeCurrentSession]);

    const logout = async () => {
        setLoading(true);
        if (user) {
            await removeAllUserSessions(user.uid);
        }
        await signOut(auth);
        
        // No need to set user to null here as onAuthStateChanged will handle it.
        // Set visited cookie on logout if it doesn't exist.
        if (!Cookies.get('cardify_visited')) {
            Cookies.set('cardify_visited', 'true', { expires: 365 });
        }
        setLoading(false);
    };

    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    };

    const emailLogin = async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Manually update user object to reflect display name immediately
        const updatedUser = { ...userCredential.user, displayName: name, photoURL: userCredential.user.photoURL };
        setUser(updatedUser as User);
        return userCredential;
    };
    
    const updateUserProfile = async (updates: { name?: string; photoURL?: string }) => {
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { 
                displayName: updates.name ?? auth.currentUser.displayName, 
                photoURL: updates.photoURL ?? auth.currentUser.photoURL 
            });
            // Manually update the user state to reflect changes immediately
            const userWithUpdates = {
                ...auth.currentUser,
                displayName: updates.name ?? auth.currentUser.displayName,
                photoURL: updates.photoURL ?? auth.currentUser.photoURL,
            }
            setUser(userWithUpdates as User);
        } else {
            throw new Error("No user is currently signed in.");
        }
    };

    const reauthenticateAndChangePassword = async (currentPassword: string, newPassword: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            throw new Error("User not found or email is missing.");
        }

        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

        // Re-authenticate the user
        await reauthenticateWithCredential(currentUser, credential);

        // If re-authentication is successful, update the password
        await updatePassword(currentUser, newPassword);
    };

    const checkEmailExists = async (email: string): Promise<string[]> => {
        try {
            return await fetchSignInMethodsForEmail(auth, email);
        } catch (error) {
            // This can happen for invalid email formats, etc.
            // Treat as if no methods found to allow form validation to handle it.
            return [];
        }
    };

    const value = { user, loading, auth, logout, googleLogin, emailLogin, signup, updateUserProfile, checkEmailExists, reauthenticateAndChangePassword };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
