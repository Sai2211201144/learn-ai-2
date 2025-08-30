import React, { useState, useEffect, useCallback } from 'react';
import { KnowledgeLevel, LearningGoal, LearningStyle, CourseSource } from '../../types';
import { useAppContext } from '../../context/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import { 
    CloseIcon, 
    LogoIcon, 
    // FIX: Added WrenchScrewdriverIcon to imports
    WrenchScrewdriverIcon, 
    AcademicCapIcon, 
    BookOpenIcon, 
    // FIX: Added SparklesIconV2 to imports
    SparklesIconV2,
    DiagramIcon,
    CodeIcon,
    ClipboardDocumentCheckIcon,
    InteractiveModelIcon,
    ChevronDownIcon,
    LinkIcon,
    DocumentTextIcon,
    FolderPlusIcon,
    // FIX: Added XCircleIcon to imports
    XCircleIcon,
    LoadingSpinnerIcon
} from '../common/Icons';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (
        topic: string, 
        level: KnowledgeLevel, 
        folderId: string | null, 
        goal: LearningGoal, 
        style: LearningStyle,
        source: CourseSource | undefined,
        specificTech: string,
        includeTheory: boolean
    ) => void;
    error: string | null;
}

const OptionCard: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className={`text-center p-3 rounded-lg border-2 transition-all w-full ${isActive ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' : 'bg-[var(--color-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}`}
    >
        <div className={`w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-lg transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`}>
            {icon}
        </div>
        <p className={`font-semibold text-sm transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'}`}>{label}</p>
    </button>
);

