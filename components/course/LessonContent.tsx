



import React, { useState, useRef, useEffect } from 'react';
import { Course, Module, LearningItem, ContentBlock, Subtopic, Topic } from '../../types';
import { useAppContext } from '../../context/AppContext';
import * as geminiService from '../../services/geminiService';
import CodeBlock from './CodeBlock';
import QuizBlock from './QuizBlock';
import DiagramBlock from './DiagramBlock';
import InteractiveModelBlock from './InteractiveModelBlock';
import HyperparameterSimulatorBlock from './HyperparameterSimulatorBlock';
import TriageChallengeBlock from './TriageChallengeBlock';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { 
    CheckCircleIcon, 
    // FIX: Added VideoIcon to imports
    VideoIcon, 
    DocumentIcon, 
    ArticleIcon, 
    LeetCodeIcon, 
    GfgIcon, 
    DiagramIcon, 
    InteractiveModelIcon, 
    HyperparameterIcon, 
    BugAntIcon, 
    // FIX: Added TextIcon to imports
    TextIcon, 
    CodeIcon, 
    QuizIcon, 
    FlashcardsIcon, 
    ChatBubbleOvalLeftEllipsisIcon, 
    CheckIcon, 
    LightBulbIcon,
    BeakerIcon, 
    // FIX: Added WrenchScrewdriverIcon to imports
    WrenchScrewdriverIcon
} from '../common/Icons';

// --- Sub-Components for Learning Item Types ---

const LectureView: React.FC<{ item: LearningItem & { type: 'article' }, course: Course, module: Module, onNavigateToPractice: () => void }> = ({ item, course, module, onNavigateToPractice }) => {
    const { 
        handleShowTopicFlashcards, 
        handleShowTopicStory, 
        handleSaveItemNote, 
        handleUpdateContentBlock, 
        handleShowTopicAnalogy,
        handleStartTopicPractice,
        handleGenerateProject
    } = useAppContext();
    
    const [note, setNote] = useState(item.notes || '');
    const [isNoteSaved, setIsNoteSaved] = useState(false);
    const noteTimeoutRef = useRef<number | null>(null);

    useEffect(() => { setNote(item.notes || ''); }, [item.notes]);

    const handleSaveNoteClick = () => {
        handleSaveItemNote(course.id, item.id, note);
        setIsNoteSaved(true);
        if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
        noteTimeoutRef.current = window.setTimeout(() => setIsNoteSaved(false), 2000);
    };

    const ToolkitCard: React.FC<{ onClick: () => void, icon: React.ReactNode, children: React.ReactNode, description: string }> = ({ onClick, icon, children, description }) => (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center text-center p-4 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200 group transform hover:-translate-y-1"
        >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)] mb-3 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">{children}</span>
            <span className="text-xs text-[var(--color-muted-foreground)] mt-1">{description}</span>
        </button>
    );

    const renderContentBlock = (block: ContentBlock) => {
        return (
             <div key={block.id} className="p-4 bg-[var(--color-secondary)]/50 rounded-lg border border-[var(--color-border)]">
                <div className="min-w-0">
                    {block.type === 'text' && block.text && <MarkdownRenderer content={block.text} />}
                    {block.type === 'code' && block.code && <CodeBlock code={block.code} />}
                    {block.type === 'quiz' && block.quiz && <QuizBlock quizData={block.quiz} />}
                    {block.type === 'diagram' && block.diagram && <DiagramBlock mermaidString={block.diagram} blockId={block.id} onUpdateDiagram={(newSyntax) => handleUpdateContentBlock(course.id, item.id, block.id, newSyntax)} />}
                </div>
            </div>
        )
    };
    
    return (
        <div className="space-y-6">
            <p className="mt-1 text-md text-[var(--color-muted-foreground)] italic">{item.data.objective}</p>
            {item.data.contentBlocks.map(renderContentBlock)}
            
            <div className="p-4 bg-[var(--color-secondary)] rounded-lg border border-[var(--color-border)]">
                <h4 className="font-serif font-bold text-lg text-[var(--color-foreground)] mb-4">Learning Toolkit</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <ToolkitCard onClick={() => handleShowTopicStory(item)} icon={<ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6"/>} description="An AI-generated story">Tell a Story</ToolkitCard>
                    <ToolkitCard onClick={() => handleShowTopicFlashcards(item)} icon={<FlashcardsIcon className="w-6 h-6"/>} description="Test key concepts">Flashcards</ToolkitCard>
                    <ToolkitCard onClick={() => handleShowTopicAnalogy(item)} icon={<LightBulbIcon className="w-6 h-6"/>} description="Simplify the topic">Get Analogy</ToolkitCard>
                    <ToolkitCard onClick={() => handleStartTopicPractice(course, module, item, onNavigateToPractice)} icon={<BeakerIcon className="w-6 h-6"/>} description="Concepts & quiz">Practice</ToolkitCard>
                    <ToolkitCard onClick={() => handleGenerateProject(course, item)} icon={<WrenchScrewdriverIcon className="w-6 h-6"/>} description="Hands-on exercise">Guided Project</ToolkitCard>
                </div>
            </div>

            {/* Note taking, resources, etc. */}
        </div>
    );
};

const QuizView: React.FC<{ item: LearningItem & { type: 'quiz' } }> = ({ item }) => {
    // Basic quiz runner logic
    const [answers, setAnswers] = useState<Map<number, number>>(new Map());
    const [showResults, setShowResults] = useState(false);
    
    const handleSelect = (qIndex: number, aIndex: number) => {
        if (showResults) return;
        setAnswers(prev => new Map(prev).set(qIndex, aIndex));
    };

    const score = Array.from(answers.entries()).reduce((acc, [qIndex, aIndex]) => {
        return item.data.questions[qIndex].answer === aIndex ? acc + 1 : acc;
    }, 0);

    return (
        <div className="space-y-6">
            <p className="text-[var(--color-muted-foreground)]">{item.data.description}</p>
            {item.data.questions.map((quizData, qIndex) => (
                <div key={qIndex} className="p-4 bg-[var(--color-secondary)]/50 rounded-lg border border-[var(--color-border)]">
                    <QuizBlock quizData={quizData} />
                </div>
            ))}
        </div>
    );
};

const ProjectView: React.FC<{ item: LearningItem & { type: 'project' } }> = ({ item }) => {
    return (
        <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed mb-6">{item.data.description}</p>
            <h3 className="font-semibold text-lg text-slate-700 mb-2">Code Stub</h3>
            <CodeBlock code={item.data.codeStub} />
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <h3 className="font-semibold text-lg text-yellow-800 mb-2">Your Challenge</h3>
                <p className="text-yellow-900">{item.data.challenge}</p>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface LearningItemContentProps {
    course: Course;
    module: Module;
    item: LearningItem;
    isCompleted: boolean;
    onCompleteAndContinue: () => void;
    onNavigateToPractice: () => void;
}

const LearningItemContent: React.FC<LearningItemContentProps> = (props) => {
    const { item, isCompleted, onCompleteAndContinue } = props;

    const renderContent = () => {
        switch (item.type) {
            case 'article':
                return <LectureView {...props} item={item} />;
            case 'quiz':
                return <QuizView {...props} item={item} />;
            case 'project':
                return <ProjectView {...props} item={item} />;
            default:
                return <div>Unsupported item type.</div>;
        }
    };
    
    return (
        <div className="p-6 sm:p-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-foreground)]">{item.title}</h2>
            </header>
            
            {renderContent()}

            <div className="mt-10 pt-8 border-t-2 border-dashed border-[var(--color-border)]">
                <button
                    onClick={onCompleteAndContinue}
                    className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-6 py-4 bg-[var(--gradient-primary-accent)] text-white text-lg font-bold rounded-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[var(--color-primary)]/40"
                >
                    <CheckCircleIcon className="w-6 h-6"/>
                    {isCompleted ? 'Continue to Next Item' : 'Mark Complete & Continue'}
                </button>
            </div>
        </div>
    );
};

export default LearningItemContent;