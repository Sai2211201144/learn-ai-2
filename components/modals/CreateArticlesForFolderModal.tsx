import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CloseIcon, PencilIcon, LoadingSpinnerIcon } from '../common/Icons';

const CreateArticlesForFolderModal: React.FC = () => {
    const { createArticlesModalState, closeCreateArticlesModal, handleGenerateBulkArticlesForPage } = useAppContext();
    const [syllabus, setSyllabus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!createArticlesModalState.isOpen) return null;

    const handleGenerate = async () => {
        if (!syllabus.trim() || !createArticlesModalState.folderId) return;
        setIsLoading(true);
        await handleGenerateBulkArticlesForPage(syllabus, createArticlesModalState.folderId);
        setIsLoading(false);
        setSyllabus('');
        closeCreateArticlesModal();
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={isLoading ? undefined : closeCreateArticlesModal}
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-[var(--color-border)] animate-modal-content flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <PencilIcon className="w-7 h-7 text-[var(--color-primary)]" />
                            Add Articles to Folder
                        </h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">Enter a topic or syllabus. The AI will generate several articles and add them here.</p>
                    </div>
                     {!isLoading && (
                        <button onClick={closeCreateArticlesModal} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                
                <textarea
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="e.g., A complete guide to Python for beginners, covering variables, data types, loops, functions, and object-oriented programming."
                    className="w-full h-48 p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                    disabled={isLoading}
                />

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <p className="text-sm text-[var(--color-muted-foreground)]">
                        The AI will generate 5-10 articles based on your input.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !syllabus.trim()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : '✨'}
                        {isLoading ? 'Generating...' : `Generate Articles`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateArticlesForFolderModal;