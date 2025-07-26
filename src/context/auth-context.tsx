
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
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
    updatePassword
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
    user: User | null;
    loading: boolean;
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
    
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    const logout = async () => {
        setLoading(true);
        await signOut(auth);
        setUser(null);
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

    const value = { user, loading, logout, googleLogin, emailLogin, signup, updateUserProfile, checkEmailExists, reauthenticateAndChangePassword };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
