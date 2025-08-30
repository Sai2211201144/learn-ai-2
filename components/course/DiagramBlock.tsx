

import React, { useEffect, useRef, useState, useCallback } from 'react';
// FIX: Added SparklesIcon to imports
import { ArrowUturnLeftIcon, SparklesIcon, LoadingSpinnerIcon } from '../common/Icons';
import * as geminiService from '../../services/geminiService';

declare global {
    interface Window {
        mermaid: any;
    }
}

interface DiagramBlockProps {
    mermaidString: string;
    blockId?: string;
    onUpdateDiagram?: (newSyntax: string) => void;
}

const DiagramBlock: React.FC<DiagramBlockProps> = ({ mermaidString, blockId, onUpdateDiagram }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [renderError, setRenderError] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [fixError, setFixError] = useState<string | null>(null);

    const renderDiagram = useCallback(() => {
        if (ref.current && window.mermaid) {
            setRenderError(false);
            setFixError(null);
            ref.current.innerHTML = mermaidString;
            
            const existingSvg = ref.current.querySelector('svg');
            if (existingSvg) {
                existingSvg.remove();
            }

            try {
                 window.mermaid.run({
                    nodes: [ref.current]
                 });
            } catch(e) {
                console.error("Mermaid run error: ", e);
                setRenderError(true);
            }
        }
    }, [mermaidString]);
    
    useEffect(() => {
        renderDiagram();
    }, [renderDiagram]);

    const handleFixDiagram = async () => {
        if (!onUpdateDiagram) return;
        setIsFixing(true);
        setFixError(null);
        try {
            const fixedSyntax = await geminiService.fixMermaidSyntax(mermaidString);
            onUpdateDiagram(fixedSyntax);
            // The component will re-render with the new mermaidString prop,
            // and useEffect will call renderDiagram() again.
        } catch (error) {
            console.error("Failed to fix diagram", error);
            setFixError("The AI couldn't fix the diagram. You might need to edit it manually.");
        } finally {
            setIsFixing(false);
        }
    };


    return (
        <div className="mermaid flex flex-col items-center justify-center p-4 bg-white w-full">
            <div ref={ref} className={renderError ? 'hidden' : ''}>
                {/* The mermaid string is injected via useEffect to avoid React/Mermaid DOM conflicts */}
            </div>
             {renderError && (
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 w-full">
                    <p className="font-semibold mb-2">Error Rendering Diagram</p>
                    <p className="text-sm mb-4">There might be an issue with the diagram syntax.</p>
                    <div className="flex justify-center items-center gap-3">
                        <button
                            onClick={renderDiagram}
                            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 text-sm transition-colors"
                        >
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                            Retry Render
                        </button>
                        {onUpdateDiagram && blockId && (
                         <button
                            onClick={handleFixDiagram}
                            disabled={isFixing}
                            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 text-sm transition-colors disabled:bg-gray-400"
                        >
                            {isFixing ? <LoadingSpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                            {isFixing ? 'Fixing...' : 'Ask AI to Fix'}
                        </button>
                        )}
                    </div>
                    {fixError && <p className="text-xs text-red-500 mt-3">{fixError}</p>}
                </div>
            )}
        </div>
    );
};

export default DiagramBlock;