

import React, { useState } from 'react';
import { Course, Topic, Progress, Subtopic } from '../../types';
// FIX: Added SparklesIcon to imports
import { ChevronDownIcon, CheckIcon, BookOpenIcon, SparklesIcon } from '../common/Icons';

interface SubtopicItemProps {
    subtopic: Subtopic;
    isComplete: boolean;
    isActive: boolean;
    onClick: () => void;
}

const SubtopicItem: React.FC<SubtopicItemProps> = ({ subtopic, isComplete, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 relative group ${
                isActive ? '' : 'hover:bg-[var(--color-secondary-hover)]'
            }`}
        >
            {isActive && <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 rounded-lg opacity-75"></div>}
            <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)] rounded-l-lg transition-all duration-300 transform scale-y-0 group-hover:scale-y-75 ${isActive ? 'scale-y-100' : ''}`}></div>
            
            <div className={`relative w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center border-2 ${isComplete ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)]'}`}>
                 {isComplete ? <CheckIcon className="w-3 h-3" /> : <BookOpenIcon className="w-3 h-3 text-[var(--color-muted-foreground)]" />}
            </div>
            <span className={`relative flex-grow font-semibold text-sm ${isActive ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)]'} ${isComplete ? 'line-through' : ''}`}>
                {subtopic.title}
            </span>
             {subtopic.isAdaptive && (
                <div className="relative flex-shrink-0" title="This lesson was added by the AI to help you.">
                    <SparklesIcon className="w-4 h-4 text-indigo-400" />
                </div>
            )}
        </button>
    );
};


interface TopicAccordionProps {
    topic: Topic;
    progress: Progress;
    activeSubtopicId: string | null;
    onSelectSubtopic: (subtopic: Subtopic) => void;
}

const TopicAccordion: React.FC<TopicAccordionProps> = ({ topic, progress, activeSubtopicId, onSelectSubtopic }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border-b border-[var(--color-border)] last:border-b-0">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-left"
                aria-expanded={isExpanded}
            >
                <div className="flex-grow">
                    <h3 className="text-md font-bold text-[var(--color-foreground)]">{topic.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <ChevronDownIcon className={`w-5 h-5 text-[var(--color-muted-foreground)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                    <div className="pb-2 px-2 space-y-1">
                        {topic.subtopics.map(subtopic => (
                            <SubtopicItem 
                                key={subtopic.id} 
                                subtopic={subtopic} 
                                isComplete={progress.has(subtopic.id)} 
                                isActive={activeSubtopicId === subtopic.id}
                                onClick={() => onSelectSubtopic(subtopic)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicAccordion;