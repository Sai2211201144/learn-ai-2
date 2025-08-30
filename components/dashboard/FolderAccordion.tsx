import React, { useState } from 'react';
import type { Course, Folder, Article } from '../../types';
import { ChevronDownIcon, FolderIcon, BookOpenIcon, PencilIcon } from '../common/Icons';
import { useAppContext } from '../../context/AppContext';
import ProjectStyleCourseCard from './ProjectStyleCourseCard';
import ArticleCard from './ArticleCard';

interface FolderAccordionProps {
    folder: { id: string; name: string; courses: Course[]; articles: Article[] };
}

const FolderAccordion: React.FC<FolderAccordionProps> = ({ folder }) => {
    const { 
        folders, 
        handleSelectCourse, 
        handleMoveCourseToFolder, 
        handleDeleteCourse 
    } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(true);

    const courseCount = folder.courses.length;
    const articleCount = folder.articles.length;
    const totalItems = courseCount + articleCount;

    if (totalItems === 0 && folder.id === 'uncategorized') {
        return null;
    }

    return (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-4">
                    <FolderIcon className="w-6 h-6 text-[var(--color-primary)]" />
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-foreground)]">{folder.name}</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                            {courseCount} path{courseCount !== 1 ? 's' : ''}, {articleCount} article{articleCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-[var(--color-muted-foreground)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                    <div className="p-4 border-t border-[var(--color-border)]">
                        {totalItems > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {folder.courses.map((course) => (
                                    <ProjectStyleCourseCard 
                                        key={course.id}
                                        course={course} 
                                        folders={folders}
                                        onSelectCourse={handleSelectCourse}
                                        onMoveCourse={handleMoveCourseToFolder}
                                        onDeleteCourse={handleDeleteCourse}
                                    />
                                ))}
                                {folder.articles.map((article) => (
                                    <ArticleCard 
                                        key={article.id}
                                        article={article}
                                        folders={folders}
                                    />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-10 px-6">
                                <BookOpenIcon className="w-12 h-12 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">This folder is empty</h3>
                                <p className="text-[var(--color-muted-foreground)] mt-1 text-sm">Add learning paths or articles to this folder.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FolderAccordion;