

import React, { useState, useRef, useEffect } from 'react';
import { Course, Article } from '../../types';
// FIX: Added TrashIcon to imports
import { FolderIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, BookOpenIcon, PlusIcon, FolderPlusIcon } from '../common/Icons';

// --- Menu Component ---
const FolderCardMenu: React.FC<{
    folder: { id: string; name: string };
    onRename: () => void;
    onDelete: () => void;
    onAddTopics: () => void;
    onAddArticles: () => void;
}> = ({ folder, onRename, onDelete, onAddTopics, onAddArticles }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] hover:text-[var(--color-foreground)]"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--color-card)] rounded-lg shadow-2xl border border-[var(--color-border)] z-20 animate-fade-in-up-fast">
                    <div className="p-2">
                        <button onClick={() => handleAction(onAddTopics)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                            <FolderPlusIcon className="w-5 h-5" /> Add Paths
                        </button>
                         <button onClick={() => handleAction(onAddArticles)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                            <PencilIcon className="w-5 h-5" /> Add Articles
                        </button>
                        <div className="my-1 border-t border-[var(--color-border)]"></div>
                        <button onClick={() => handleAction(onRename)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                            <PencilIcon className="w-5 h-5" /> Rename
                        </button>
                        <button onClick={() => handleAction(onDelete)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10">
                            <TrashIcon className="w-5 h-5" /> Delete Folder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Card Component ---
interface FolderGridCardProps {
    folder: { id: string; name: string; courses: Course[]; articles: Article[] };
    onClick: () => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onAddTopics: (folderId: string) => void;
    onAddArticles: (folderId: string) => void;
}

const FolderGridCard: React.FC<FolderGridCardProps> = ({ folder, onClick, onRenameFolder, onDeleteFolder, onAddTopics, onAddArticles }) => {
    const courseCount = folder.courses.length;
    const articleCount = folder.articles.length;
    const totalItems = courseCount + articleCount;
    const isUncategorized = folder.id === 'uncategorized';

    return (
        <div className="relative group bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/70 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
            <FolderIcon className="absolute w-24 h-24 text-[var(--color-secondary)]/50 -bottom-4 -right-4 -rotate-12 transform-gpu transition-transform duration-500 group-hover:scale-110" />
            
            {!isUncategorized && (
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FolderCardMenu 
                        folder={folder}
                        onRename={() => {
                            const newName = prompt("Enter new folder name:", folder.name);
                            if (newName) onRenameFolder(folder.id, newName);
                        }}
                        onDelete={() => {
                            if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
                                onDeleteFolder(folder.id);
                            }
                        }}
                        onAddTopics={() => onAddTopics(folder.id)}
                        onAddArticles={() => onAddArticles(folder.id)}
                    />
                </div>
            )}
            
            <button onClick={onClick} className="w-full h-full text-left flex flex-col flex-grow z-0">
                <div className="flex-grow">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg mb-4 bg-gradient-to-br ${isUncategorized ? 'from-gray-500/20 to-gray-500/10' : 'from-[var(--color-primary)]/20 to-[var(--color-accent)]/20'}`}>
                        <FolderIcon className={`w-7 h-7 ${isUncategorized ? 'text-gray-500' : 'text-[var(--color-primary)]'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-foreground)]">{folder.name}</h3>
                </div>

                <div className="flex-shrink-0 mt-4 space-y-2 text-sm text-[var(--color-muted-foreground)]">
                    <div className="flex items-center gap-2">
                        <BookOpenIcon className="w-4 h-4" />
                        <span>{courseCount} Learning Path{courseCount !== 1 && 's'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <PencilIcon className="w-4 h-4" />
                        <span>{articleCount} Article{articleCount !== 1 && 's'}</span>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default FolderGridCard;