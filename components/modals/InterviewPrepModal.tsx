

import React, { useEffect, useState, useMemo } from 'react';
import { Course, InterviewQuestion, KnowledgeLevel, InterviewQuestionSet } from '../../types';
import { useAppContext } from '../../context/AppContext';
// FIX: Added SparklesIcon to imports
import { CloseIcon, AcademicCapIcon, LoadingSpinnerIcon, ChevronDownIcon, SparklesIcon, PlusIcon } from '../common/Icons';

interface InterviewPrepModalProps {
    // Props are now handled by context
}

const InterviewPrepModal: React.FC<InterviewPrepModalProps> = () => {
    const { 
        interviewPrepState,
        handleGenerateInterviewQuestions,
        handleElaborateAnswer,
        resetInterviewPrep,
        closeInterviewPrepModal, // Assuming a function to close
    } = useAppContext();

    const { isOpen, course, questionSets, isGenerating, elaboratingIndex, error } = interviewPrepState;

    const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null);
    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
    const [showGenerator, setShowGenerator] = useState(false);
    const [difficulty, setDifficulty] = useState<KnowledgeLevel>('intermediate');
    const [count, setCount] = useState<number>(10);


    useEffect(() => {
        if (!isOpen) {
            resetInterviewPrep(); // Clean up state when modal closes
        }
    }, [isOpen, resetInterviewPrep]);

    useEffect(() => {
        // Automatically select the newest set when the list updates
        if (questionSets.length > 0) {
            const latestSet = questionSets.reduce((latest, current) => current.timestamp > latest.timestamp ? current : latest);
            if(selectedSetId !== latestSet.id) {
                setSelectedSetId(latestSet.id);
            }
        } else {
            setSelectedSetId(null);
        }
    }, [questionSets, selectedSetId]);
    
    useEffect(() => {
        setShowGenerator(questionSets.length === 0);
    }, [questionSets]);

    const handleGenerateClick = () => {
        if (!course) return;
        handleGenerateInterviewQuestions(course.id, difficulty, count);
        setShowGenerator(false);
    };

    const toggleQuestion = (index: number) => {
        setOpenQuestionIndex(prev => prev === index ? null : index);
    };
    
    const selectedSet = useMemo(() => {
        return questionSets.find(s => s.id === selectedSetId);
    }, [selectedSetId, questionSets]);

    if (!isOpen || !course) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={closeInterviewPrepModal}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl mx-4 border border-[var(--color-border)] animate-modal-scale-in flex flex-col h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <AcademicCapIcon className="w-7 h-7 text-[var(--color-primary)]" />
                            Interview Prep
                        </h2>
                        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">For: <span className="font-semibold text-gray-600">"{course.title}"</span></p>
                    </div>
                    <button onClick={closeInterviewPrepModal} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex flex-col md:grid md:grid-cols-12 gap-8 flex-grow min-h-0">
                    <aside className="md:col-span-4 h-full flex flex-col bg-[var(--color-secondary)] p-4 rounded-xl border border-[var(--color-border)]">
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-3 px-1">Question Sets</h3>
                        <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                           {questionSets.length > 0 ? questionSets.map(set => (
                               <button 
                                key={set.id}
                                onClick={() => setSelectedSetId(set.id)}
                                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${selectedSetId === set.id ? 'bg-indigo-50 border-[var(--color-primary)]' : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-indigo-300'}`}
                                >
                                    <p className="font-semibold text-sm capitalize text-[var(--color-foreground)]">{set.difficulty} ({set.questionCount} Qs)</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{new Date(set.timestamp).toLocaleString()}</p>
                                </button>
                           )) : (
                                !showGenerator && !isGenerating && <p className="text-sm text-[var(--color-muted-foreground)] p-2">No question sets generated yet.</p>
                           )}
                        </div>
                        <div className="flex-shrink-0 mt-4">
                            {showGenerator ? (
                                <div className="p-3 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)]">
                                    <h4 className="font-semibold text-sm mb-2">New Set</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Difficulty</label>
                                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as KnowledgeLevel)} className="w-full mt-1 p-1.5 border border-[var(--color-border)] rounded-md text-sm bg-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-primary)]">
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--color-muted-foreground)]"># of Questions</label>
                                            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full mt-1 p-1.5 border border-[var(--color-border)] rounded-md text-sm bg-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-primary)]">
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                             <button onClick={() => setShowGenerator(false)} className="w-full py-1.5 text-xs bg-[var(--color-secondary-hover)] rounded-md text-[var(--color-foreground)] font-semibold hover:bg-[var(--color-border)]">Cancel</button>
                                             <button onClick={handleGenerateClick} className="w-full py-1.5 text-xs bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-md font-semibold hover:opacity-90">Generate</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                 <button onClick={() => setShowGenerator(true)} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-lg hover:opacity-95 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-md hover:shadow-lg">
                                    {isGenerating ? <LoadingSpinnerIcon className="w-5 h-5"/> : <PlusIcon className="w-5 h-5"/>}
                                    New Question Set
                                </button>
                            )}
                        </div>
                    </aside>

                    <main className="md:col-span-8 flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-4">
                        {isGenerating && (!selectedSet || questionSets.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <LoadingSpinnerIcon className="w-8 h-8 text-[var(--color-primary)]" />
                                <p className="mt-4 text-[var(--color-muted-foreground)]">Generating your new question set...</p>
                            </div>
                        )}
                        {error && <div className="text-center text-red-500 p-8">{error}</div>}
                        {!isGenerating && !selectedSet && !error && (
                             <div className="flex flex-col items-center justify-center h-full text-center">
                                <AcademicCapIcon className="w-16 h-16 text-[var(--color-border)]" />
                                <p className="mt-4 text-[var(--color-muted-foreground)]">Select or generate a question set to begin.</p>
                            </div>
                        )}
                        {selectedSet && (
                            <div className="space-y-3">
                                {selectedSet.questions.map((q, index) => {
                                    const setIndex = questionSets.findIndex(s => s.id === selectedSetId);
                                    const isElaborating = elaboratingIndex?.setIndex === setIndex && elaboratingIndex?.qIndex === index;
                                    return (
                                        <div key={index} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
                                            <button onClick={() => toggleQuestion(index)} className="w-full flex justify-between items-center p-4 text-left">
                                                <p className="flex-1 font-semibold text-[var(--color-foreground)]">{index + 1}. {q.question}</p>
                                                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${openQuestionIndex === index ? 'rotate-180' : ''}`} />
                                            </button>
                                            {openQuestionIndex === index && (
                                                <div className="px-4 pb-4 border-t border-[var(--color-border)]">
                                                    <p className="text-[var(--color-muted-foreground)] mt-2 whitespace-pre-wrap">{q.answer}</p>
                                                    <button 
                                                        onClick={() => course && handleElaborateAnswer(course.id, selectedSet.id, index, q.question, q.answer)}
                                                        disabled={isElaborating}
                                                        className="flex items-center gap-2 mt-3 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-md hover:bg-indigo-200 disabled:opacity-70"
                                                    >
                                                        {isElaborating ? <LoadingSpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4"/>}
                                                        {isElaborating ? 'Thinking...' : 'Elaborate'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default InterviewPrepModal;