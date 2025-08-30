
import React from 'react';
import { Article, Folder } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { PencilIcon } from '../common/Icons';
import ArticleCardMenu from './ArticleCardMenu';

const ArticleCard: React.FC<{ article: Article; folders: Folder[] }> = ({ article, folders }) => {
    const { handleSelectArticle, handleMoveArticleToFolder, handleDeleteArticle } = useAppContext();
    return (
        <div className="project-card h-full group">
            <div className="project-card-glow"></div>
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArticleCardMenu
                    article={article}
                    folders={folders}
                    onMoveArticle={handleMoveArticleToFolder}
                    onDeleteArticle={handleDeleteArticle}
                />
            </div>
            <div className="cursor-pointer flex flex-col flex-grow" onClick={() => handleSelectArticle(article.id)}>
                <div className="corner-icon" style={{ '--corner-icon-bg': 'var(--color-accent)', '--corner-icon-fg': '#ffffff' } as React.CSSProperties}>
                    <PencilIcon className="w-6 h-6"/>
                </div>
                <div className="card-content flex-grow">
                    <div className="category-tag" style={{backgroundColor: 'var(--color-accent)', color: 'white'}}>Article</div>
                    <h3 className="title line-clamp-2">{article.title}</h3>
                    <p className="description line-clamp-3">{article.subtitle}</p>
                </div>
                {article.course && (
                    <footer className="card-footer !pt-4 !mt-4">
                        <p className="text-xs text-[var(--color-muted-foreground)]">From: <span className="font-semibold">{article.course.title}</span></p>
                    </footer>
                )}
            </div>
        </div>
    );
}

export default ArticleCard;
