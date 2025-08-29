

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnimatedLearnAIIcon, CloseIcon, LoadingSpinnerIcon } from '../common/Icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const { login, isLoading } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Fix: Call login without arguments for Google Auth flow
        if (!isLoading) {
            login();
            onClose(); 
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-[var(--color-border)] animate-modal-content relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <AnimatedLearnAIIcon className="w-20 h-20 text-[var(--color-primary)] mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Sign In to LearnAI</h1>
                    <p className="text-[var(--color-muted-foreground)] mt-2">Save your progress and access your learning across devices.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                         <label htmlFor="email" className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-[var(--color-primary-foreground)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-transform hover:scale-105 disabled:bg-gray-400"
                        >
                            {isLoading ? <><LoadingSpinnerIcon className="w-5 h-5 mr-2" /> Signing In...</> : 'Sign In / Continue'}
                        </button>
                    </div>
                </form>
                 <p className="mt-6 text-center text-xs text-[var(--color-muted-foreground)]">
                    By signing in, you create an account and agree to our terms.
                </p>
            </div>
        </div>
    );
};

export default AuthModal;