import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { auth } from '../services/firebase';
import {
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser,
} from 'firebase/auth';
import { User } from '../types';
import * as databaseService from '../services/databaseService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setIsLoading(true);
            if (fbUser) {
                setFirebaseUser(fbUser);
                try {
                    const appUser = await databaseService.getOrCreateUserProfile(fbUser);
                    setUser(appUser);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    await signOut(auth); // Log out on error
                    setUser(null);
                    setFirebaseUser(null);
                }
            } else {
                setFirebaseUser(null);
                setUser(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the rest
        } catch (error) {
            console.error("Google sign-in error", error);
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
    };

    const isAuthenticated = !!firebaseUser && !!user;

    const value = useMemo(() => ({
        isAuthenticated,
        user,
        firebaseUser,
        isLoading,
        login,
        logout,
        setUser
    }), [isAuthenticated, user, firebaseUser, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};