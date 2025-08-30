
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SparklesIcon, LoadingSpinnerIcon } from '../common/Icons';

interface BulkArticleCreatorFormProps {
    onGenerationStart: () => void;
}

const BulkArticleCreatorPage: React.FC<BulkArticleCreatorFormProps> = ({ onGenerationStart }) => {
    const { 
        handleGenerateBulkArticles,
        folders,
        activeTask,
    } = useAppContext();

    const [syllabus, setSyllabus] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const isLoading = activeTask?.type === 'bulk_article_generation' && activeTask?.status === 'generating';

    const handleGenerateClick = () => {
        if (syllabus.trim()) {
            handleGenerateBulkArticles(syllabus, selectedFolderId);
            onGenerationStart();
        }
    };

    return (
        <>
            <div className="bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
                <textarea
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="Enter a broad topic or paste a syllabus here. The AI will generate a series of related articles."
                    className="w-full h-36 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    disabled={isLoading}
                />
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="bulk-folder-select" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Save to Folder (Optional)</label>
                        <select
                            id="bulk-folder-select"
                            value={selectedFolderId || ''}
                            onChange={(e) => setSelectedFolderId(e.target.value || null)}
                            className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            disabled={isLoading}
                        >
                            <option value="">Uncategorized</option>
                            {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="self-end">
                        <button
                            onClick={handleGenerateClick}
                            disabled={isLoading || !syllabus.trim()}
                            className="flex items-center justify-center gap-2 w-full px-6 py-2 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                        >
                            {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                            {isLoading ? 'Generating...' : 'Generate Articles'}
                        </button>
                    </div>
                 </div>
            </div>
        </>
    );
};

export default BulkArticleCreatorPage;