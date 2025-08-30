

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added TrophyIcon to imports
import { TrophyIcon } from './Icons';

const AchievementToast: React.FC = () => {
    const { unlockedAchievementNotification, clearUnlockedAchievementNotification } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timer: number;
        if (unlockedAchievementNotification) {
            setIsVisible(true);
            timer = window.setTimeout(() => {
                setIsVisible(false);
                // Allow time for fade out animation before clearing
                setTimeout(() => {
                    clearUnlockedAchievementNotification();
                }, 300);
            }, 5000);
        }

        return () => clearTimeout(timer);
    }, [unlockedAchievementNotification, clearUnlockedAchievementNotification]);

    if (!unlockedAchievementNotification) {
        return null;
    }

    const { title, description, icon: Icon } = unlockedAchievementNotification;

    return (
        <div
            className={`fixed top-6 right-6 z-[100] w-full max-w-sm transform transition-all duration-300 ease-in-out ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div className="bg-[var(--color-card)] rounded-xl shadow-2xl border border-[var(--color-border)] p-4 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg">
                    <TrophyIcon className="w-7 h-7" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-base text-[var(--color-foreground)]">Achievement Unlocked!</h3>
                    <p className="text-sm font-semibold text-[var(--color-primary)]">{title}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default AchievementToast;