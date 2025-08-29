import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeLevel, Course, View, Article, DefinitionState } from './types';
import { useAppContext } from './context/AppContext';
import { useTheme } from './context/ThemeContext';

import Sidebar from './components/common/Sidebar';
import LoadingDisplay from './components/common/LoadingDisplay';
import CourseView from './components/course/CourseView';
import PlannerPage from './components/planner/PlannerPage';
import AssessmentPage from './components/assessment/AssessmentPage';
import CreateModal from './components/modals/CreateCourseModal';
import AIChatModal from './components/chat/AIChatModal';
import PracticePage from './components/practice/PracticePage';
import BackgroundGlow from './components/common/BackgroundGlow';
import SettingsModal from './components/modals/SettingsModal';
import BackgroundTasksDisplay from './components/dashboard/BackgroundTasksDisplay';
import { Bars3Icon, LoadingSpinnerIcon, ArrowUturnLeftIcon, AcademicCapIcon, SparklesIcon, CloseIcon } from './components/common/Icons';
import AIChatButton from './components/chat/AIChatButton';
import InterviewPage from './components/interview/InterviewPage';
import ProjectsPage from './components/project/ProjectsPage';
import ProjectDetail from './components/project/ProjectDetail';
import InterviewSessionPage from './components/interview/InterviewSessionPage';
import QuizSessionPage from './components/session/QuizSessionPage';
import CodeExplainerPage from './components/explainer/CodeExplainerPage';
import CreateTopicsForFolderModal from './components/modals/CreateTopicsForFolderModal';
import ProfilePage from './components/profile/ProfilePage';
import AchievementToast from './components/common/AchievementToast';
import ArticleCreatorPage from './components/creator/ArticleCreatorPage';
import InterviewPrepModal from './components/modals/InterviewPrepModal';
import StoryModal from './components/modals/StoryModal';
import AnalogyModal from './components/modals/AnalogyModal';
import FlashcardModal from './components/modals/FlashcardModal';
import ExpandTopicModal from './components/modals/ExpandTopicModal';
import ExploreModal from './components/modals/ExploreModal';
import MindMapModal from './components/modals/MindMapModal';
import MarkdownRenderer from './components/common/MarkdownRenderer';
import ArticleIdeasModal from './components/modals/ArticleIdeasModal';
import CreateArticlesForFolderModal from './components/modals/CreateArticlesForFolderModal';
import ArticleTutorModal from './components/modals/ArticleTutorModal';
import BulkArticleCreatorPage from './components/creator/BulkArticleCreatorPage';
import SocraticModal from './components/modals/SocraticModal';
import UnderstandingCheckModal from './components/modals/UnderstandingCheckModal';
import ProjectTutorModal from './components/project/ProjectTutorModal';
import AnimatedBackground from './components/common/AnimatedBackground';
import HabitsPage from './components/habits/HabitsPage';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';

const ArticleView: React.FC<{ article: Article, onBack: () => void }> = ({ article, onBack }) => {
    const { handleOpenArticleTutor } = useAppContext();
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4 text-sm font-semibold">
                <ArrowUturnLeftIcon className="w-4 h-4"/>
                Back to Learning Space
            </button>
            <article className="bg-[var(--color-card)] p-6 sm:p-8 md:p-12 rounded-2xl border border-[var(--color-border)] shadow-lg">
                <header className="text-center mb-10 border-b border-dashed border-[var(--color-border)] pb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--color-foreground)] leading-tight">
                        {article.title}
                    </h1>
                    {article.subtitle && (
                        <p className="mt-4 text-lg sm:text-xl text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
                            {article.subtitle}
                        </p>
                    )}
                </header>
                <div className="max-w-3xl mx-auto">
                    <MarkdownRenderer content={article.blogPost} />
                </div>
            </article>

            <button
                onClick={() => handleOpenArticleTutor(article)}
                className="fixed bottom-6 right-6 z-20 flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-2 ring-offset-[var(--color-background)] ring-[var(--color-primary)]"
                aria-label="Ask AI Tutor about this article"
            >
                <AcademicCapIcon className="w-6 h-6" />
                <span className="font-semibold hidden sm:inline">AI Tutor</span>
            </button>
        </div>
    );
};

const DefinitionPopover: React.FC<{
    state: DefinitionState;
    isLoading: boolean;
    onClose: () => void;
}> = ({ state, isLoading, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    
    const { position, term, definition } = state;
    
    const style: React.CSSProperties = {
        position: 'fixed',
        top: `${position.top}px`,
        width: `${Math.max(250, state.targetWidth)}px`,
        transform: 'translateX(-50%)',
    };

    if (position.right) {
        style.right = `${position.right}px`;
    } else {
        style.left = `${position.left}px`;
    }

    return (
        <div
            ref={popoverRef}
            style={style}
            className="z-[100] p-4 bg-[var(--color-card)] rounded-xl shadow-2xl border border-[var(--color-border)] animate-fade-in-up-fast"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-[var(--color-primary)] flex items-center gap-2 text-base">
                    <SparklesIcon className="w-5 h-5"/>
                    Define: <span className="text-[var(--color-muted-foreground)] italic">"{term}"</span>
                </h4>
                <button onClick={onClose} className="p-1 -mr-2 -mt-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] rounded-full">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-24">
                    <LoadingSpinnerIcon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
            ) : (
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed max-h-60 overflow-y-auto">{definition}</p>
            )}
        </div>
    );
}


function App() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [view, setView] = useState<View>('planner');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const { isDark } = useTheme();
  const {
      isDataLoading,
      activeCourse,
      error,
      activeTask,
      activeProject,
      liveInterviewState,
      handleGenerateCourse,
      handleSelectCourse,
      handleStartLiveInterview,
      cancelTask,
      minimizeTask,
      handleSelectProject,
      storyModalState,
      closeStoryModal,
      analogyModalState,
      closeAnalogyModal,
      flashcardModalState,
      closeFlashcardModal,
      handleStartInterviewPrep,
      exploreModalState,
      closeExploreModal,
      mindMapModalState,
      closeMindMapModal,
      activeArticle,
      handleSelectArticle,
      socraticModalState,
      closeSocraticModal,
      definitionState,
      isDefinitionLoading,
      closeDefinition,
      understandingCheckState,
      closeUnderstandingCheckModal,
      handleUnderstandingCheckSubmit,
      projectTutorState,
      closeProjectTutorModal,
  } = useAppContext();
  
  // Automatically navigate to a course once it's done generating
  useEffect(() => {
    if (activeTask && activeTask.status === 'done' && activeTask.type === 'course_generation' && activeTask.courseId) {
        handleSelectCourse(activeTask.courseId);
        const taskId = activeTask.id;
        // A short timeout to ensure the UI has time to react to the state change before the task disappears.
        setTimeout(() => {
            cancelTask(taskId);
        }, 100);
    }
  }, [activeTask, handleSelectCourse, cancelTask]);

  if (isAuthLoading) {
    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
            <LoadingSpinnerIcon className="w-12 h-12 text-[var(--color-primary)]" />
        </div>
    );
  }

  if (!isAuthenticated) {
      return <AuthPage />;
  }

  if (isDataLoading) {
      return (
          <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
              <LoadingSpinnerIcon className="w-12 h-12 text-[var(--color-primary)]" />
          </div>
      );
  }
  
  const renderContent = () => {
    if (liveInterviewState) {
        return <InterviewSessionPage />;
    }
    
    if (activeTask) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <LoadingDisplay 
                    task={activeTask} 
                    onCancel={() => {
                        cancelTask(activeTask.id);
                        setView('planner');
                    }}
                    onMinimize={() => {
                        minimizeTask(activeTask.id);
                        setView('planner');
                    }}
                />
            </div>
        )
    }

    if (activeCourse) {
        return <CourseView onBack={() => handleSelectCourse(null)} />
    }
    
    if (activeArticle) {
        return <ArticleView article={activeArticle} onBack={() => handleSelectArticle(null)} />
    }

    if (activeProject) {
        return <ProjectDetail project={activeProject} onBackToProjects={() => handleSelectProject(null)} />
    }

    switch (view) {
      case 'profile':
        return <ProfilePage />;
      case 'assessment':
        return <AssessmentPage 
            onBackToDashboard={() => setView('planner')} 
            onGenerateCourse={(level, topic) => {
              handleGenerateCourse(topic, level, null, 'theory', 'balanced', undefined, '', false);
            }}
        />;
      case 'interview':
        return <InterviewPage onStartLiveInterview={handleStartLiveInterview} onStartInterviewPrep={handleStartInterviewPrep} />;
      case 'projects':
        return <ProjectsPage onSelectProject={(projectId) => handleSelectProject(projectId)} onBackToDashboard={() => setView('planner')} />;
      case 'practice':
        return <PracticePage onBack={() => { setView('planner'); }} />;
      case 'practice_quiz':
        return <QuizSessionPage onBack={() => setView('planner')} />;
      case 'habits':
        return <HabitsPage />;
      case 'code_explainer':
        return <CodeExplainerPage />;
      case 'planner':
      default:
        return <PlannerPage 
            onNavigate={setView} 
            onStartCreate={() => setIsCreateModalOpen(true)} 
        />;
    }
  };

  return (
    <>
    {isDark && <AnimatedBackground />}
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex relative z-0">
      <Sidebar 
        view={view} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsModalOpen(true)} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="lg:hidden p-4 flex items-center justify-between sticky top-0 bg-[var(--color-background)]/80 backdrop-blur-sm z-30 border-b border-[var(--color-border)]">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <Bars3Icon className="w-6 h-6"/>
          </button>
          <BackgroundTasksDisplay />
        </header>
        <main className="w-full flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>

      {!activeArticle && <AIChatButton />}
      <AIChatModal />
      <ArticleTutorModal />
      <AchievementToast />
      <InterviewPrepModal />
      <ExpandTopicModal />
      <ExploreModal 
        isOpen={exploreModalState.isOpen}
        isLoading={exploreModalState.isLoading}
        onClose={closeExploreModal}
        courseTitle={exploreModalState.course?.title || ''}
        relatedTopics={exploreModalState.relatedTopics}
        onGenerateCourse={(topic, level) => {
            closeExploreModal();
            handleGenerateCourse(topic, level, null, 'theory', 'balanced', undefined, '', false);
        }}
      />
      <MindMapModal 
        isOpen={mindMapModalState.isOpen}
        course={mindMapModalState.course}
        onClose={closeMindMapModal}
      />
      <StoryModal {...storyModalState} onClose={closeStoryModal} />
      <AnalogyModal {...analogyModalState} onClose={closeAnalogyModal} />
      <FlashcardModal {...flashcardModalState} onClose={closeFlashcardModal} />
      <SocraticModal {...socraticModalState} onClose={closeSocraticModal} />
      <ArticleIdeasModal />
      {definitionState && <DefinitionPopover state={definitionState} isLoading={isDefinitionLoading} onClose={closeDefinition} />}
      <UnderstandingCheckModal 
        {...understandingCheckState}
        onClose={closeUnderstandingCheckModal}
        onSubmit={handleUnderstandingCheckSubmit}
      />
      <ProjectTutorModal {...projectTutorState} onClose={closeProjectTutorModal} />

      <CreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGenerate={(topic, level, folderId, goal, style, source, specificTech, includeTheory) => {
          setIsCreateModalOpen(false);
          handleGenerateCourse(topic, level, folderId, goal, style, source, specificTech, includeTheory);
        }}
        error={error}
      />
      
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

      <CreateTopicsForFolderModal />
      <CreateArticlesForFolderModal />
    </div>
    </>
  );
}

export default App;
