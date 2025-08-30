
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { PlayIcon, LoadingSpinnerIcon, BookOpenIcon, ClipboardDocumentCheckIcon } from '../common/Icons';
import { View } from '../../types';

interface UpNextCardProps {
    onNavigate: (view: View) => void;
}

const UpNextCard: React.FC<UpNextCardProps> = ({ onNavigate }) => {
    const { upNextItem, handleSelectCourse } = useAppContext();

    const handleClick = () => {
        if (!upNextItem) return;

        switch (upNextItem.type) {
            case 'continue_course':
            case 'start_course':
                if (upNextItem.courseId) {
                    handleSelectCourse(upNextItem.courseId);
                }
                break;
            case 'skill_assessment':
                onNavigate('assessment');
                break;
            case 'practice_topic':
                // This would navigate to a practice session, assuming implementation exists
                // onNavigate('practice', { topic: upNextItem.topic });
                break;
        }
    };

    const renderIcon = () => {
        if (!upNextItem) return <BookOpenIcon className="w-8 h-8" />;
        switch (upNextItem.type) {
            case 'continue_course':
            case 'start_course':
                return <BookOpenIcon className="w-8 h-8" />;
            case 'skill_assessment':
                return <ClipboardDocumentCheckIcon className="w-8 h-8" />;
            default:
                return <BookOpenIcon className="w-8 h-8" />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 p-6 rounded-2xl border border-[var(--color-border)] h-full flex flex-col justify-between">
            {upNextItem ? (
                <>
                    <div>
                         <p className="text-sm font-semibold text-[var(--color-primary)] flex items-center gap-2">
                            <span className="w-8 h-8 flex items-center justify-center">{renderIcon()}</span>
                            UP NEXT
                        </p>
                        <h3 className="text-2xl font-bold text-[var(--color-foreground)] mt-2">{upNextItem.title}</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-1">{upNextItem.description}</p>
                    </div>
                    <div className="mt-6">
                        <button 
                            onClick={handleClick}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <PlayIcon className="w-5 h-5"/>
                            {upNextItem.cta}
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <LoadingSpinnerIcon className="w-8 h-8 text-[var(--color-primary)]" />
                    <p className="ml-4 text-[var(--color-muted-foreground)]">Figuring out what's next for you...</p>
                </div>
            )}
        </div>
    );
};

export default UpNextCard;
