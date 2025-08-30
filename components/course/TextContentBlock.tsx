import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added SparklesIcon to imports
import { SparklesIcon } from '../common/Icons';

const TextContentBlock: React.FC<{ text: string }> = ({ text }) => {
    const { handleDefineTerm } = useAppContext();
    const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Simple markdown-to-jsx parser to handle bold/italic
    const parseText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index}>{part.slice(1, -1)}</em>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleMouseUp = () => {
        // Use a small timeout to let the browser finalize the selection
        setTimeout(() => {
            const currentSelection = window.getSelection();
            const selectedText = currentSelection?.toString().trim();

            if (selectedText && selectedText.length > 2 && currentSelection) {
                const range = currentSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelection({ text: selectedText, rect });
            } else {
                setSelection(null);
            }
        }, 10);
    };

    const handleDefineClick = () => {
        if (selection) {
            const { text, rect } = selection;
            const position = {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX + rect.width / 2,
            };
            handleDefineTerm(text, position, rect.width);
            setSelection(null);
        }
    };
    
    useEffect(() => {
        const handleScroll = () => setSelection(null);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    return (
        <div className="relative" ref={contentRef} onMouseUp={handleMouseUp} onMouseDown={() => setSelection(null)}>
            <p className="text-gray-700 leading-relaxed select-text">
                {parseText(text)}
            </p>
            {selection && (
                <button
                    onClick={handleDefineClick}
                    className="absolute z-10 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-full shadow-lg animate-fade-in-up-fast"
                    style={{
                        top: `${selection.rect.top + window.scrollY - 40}px`,
                        left: `${selection.rect.left + window.scrollX + selection.rect.width / 2}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <SparklesIcon className="w-4 h-4 text-cyan-300" />
                    Define
                </button>
            )}
        </div>
    );
};

export default TextContentBlock;