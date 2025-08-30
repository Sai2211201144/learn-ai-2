

import React from 'react';
import { Course, Subtopic, Topic, ContentBlock } from '../../types';
import { useAppContext } from '../../context/AppContext';
import CodeBlock from './CodeBlock';
import DiagramBlock from './DiagramBlock';
import InteractiveModelBlock from './InteractiveModelBlock';
import HyperparameterSimulatorBlock from './HyperparameterSimulatorBlock';
import TriageChallengeBlock from './TriageChallengeBlock';
import QuizBlock from './QuizBlock';
import TextContentBlock from './TextContentBlock';
import { 
    CheckIcon,
    FlashcardsIcon, 
    ChatBubbleOvalLeftEllipsisIcon, 
    LightBulbIcon,
    BeakerIcon, 
    // FIX: Added WrenchScrewdriverIcon to imports
    WrenchScrewdriverIcon,
    QuizIcon,
    // FIX: Added SparklesIcon to imports
    SparklesIcon
} from '../common/Icons';

interface SubtopicContentProps {
    course: Course;
    topic: Topic;
    subtopic: Subtopic;
    isComplete: boolean;
}

const ToolkitCard: React.FC<{ onClick: () => void, icon: React.ReactNode, children: React.ReactNode, description: string }> = ({ onClick, icon, children, description }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center text-center p-3 bg-[var(--color-secondary)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200 group transform hover:-translate-y-1"
    >
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-background)] text-[var(--color-primary)] mb-2 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="text-xs font-semibold text-[var(--color-foreground)]">{children}</span>
        <span className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{description}</span>
    </button>
);


const SubtopicContent: React.FC<SubtopicContentProps> = ({ course, topic, subtopic, isComplete }) => {
    const { 
        handleToggleItemComplete,
        handleShowTopicStory,
        handleShowTopicAnalogy,
        handleShowTopicFlashcards,
        handleStartTopicPractice,
        handleGenerateProject,
        handleUpdateContentBlock,
        handleShowSocraticQuiz,
        handleCheckUnderstanding,
    } = useAppContext();

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleToggleItemComplete(course.id, subtopic.id);
    };

    const renderContentBlock = (block: ContentBlock) => {
        const blockWrapperClass = "p-4 bg-[var(--color-secondary)] rounded-lg border border-[var(--color-border)]";

        switch (block.type) {
            case 'text':
                return block.text ? <div key={block.id} className="text-block"><TextContentBlock text={block.text} /></div> : null;
            case 'code':
                return block.code ? <div key={block.id}><CodeBlock code={block.code} /></div> : null;
            case 'quiz':
                return block.quiz ? <div key={block.id} className={blockWrapperClass}><QuizBlock quizData={block.quiz} /></div> : null;
            case 'diagram':
                return block.diagram ? <div key={block.id} className={blockWrapperClass}><DiagramBlock mermaidString={block.diagram} blockId={block.id} onUpdateDiagram={(newSyntax) => handleUpdateContentBlock(course.id, subtopic.id, block.id, newSyntax)} /></div> : null;
            case 'interactiveModel':
                return block.interactiveModel ? <div key={block.id} className={blockWrapperClass}><InteractiveModelBlock modelData={block.interactiveModel} /></div> : null;
            case 'hyperparameterSimulator':
                return block.hyperparameterSimulator ? <div key={block.id} className={blockWrapperClass}><HyperparameterSimulatorBlock modelData={block.hyperparameterSimulator} /></div> : null;
            case 'triageChallenge':
                 return block.triageChallenge ? <div key={block.id} className={blockWrapperClass}><TriageChallengeBlock challengeData={block.triageChallenge} /></div> : null;
            default:
                return null;
        }
    };

    return (
        <div className={`p-1 sm:p-4 rounded-lg transition-colors duration-200`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    {/* Checkbox removed, now part of the main button */}
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className={`font-bold text-2xl sm:text-3xl text-[var(--color-foreground)]`}>
                        {subtopic.title}
                    </h4>
                    {subtopic.type === 'article' && (
                        <>
                            <p className="text-base text-[var(--color-muted-foreground)] mt-2 mb-6">{subtopic.data.objective}</p>
                            
                            <div className="space-y-6 mb-8">
                                {subtopic.data.contentBlocks.map(renderContentBlock)}
                            </div>

                            <div className="p-4 bg-[var(--color-secondary)] rounded-lg border border-[var(--color-border)] mb-8">
                                <h5 className="font-bold text-base text-[var(--color-foreground)] mb-3 text-center">Learning Toolkit</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <ToolkitCard onClick={() => handleShowTopicStory(subtopic)} icon={<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/>} description="AI story">Story</ToolkitCard>
                                    <ToolkitCard onClick={() => handleShowTopicFlashcards(subtopic)} icon={<FlashcardsIcon className="w-5 h-5"/>} description="Key concepts">Flashcards</ToolkitCard>
                                    <ToolkitCard onClick={() => handleShowTopicAnalogy(subtopic)} icon={<LightBulbIcon className="w-5 h-5"/>} description="Simplify topic">Analogy</ToolkitCard>
                                    <ToolkitCard onClick={() => handleShowSocraticQuiz(subtopic)} icon={<QuizIcon className="w-5 h-5" />} description="Test your recall">Quick Quiz</ToolkitCard>
                                    <ToolkitCard onClick={() => handleStartTopicPractice(course, topic, subtopic, () => {})} icon={<BeakerIcon className="w-5 h-5"/>} description="Concepts & quiz">Practice</ToolkitCard>
                                    <ToolkitCard onClick={() => handleGenerateProject(course, subtopic)} icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} description="Guided exercise">Project</ToolkitCard>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCheckUnderstanding(subtopic)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg animate-pulse-glow"
                            >
                                <CheckIcon className="w-5 h-5" />
                                Check Understanding & Continue
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubtopicContent;