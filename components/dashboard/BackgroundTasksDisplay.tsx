import React from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added XCircleIcon to imports
import { LoadingSpinnerIcon, CheckCircleIcon, XCircleIcon, CloseIcon } from '../common/Icons';

const BackgroundTasksDisplay: React.FC = () => {
    const { backgroundTasks, clearBackgroundTask } = useAppContext();

    if (backgroundTasks.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-6 z-50 w-full max-w-sm">
            <div className="bg-[var(--color-card)] rounded-xl shadow-2xl border border-[var(--color-border)] p-4 animate-fade-in-up">
                <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-3">Background Tasks</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {backgroundTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-2 bg-[var(--color-secondary)] rounded-lg">
                            <div className="flex-shrink-0">
                                {task.status === 'generating' && <LoadingSpinnerIcon className="w-5 h-5 text-[var(--color-primary)]" />}
                                {task.status === 'done' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                {task.status === 'error' && <XCircleIcon className="w-5 h-5 text-[var(--color-destructive)]" />}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{task.topic}</p>
                                <p className="text-xs text-[var(--color-muted-foreground)] capitalize">{task.status}</p>
                            </div>
                            <button onClick={() => clearBackgroundTask(task.id)} className="p-1 rounded-full hover:bg-[var(--color-border)]">
                                <CloseIcon className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BackgroundTasksDisplay;