const SourceTabButton: React.FC<{icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-t-lg transition-colors ${isActive ? 'bg-[var(--color-secondary)] border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)]'}`}>
        {icon}
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onGenerate, error: propError }) => {
    const { folders } = useAppContext();
    
    // Form state
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState<KnowledgeLevel>('beginner');
    const [goal, setGoal] = useState<LearningGoal>('theory');
    const [style, setStyle] = useState<LearningStyle>('balanced');
    const [folderId, setFolderId] = useState<string | null>(null);
    const [source, setSource] = useState<CourseSource>({ type: 'syllabus', content: '' });
    const [activeSourceTab, setActiveSourceTab] = useState<'syllabus' | 'url' | 'pdf'>('syllabus');
    const [pdfProcessing, setPdfProcessing] = useState({ loading: false, error: '', filename: '' });
    const [specificTech, setSpecificTech] = useState('');
    const [includeTheory, setIncludeTheory] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                // Reset all state
                setTopic('');
                setLevel('beginner');
                setGoal('theory');
                setStyle('balanced');
                setFolderId(null);
                setSource({ type: 'syllabus', content: '' });
                setActiveSourceTab('syllabus');
                setPdfProcessing({ loading: false, error: '', filename: '' });
                setSpecificTech('');
                setIncludeTheory(false);
                setLocalError(null);
                setShowAdvanced(false);
            }, 300);
        }
    }, [isOpen]);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setPdfProcessing({ loading: false, error: 'Please upload a PDF file.', filename: '' });
            return;
        }

        setPdfProcessing({ loading: true, error: '', filename: file.name });
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map((item: any) => item.str).join(' ');
            }
            setSource({ type: 'pdf', content: fullText, filename: file.name });
            setPdfProcessing({ loading: false, error: '', filename: file.name });
        } catch (error) {
            console.error('Error processing PDF:', error);
            setPdfProcessing({ loading: false, error: 'Could not read text from PDF.', filename: '' });
        }
    }, []);

    const handleGenerateClick = () => {
        if (!topic.trim()) {
            setLocalError("Please enter a topic to begin.");
            return;
        }
        const sourceToSend = source.content ? source : undefined;
        onGenerate(topic, level, folderId, goal, style, sourceToSend, specificTech, includeTheory);
    };
    
    const displayError = propError || localError;

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-[var(--color-border)] animate-modal-content flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-7 h-7 text-[var(--color-primary)]" />
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Create New Topic</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-4 space-y-6">
                    <div>
                        <label htmlFor="topic-input" className="text-lg font-semibold text-[var(--color-foreground)] mb-2 block">What do you want to learn today?</label>
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={(e) => { setTopic(e.target.value); if(localError) setLocalError(null); }}
                            placeholder="e.g., 'Quantum Computing'"
                            className="w-full px-4 py-3 bg-[var(--color-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg"
                            autoFocus
                        />
                    </div>
                    
                    <div className="p-4 bg-[var(--color-secondary)]/50 rounded-lg space-y-4">
                        <h4 className="font-semibold text-sm text-[var(--color-muted-foreground)] mb-2">Knowledge Level</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => setLevel('beginner')} className={`py-2 rounded-md text-sm font-semibold border ${level === 'beginner' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}>Beginner</button>
                            <button onClick={() => setLevel('intermediate')} className={`py-2 rounded-md text-sm font-semibold border ${level === 'intermediate' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}>Intermediate</button>
                            <button onClick={() => setLevel('advanced')} className={`py-2 rounded-md text-sm font-semibold border ${level === 'advanced' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-secondary-hover)] border-[var(--color-border)]'}`}>Advanced</button>
                        </div>
                    </div>
                    
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex justify-between items-center text-left text-lg font-semibold text-[var(--color-foreground)]">
                        Customize
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid overflow-hidden transition-all duration-300 ${showAdvanced ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'}`}>
                         <div className="min-h-0 p-4 bg-[var(--color-secondary)]/50 rounded-lg space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm text-[var(--color-muted-foreground)] mb-2">Primary Goal</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <OptionCard icon={<WrenchScrewdriverIcon className="w-6 h-6"/>} label="Project" isActive={goal==='project'} onClick={() => setGoal('project')} />
                                    <OptionCard icon={<AcademicCapIcon className="w-6 h-6"/>} label="Interview" isActive={goal==='interview'} onClick={() => setGoal('interview')} />
                                    <OptionCard icon={<BookOpenIcon className="w-6 h-6"/>} label="Theory" isActive={goal==='theory'} onClick={() => setGoal('theory')} />
                                    <OptionCard icon={<SparklesIconV2 className="w-6 h-6"/>} label="Curiosity" isActive={goal==='curiosity'} onClick={() => setGoal('curiosity')} />
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-[var(--color-muted-foreground)] mb-2">Learning Style</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                     <OptionCard icon={<DiagramIcon className="w-6 h-6"/>} label="Visual" isActive={style==='visual'} onClick={() => setStyle('visual')} />
                                     <OptionCard icon={<CodeIcon className="w-6 h-6"/>} label="Code-Focused" isActive={style==='code'} onClick={() => setStyle('code')} />
                                     <OptionCard icon={<ClipboardDocumentCheckIcon className="w-6 h-6"/>} label="Balanced" isActive={style==='balanced'} onClick={() => setStyle('balanced')} />
                                     <OptionCard icon={<InteractiveModelIcon className="w-6 h-6"/>} label="Interactive" isActive={style==='interactive'} onClick={() => setStyle('interactive')} />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-[var(--color-muted-foreground)] mb-2">Source (Optional)</h4>
                                <div className="border-b border-[var(--color-border)] flex">
                                    <SourceTabButton icon={<DocumentTextIcon className="w-5 h-5"/>} label="Syllabus" isActive={activeSourceTab==='syllabus'} onClick={() => setActiveSourceTab('syllabus')}/>
                                    <SourceTabButton icon={<LinkIcon className="w-5 h-5"/>} label="Web Link" isActive={activeSourceTab==='url'} onClick={() => setActiveSourceTab('url')}/>
                                    <SourceTabButton icon={<FolderPlusIcon className="w-5 h-5"/>} label="File" isActive={activeSourceTab==='pdf'} onClick={() => setActiveSourceTab('pdf')}/>
                                </div>
                                <div className="p-3 bg-[var(--color-secondary)] rounded-b-lg">
                                    {activeSourceTab === 'syllabus' && <textarea value={source.type === 'syllabus' ? source.content : ''} onChange={(e) => setSource({type: 'syllabus', content: e.target.value})} placeholder="Paste a syllabus or outline..." className="w-full h-24 p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-sm"/>}
                                    {activeSourceTab === 'url' && <input type="url" value={source.type === 'url' ? source.content : ''} onChange={(e) => setSource({type: 'url', content: e.target.value})} placeholder="https://example.com/article" className="w-full p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-sm"/>}
                                    {activeSourceTab === 'pdf' && (
                                        <div>
                                            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                                            <label htmlFor="pdf-upload" className="w-full cursor-pointer p-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center text-sm text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] block">
                                                {pdfProcessing.loading ? <LoadingSpinnerIcon className="w-5 h-5 mx-auto"/> : pdfProcessing.filename ? `✔️ ${pdfProcessing.filename}` : 'Click to upload a PDF'}
                                            </label>
                                            {pdfProcessing.error && <p className="text-red-500 text-xs mt-1">{pdfProcessing.error}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {displayError && <p className="mt-4 text-center text-red-500 animate-shake text-sm">{displayError}</p>}
                
                <footer className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-end items-center flex-shrink-0">
                     <button 
                        onClick={handleGenerateClick} 
                        disabled={!topic.trim()}
                        className="px-6 py-3 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-lg hover:opacity-90 shadow-lg disabled:opacity-50"
                     >
                        ✨ Generate Topic
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CreateModal;