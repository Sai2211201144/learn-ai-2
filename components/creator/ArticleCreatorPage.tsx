


import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SparklesIcon, LoadingSpinnerIcon } from '../common/Icons';

interface ArticleCreatorFormProps {
    onGenerationStart: () => void;
}


const ArticleCreatorPage: React.FC<ArticleCreatorFormProps> = ({ onGenerationStart }) => {
    const { handleGenerateBlogPost, folders, activeTask } = useAppContext();
    const [topic, setTopic] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const isLoading = activeTask?.type === 'article_generation' && activeTask?.status === 'generating';

    const handleGenerateClick = () => {
        if (topic.trim() && !isLoading) {
            handleGenerateBlogPost(topic, selectedFolderId);
            onGenerationStart();
        }
    };
    
    return (
        <>
            <div className="bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateClick()}
                        placeholder="Enter your article topic..."
                        className="w-full flex-grow px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !topic.trim()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                        {isLoading ? 'Generating...' : 'Generate Article'}
                    </button>
                </div>
                 <div className="mt-4">
                    <label htmlFor="folder-select" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Save to Folder (Optional)</label>
                    <select
                        id="folder-select"
                        value={selectedFolderId || ''}
                        onChange={(e) => setSelectedFolderId(e.target.value || null)}
                        className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                        <option value="">Uncategorized</option>
                        {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </>
    );
};

export default ArticleCreatorPage;