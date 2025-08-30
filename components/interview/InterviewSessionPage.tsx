

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added StopIcon and UserCircleIcon to imports
import { PaperAirplaneIcon, StopIcon, LoadingSpinnerIcon, AcademicCapIcon, UserCircleIcon } from '../common/Icons';

const InterviewSessionPage: React.FC = () => {
    const { liveInterviewState, handleSendLiveInterviewMessage, handleEndLiveInterview } = useAppContext();
    const [userMessage, setUserMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [liveInterviewState?.transcript]);

    if (!liveInterviewState) {
        return null; // Should not happen if rendered correctly from App.tsx
    }

    const handleSend = () => {
        if (userMessage.trim() && !liveInterviewState.isLoading) {
            handleSendLiveInterviewMessage(userMessage);
            setUserMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed inset-0 bg-[var(--color-background)] z-[100] flex flex-col animate-fade-in">
            <header className="flex-shrink-0 p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-secondary)]">
                <div className="flex items-center gap-3">
                    <AcademicCapIcon className="h-6 w-6 text-[var(--color-primary)]" />
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-foreground)]">Live Interview Session</h2>
                        <p className="text-xs text-[var(--color-muted-foreground)]">Topic: {liveInterviewState.topic}</p>
                    </div>
                </div>
                <button 
                    onClick={handleEndLiveInterview}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 text-sm border border-red-500/20"
                >
                    <StopIcon className="w-5 h-5" />
                    End Session
                </button>
            </header>

            <main className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6 pb-4">
                    {liveInterviewState.transcript.map((msg, index) => (
                        <div key={index} className={`flex gap-4 text-base ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && 
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center border border-[var(--color-border)]">
                                    <AcademicCapIcon className="w-6 h-6 text-[var(--color-primary)]"/>
                                </div>
                            }
                            <div className={`max-w-xl p-4 rounded-2xl whitespace-pre-wrap shadow-md ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-br-none' : 'bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-bl-none'}`}>
                               {msg.content}
                            </div>
                            {msg.role === 'user' && 
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center border border-[var(--color-border)]">
                                    <UserCircleIcon className="w-6 h-6 text-[var(--color-muted-foreground)]"/>
                                </div>
                            }
                        </div>
                    ))}
                    {liveInterviewState.isLoading && (
                        <div className="flex gap-4 justify-start">
                             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center border border-[var(--color-border)]"><AcademicCapIcon className="w-6 h-6 text-[var(--color-primary)]"/></div>
                             <div className="max-w-xl p-4 rounded-2xl bg-[var(--color-secondary)] border border-[var(--color-border)] flex items-center shadow-md">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.4s'}}></span>
                             </div>
                        </div>
                    )}
                     <div ref={chatEndRef} />
                </div>
            </main>

            <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-secondary)]">
                <div className="max-w-4xl mx-auto">
                    {liveInterviewState.error && <p className="text-red-500 text-sm text-center mb-2">{liveInterviewState.error}</p>}
                    <div className="flex gap-3 items-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-2 focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
                        <textarea
                          value={userMessage}
                          onChange={(e) => setUserMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your response here..."
                          className="flex-grow bg-transparent p-2 text-[var(--color-foreground)] focus:outline-none resize-none"
                          rows={2}
                          disabled={liveInterviewState.isLoading}
                        />
                        <button
                          onClick={handleSend}
                          disabled={liveInterviewState.isLoading || !userMessage.trim()}
                          className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Send message"
                        >
                          <PaperAirplaneIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InterviewSessionPage;