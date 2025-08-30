
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as storageService from '../services/storageService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Automatically initialize a guest session on mount.
        const initializeSession = () => {
            setIsLoading(true);
            try {
                let guestUser = storageService.getGuestUserProfile();
                if (!guestUser) {
                    guestUser = {
                        id: `guest_${Date.now()}`,
                        email: 'guest@learnai.com',
                        name: 'Guest User',
                        xp: 0,
                        level: 1,
                        achievements: [],
                        courses: [],
                        projects: [],
                        articles: [],
                        folders: [],
                        learningPlans: [],
                        habits: [],
                    };
                    storageService.saveGuestUserProfile(guestUser);
                }
                setUser(guestUser);
            } catch (error) {
                console.error("Failed to initialize guest session", error);
                setUser(null); // Ensure we don't proceed with a broken state
            } finally {
                setIsLoading(false);
            }
        };
        initializeSession();
    }, []);

    const login = useCallback(() => {
        // This function is no longer called as the session is created automatically.
    }, []);

    const logout = () => {
        storageService.resetApplication();
        // Reloading the page will trigger the useEffect to create a new guest session
        window.location.reload();
    };

    const isAuthenticated = !!user;

    const value = useMemo(() => ({
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        setUser
    }), [isAuthenticated, user, isLoading, login]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
