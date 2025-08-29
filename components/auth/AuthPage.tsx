import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnimatedLearnAIIcon } from '../common/Icons';

const AuthPage: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-md text-center">
                <AnimatedLearnAIIcon className="w-24 h-24 text-[var(--color-primary)] mx-auto mb-6" />
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Welcome to <span className="gradient-text">LearnAI</span>
                </h1>
                <p className="max-w-md mx-auto mt-6 text-base sm:text-lg text-[var(--color-muted-foreground)]">
                    Your personal AI learning companion. Sign in to begin generating courses and tracking your progress.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                    <button 
                        onClick={login} 
                        className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h13.01c-.59 3.02-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
