

import React from 'react';
import { CloseIcon, MinusIcon, XCircleIcon, SparklesIcon } from './Icons';
import { BackgroundTask } from '../../types';

interface LoadingDisplayProps {
    task: BackgroundTask;
    onCancel: () => void;
    onMinimize: () => void;
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ task, onCancel, onMinimize }) => {
    const { topic, status, message } = task;

    if (status === 'error') {
        return (
             <div className="relative flex flex-col p-8 sm:p-10 animate-fade-in w-full max-w-lg bg-[var(--color-card)] rounded-2xl shadow-2xl border border-red-500/50 loading-card">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                     <button 
                        onClick={onCancel} 
                        className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                        title="Close"
                        aria-label="Close"
                     >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="w-full text-center">
                    <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Generation Failed</h2>
                    <p className="text-[var(--color-muted-foreground)] mt-2">
                        Something went wrong while processing: <span className="font-semibold text-[var(--color-primary)]">{topic}</span>
                    </p>
                    <p className="mt-4 p-2 bg-[var(--color-secondary)] text-red-400 rounded-md text-sm">{message}</p>
                </div>
             </div>
        );
    }

    return (
        <div className="relative flex flex-col p-8 sm:p-10 animate-fade-in w-full max-w-lg bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] loading-card overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button 
                    onClick={onMinimize} 
                    className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                    title="Minimize"
                    aria-label="Minimize"
                >
                    <MinusIcon className="w-6 h-6" />
                </button>
                 <button 
                    onClick={onCancel} 
                    className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                    title="Cancel Generation"
                    aria-label="Cancel Generation"
                 >
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="w-full text-center relative z-10">
                <div className="relative w-40 h-40 mx-auto mb-8">
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] opacity-20"></div>
                    </div>
                     <div className="absolute inset-2 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                        <div className="w-full h-full rounded-full border-2 border-dashed border-[var(--color-primary)] opacity-30"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className="w-16 h-16 text-[var(--color-primary)] animate-pulse" />
                    </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] leading-tight">
                    Crafting your content...
                </h2>
                <p className="text-[var(--color-muted-foreground)] mt-2">
                    Topic: <span className="font-semibold text-[var(--color-primary)]">{topic}</span>
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-4 h-5">{message}</p>
            </div>
        </div>
    );
};

export default LoadingDisplay;