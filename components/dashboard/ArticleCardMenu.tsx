
import React, { useState, useRef, useEffect } from 'react';
import { Article, Folder } from '../../types';
import { EllipsisVerticalIcon, FolderArrowDownIcon, TrashIcon, CheckIcon } from '../common/Icons';

interface ArticleCardMenuProps {
    article: Article;
    folders: Folder[];
    onMoveArticle: (articleId: string, folderId: string | null) => void;
    onDeleteArticle: (articleId: string) => void;
}

const ArticleCardMenu: React.FC<ArticleCardMenuProps> = ({ article, folders, onMoveArticle, onDeleteArticle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const articleFolder = folders.find(f => f.articles.some(a => a?.id === article.id));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsMoveMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMove = (targetFolderId: string | null) => {
        onMoveArticle(article.id, targetFolderId);
        setIsOpen(false);
        setIsMoveMenuOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the article "${article.title}"? This cannot be undone.`)) {
            onDeleteArticle(article.id);
        }
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] hover:text-[var(--color-foreground)]"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--color-card)] rounded-lg shadow-2xl border border-[var(--color-border)] z-20 animate-fade-in-up-fast">
                    <div className="p-2">
                        {isMoveMenuOpen ? (
                             <>
                                <button onClick={() => setIsMoveMenuOpen(false)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)]">
                                    &larr; Back
                                </button>
                                <div className="my-1 border-t border-[var(--color-border)]"></div>
                                <button onClick={() => handleMove(null)} className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                                    Uncategorized
                                    {!articleFolder && <CheckIcon className="w-4 h-4 text-[var(--color-primary)]" />}
                                </button>
                                {folders.map(folder => (
                                    <button key={folder.id} onClick={() => handleMove(folder.id)} className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                                        <span className="truncate">{folder.name}</span>
                                        {articleFolder?.id === folder.id && <CheckIcon className="w-4 h-4 text-[var(--color-primary)]" />}
                                    </button>
                                ))}
                            </>
                        ) : (
                             <>
                                <button onClick={() => setIsMoveMenuOpen(true)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]">
                                    <FolderArrowDownIcon className="w-5 h-5" />
                                    Move to...
                                </button>
                                <div className="my-1 border-t border-[var(--color-border)]"></div>
                                <button onClick={handleDelete} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10">
                                    <TrashIcon className="w-5 h-5" />
                                    Delete Article
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleCardMenu;
