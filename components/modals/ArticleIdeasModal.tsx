

import React from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added SparklesIcon to imports
import { CloseIcon, LightBulbIcon, LoadingSpinnerIcon, SparklesIcon } from '../common/Icons';

const ArticleIdeasModal: React.FC = () => {
    const { 
        articleIdeasModalState, 
        closeArticleIdeasModal, 
        handleGenerateArticle
    } = useAppContext();
    
    const { isOpen, isLoading, course, ideas, error } = articleIdeasModalState;

    if (!isOpen || !course) return null;

    const handleGenerate = (idea: string) => {
        handleGenerateArticle(idea, course.id);
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={isLoading ? undefined : closeArticleIdeasModal}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-[var(--color-border)] animate-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <LightBulbIcon className="w-7 h-7 text-yellow-400" />
                            Generate Article Ideas
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">Based on your course: <span className="font-semibold text-[var(--color-foreground)]">"{course.title}"</span></p>
                    </div>
                    {!isLoading && (
                        <button onClick={closeArticleIdeasModal} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <div className="mt-6 min-h-[200px]">
                    {isLoading && !ideas.length ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinnerIcon className="w-8 h-8 text-yellow-500" />
                            <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is brainstorming ideas...</p>
                        </div>
                    ) : error ? (
                         <div className="text-center text-red-500 p-8">
                            <p className="font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : ideas.length > 0 ? (
                        <div className="space-y-3">
                            {ideas.map((idea, index) => (
                                <div key={index} className="bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center">
                                     <p className="flex-grow text-[var(--color-foreground)]">{idea}</p>
                                     <button 
                                        onClick={() => handleGenerate(idea)}
                                        disabled={isLoading}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 text-sm disabled:bg-gray-400"
                                     >
                                        {isLoading ? <LoadingSpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4"/>}
                                        Generate
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10">
                            <p className="text-[var(--color-muted-foreground)]">No ideas generated. Try again?</p>
                        </div>
                    )}
                </div>

                 <div className="mt-8 flex justify-end">
                    <button onClick={closeArticleIdeasModal} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleIdeasModal;