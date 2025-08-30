import React, { useState, useEffect } from 'react';
import { PlanOutline } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinnerIcon, SparklesIcon } from '../common/Icons';

interface CreatePlanFormProps {
    onCancel?: () => void;
}

const CreatePlanForm: React.FC<CreatePlanFormProps> = ({ onCancel }) => {
    const { 
        handleGeneratePlanOutline,
        handleCreateLearningPlanFromOutline,
        planOutline,
        isPlanOutlineLoading,
        clearPlanOutline,
        folders
    } = useAppContext();

    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState<string>('ai');
    const [customDuration, setCustomDuration] = useState<number>(7);
    const [syllabus, setSyllabus] = useState('');
    const [refinementPrompt, setRefinementPrompt] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    useEffect(() => {
        // Clear form when outline is cleared (e.g., after successful creation)
        if (!planOutline) {
            setTopic('');
            setSyllabus('');
            setRefinementPrompt('');
            setLocalError(null);
            setDuration('ai');
        }
    }, [planOutline]);

    const handleInitialGenerate = () => {
        if (!topic.trim()) {
            setLocalError("Please enter a topic to create a plan for.");
            return;
        }
        const finalDuration = duration === 'custom' ? customDuration : undefined;
        handleGeneratePlanOutline(topic, finalDuration, syllabus);
    };

    const handleRefineGenerate = () => {
        handleGeneratePlanOutline(topic, undefined, syllabus, refinementPrompt);
        setRefinementPrompt('');
    };

    const handleFinalGenerate = () => {
        if (planOutline) {
            handleCreateLearningPlanFromOutline(planOutline, selectedFolderId);
            // Don't call onClose here, AppContext will handle state changes
        }
    };
    
    if (isPlanOutlineLoading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-[var(--color-secondary)] rounded-lg">
                <LoadingSpinnerIcon className="w-10 h-10 text-[var(--color-primary)]" />
                <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is drafting your plan...</p>
            </div>
        );
    }

    if (planOutline) {
        return (
            <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] animate-fade-in">
                <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">Generated Plan Outline</h3>
                 <div className="space-y-4">
                    <div className="max-h-64 overflow-y-auto bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-border)] space-y-2">
                        {planOutline.dailyBreakdown.map(day => (
                            <div key={day.day} className="p-2 bg-[var(--color-card)] rounded">
                                <p className="font-bold text-sm">Day {day.day}: {day.title}</p>
                                <p className="text-xs text-[var(--color-muted-foreground)]">{day.objective}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--color-foreground)] mb-2">Need changes?</h4>
                        <textarea value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} placeholder="e.g., 'Make it more focused on backend development'" className="w-full p-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-md text-sm"/>
                        <button onClick={handleRefineGenerate} disabled={!refinementPrompt.trim()} className="mt-2 text-sm text-[var(--color-primary)] font-semibold disabled:opacity-50">Regenerate Outline</button>
                    </div>
                    <div>
                        <label htmlFor="folder-select-plan" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Save to Folder (Optional)</label>
                        <select id="folder-select-plan" value={selectedFolderId || ''} onChange={(e) => setSelectedFolderId(e.target.value || null)} className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)]">
                            <option value="">Uncategorized</option>
                            {folders.map(folder => (<option key={folder.id} value={folder.id}>{folder.name}</option>))}
                        </select>
                    </div>
                </div>
                <footer className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-between items-center flex-shrink-0">
                    <button onClick={clearPlanOutline} className="text-sm font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                        &larr; Back to Topic
                    </button>
                    <button onClick={handleFinalGenerate} className="px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 shadow-lg"> Create Full Plan & Course </button>
                </footer>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)]">
            <div className="space-y-6">
                 <div>
                    <label htmlFor="plan-topic-input" className="text-lg font-semibold text-[var(--color-foreground)] mb-2 block">What's your learning goal?</label>
                    <input id="plan-topic-input" type="text" value={topic} onChange={(e) => { setTopic(e.target.value); setLocalError(null); }} placeholder="e.g., 'Master Advanced SQL'" className="w-full px-4 py-3 bg-[var(--color-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg" />
                </div>
                <div>
                    <label htmlFor="plan-syllabus-input" className="font-semibold text-[var(--color-foreground)] mb-2 block">Syllabus / Key Points (Optional)</label>
                    <textarea id="plan-syllabus-input" value={syllabus} onChange={(e) => setSyllabus(e.target.value)} placeholder="Paste a syllabus or list key concepts to cover..." className="w-full h-24 p-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-md text-sm"/>
                </div>
                <div className="p-4 bg-[var(--color-secondary)]/50 rounded-lg space-y-4">
                    <h4 className="font-semibold text-sm text-[var(--color-muted-foreground)] mb-2">Plan Duration</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setDuration('ai')} className={`flex-1 text-center py-2 rounded-md text-sm font-semibold border ${duration === 'ai' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}> ✨ AI Optimal </button>
                        <button onClick={() => setDuration('custom')} className={`flex-1 text-center py-2 rounded-md text-sm font-semibold border ${duration === 'custom' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}> Custom </button>
                    </div>
                    {duration === 'custom' && (
                         <div className="flex items-center gap-2 animate-fade-in-up-fast">
                            <input type="number" value={customDuration} onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))} className="w-24 px-3 py-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md" min="1" />
                            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">days</span>
                         </div>
                    )}
                </div>
            </div>
            {localError && <p className="mt-4 text-center text-red-500 animate-shake text-sm">{localError}</p>}
            <footer className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-end items-center flex-shrink-0 gap-4">
                 {onCancel && <button onClick={onCancel} className="px-6 py-3 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">Cancel</button>}
                 <button onClick={handleInitialGenerate} disabled={!topic.trim()} className="px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 shadow-lg disabled:opacity-50"> Generate Outline </button>
            </footer>
        </div>
    );
};

export default CreatePlanForm;
