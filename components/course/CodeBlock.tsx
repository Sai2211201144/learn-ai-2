import React, { useState, useRef, useEffect } from 'react';
import * as geminiService from '../../services/geminiService';
// FIX: Added SparklesIcon to imports
import { ClipboardIcon, CheckIcon, SparklesIcon, CloseIcon, LoadingSpinnerIcon, ChevronDownIcon } from '../common/Icons';

interface CodeBlockProps {
    code: string;
}

const LANGUAGES = ['JavaScript', 'Python', 'TypeScript', 'HTML', 'CSS', 'SQL', 'Go', 'Java', 'C#', 'Rust', 'Ruby'];

const CodeBlock: React.FC<CodeBlockProps> = ({ code: initialCode }) => {
    const [copied, setCopied] = useState(false);
    const [explainer, setExplainer] = useState({
        visible: false,
        content: '',
        isLoading: false,
        top: 0,
        left: 0,
    });
    
    const [currentCode, setCurrentCode] = useState(initialCode);
    const [currentLanguage, setCurrentLanguage] = useState('JavaScript'); // Default language
    const [isTranslating, setIsTranslating] = useState(false);
    
    const preRef = useRef<HTMLPreElement>(null);
    const explainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // Reset code when the initial prop changes
        setCurrentCode(initialCode);
    }, [initialCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLanguageChange = async (newLanguage: string) => {
        if (newLanguage === currentLanguage) return;
        
        setIsTranslating(true);
        try {
            const translatedCode = await geminiService.translateCodeSnippet(currentCode, newLanguage);
            setCurrentCode(translatedCode);
            setCurrentLanguage(newLanguage);
        } catch (error) {
            console.error("Failed to translate code", error);
            // Optionally, show an error to the user
        } finally {
            setIsTranslating(false);
        }
    };
    
    const closeExplainer = () => {
        setExplainer(prev => ({ ...prev, visible: false }));
    };

    const handleMouseUp = async (event: React.MouseEvent) => {
        if (explainerRef.current?.contains(event.target as Node)) {
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 0));
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selection && selectedText && preRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const preRect = preRef.current.getBoundingClientRect();
            const top = rect.bottom - preRect.top;
            const left = rect.left - preRect.left + rect.width / 2;

            setExplainer({ visible: true, isLoading: true, content: '', top: top + 10, left });

            try {
                const explanation = await geminiService.explainCodeSnippet(selectedText, currentCode, 'explain');
                setExplainer(prev => ({ ...prev, isLoading: false, content: explanation }));
            } catch (error) {
                console.error("Failed to explain code snippet", error);
                setExplainer(prev => ({ ...prev, isLoading: false, content: "Sorry, I had trouble explaining that. Please try again." }));
            }

        } else if (explainer.visible) {
            closeExplainer();
        }
    };

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (explainerRef.current && !explainerRef.current.contains(event.target as Node) && preRef.current && !preRef.current.contains(event.target as Node)) {
                closeExplainer();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-gray-900 rounded-lg relative group">
            <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                 <div className="relative">
                    <select
                        value={currentLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={isTranslating}
                        className="bg-gray-700/50 text-gray-300 text-xs font-mono rounded-md py-1 pl-2 pr-6 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 focus:opacity-100" />
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-gray-700/50 rounded-md text-gray-400 hover:text-white hover:bg-gray-600/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    aria-label="Copy code"
                >
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardIcon className="h-5 w-5" />}
                </button>
            </div>
             <pre ref={preRef} onMouseUp={handleMouseUp} className="p-4 pt-10 text-sm text-gray-300 overflow-x-auto select-text">
                {isTranslating ? (
                    <div className="flex items-center justify-center h-24">
                        <LoadingSpinnerIcon className="w-6 h-6 text-green-400" />
                    </div>
                ) : (
                    <code>{currentCode}</code>
                )}
            </pre>
            {explainer.visible && (
                <div
                    ref={explainerRef}
                    style={{ top: `${explainer.top}px`, left: `${explainer.left}px`, transform: 'translateX(-50%)'}}
                    className="absolute z-30 w-80 max-w-sm p-4 bg-white rounded-xl shadow-2xl border border-gray-200 animate-fade-in-up-fast"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-[var(--color-primary)] flex items-center gap-2 text-base">
                            <SparklesIcon className="w-5 h-5"/>
                            Code Explainer
                        </h4>
                        <button onClick={closeExplainer} className="p-1 -mr-2 -mt-2 text-gray-400 hover:text-gray-800 rounded-full">
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    </div>
                     {explainer.isLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <LoadingSpinnerIcon className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 leading-relaxed max-h-60 overflow-y-auto">{explainer.content}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeBlock;