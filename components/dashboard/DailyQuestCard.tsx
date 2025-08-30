
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TrophyIcon, CheckCircleIcon } from '../common/Icons';

const DailyQuestCard: React.FC = () => {
    const { dailyQuest } = useAppContext();

    if (!dailyQuest) {
        return (
            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] h-full">
                <p className="text-sm text-[var(--color-muted-foreground)]">Loading daily quest...</p>
            </div>
        );
    }
    
    return (
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${dailyQuest.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-[var(--color-card)] border-[var(--color-border)]'}`}>
            <div className="flex items-center gap-3 mb-3">
                <TrophyIcon className={`w-6 h-6 ${dailyQuest.completed ? 'text-green-500' : 'text-amber-400'}`} />
                <h3 className="text-xl font-bold text-[var(--color-foreground)]">Daily Quest</h3>
            </div>
            
            <h4 className={`font-semibold ${dailyQuest.completed ? 'line-through text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'}`}>{dailyQuest.title}</h4>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{dailyQuest.description}</p>
            
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-amber-400">+{dailyQuest.xp} XP</span>
                {dailyQuest.completed && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
                        <CheckCircleIcon className="w-5 h-5" />
                        Completed
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyQuestCard;
