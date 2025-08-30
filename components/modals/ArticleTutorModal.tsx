import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added UserCircleIcon to imports
import { AcademicCapIcon, LoadingSpinnerIcon, UserCircleIcon, PaperAirplaneIcon, CloseIcon } from '../common/Icons';

const ArticleTutorModal: React.FC = () => {
  const { articleTutorModalState, sendArticleTutorMessage, closeArticleTutor } = useAppContext();
  const { isOpen, isLoading, article, chatHistory } = articleTutorModalState;
  
  const [userMessage, setUserMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);
  
  const handleSend = () => {
    if (userMessage.trim() && !isLoading) {
      sendArticleTutorMessage(userMessage);
      setUserMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };
  
  if (!isOpen || !article) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={closeArticleTutor}
    >
        <div
          className={`fixed bottom-0 right-0 h-full w-full sm:h-auto sm:max-h-[85vh] sm:w-[440px] sm:bottom-6 sm:right-6 bg-[var(--color-card)] rounded-none sm:rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-10'}`}
          aria-modal="true"
          role="dialog"
          onClick={e => e.stopPropagation()}
        >
            <header className="flex-shrink-0 p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-secondary)]">
              <div className="flex items-center gap-3 min-w-0">
                <AcademicCapIcon className="h-6 w-6 text-[var(--color-primary)] flex-shrink-0" />
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-[var(--color-foreground)] truncate">Article Tutor</h2>
                    <p className="text-xs text-[var(--color-muted-foreground)] truncate" title={article.title}>{article.title}</p>
                </div>
              </div>
              <button onClick={closeArticleTutor} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                <CloseIcon className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-grow p-4 overflow-y-auto bg-[var(--color-background)]">
                <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"><AcademicCapIcon className="w-5 h-5 text-[var(--color-primary)]"/></div>}
                            <div className={`max-w-md p-3 rounded-xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-br-none' : 'bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-bl-none'}`}>
                               {msg.content}
                            </div>
                             {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"><UserCircleIcon className="w-5 h-5 text-[var(--color-muted-foreground)]"/></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"><AcademicCapIcon className="w-5 h-5 text-[var(--color-primary)]"/></div>
                             <div className="max-w-md p-3 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] flex items-center">
                                <LoadingSpinnerIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                             </div>
                        </div>
                    )}
                     <div ref={chatEndRef} />
                </div>
            </div>

            <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-secondary)]">
              <div className="flex gap-3 items-center">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this article..."
                  className="flex-grow bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-2 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !userMessage.trim()}
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold rounded-full hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </footer>
        </div>
    </div>
  );
};

export default ArticleTutorModal;