import React from 'react';
import { useAuth } from '../../context/AuthContext';
// FIX: Added UserCircleIcon to imports
import { AnimatedLearnAIIcon, UserCircleIcon } from '../common/Icons';

const AuthPage: React.FC = () => {
    const { login, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-md text-center">
                <AnimatedLearnAIIcon className="w-24 h-24 text-[var(--color-primary)] mx-auto mb-6" />
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Welcome to <span className="gradient-text">LearnAI</span>
                </h1>
                <p className="max-w-md mx-auto mt-6 text-base sm:text-lg text-[var(--color-muted-foreground)]">
                    Your personal AI learning companion. Continue as a guest to generate courses and track your progress locally.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                    <button 
                        onClick={login}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold rounded-full shadow-md hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-3 disabled:opacity-50"
                    >
                        <UserCircleIcon className="w-6 h-6" />
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;