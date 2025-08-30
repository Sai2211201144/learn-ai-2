
import React from 'react';
import { View } from '../../types';
import { useAppContext } from '../../context/AppContext';
import UpNextCard from './UpNextCard';
import StatsCard from './StatsCard';
import DailyQuestCard from './DailyQuestCard';

interface DashboardPageProps {
    onNavigate: (view: View) => void;
    onStartCreate: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onStartCreate }) => {
    const { localUser, courses, projects } = useAppContext();
    
    if (!localUser) return null;

    const topicsStarted = courses.length;
    const lessonsCompleted = courses.reduce((sum, course) => sum + course.progress.size, 0);
    const projectsStarted = projects.length;

    return (
        <div className="w-full max-w-screen-xl animate-fade-in mx-auto px-0 sm:px-6 lg:px-8">
            <header className="py-6">
                 <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
                    Welcome back, {localUser.name}!
                </h1>
                <p className="text-[var(--color-muted-foreground)] mt-1">Ready to dive back in and learn something new today?</p>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <UpNextCard onNavigate={onNavigate} />
                </div>
                <div className="space-y-8">
                    <DailyQuestCard />
                    <StatsCard 
                        topicsStarted={topicsStarted}
                        lessonsCompleted={lessonsCompleted}
                        projectsStarted={projectsStarted}
                    />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
