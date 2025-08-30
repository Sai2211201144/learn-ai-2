import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Course, Folder, Progress, KnowledgeLevel, ChatMessage, Subtopic, Topic, InterviewQuestionSet, PracticeSession, BackgroundTask, Project, LiveInterviewState, User, LearningGoal, LearningStyle, CreateTopicsModalState, Achievement, AchievementId, CourseSource, Article, QuizData, StoryModalState, AnalogyModalState, FlashcardModalState, ExpandTopicModalState, InterviewQuestion, InterviewPrepState, LearningItem, Module, ContentBlock, ArticleData, ExploreModalState, MindMapModalState, ArticleIdeasModalState, CreateArticlesModalState, ArticleTutorModalState, SocraticModalState, DailyQuest, DefinitionState, UnderstandingCheckState, ProjectStep, ProjectTutorState, UpNextItem, LearningPlan, DailyTask, Habit, TaskPriority, PlanOutline } from '../types';
import * as storageService from '../services/storageService';
import * as geminiService from '../services/geminiService';
import { achievementsMap } from '../services/achievements';
import { useAuth } from './AuthContext';

const XP_PER_LESSON = 100;
const calculateRequiredXp = (level: number) => level * 500;

interface AppContextType {
    // Data
    courses: Course[];
    folders: Folder[];
    projects: Project[];
    articles: Article[];
    localUser: User;
    activeCourse: Course | null;
    activeProject: Project | null;
    activeArticle: Article | null;
    topic: string; // for loading screen
    error: string | null;
    isDataLoading: boolean;
    
    // Actions
    handleGenerateCourse: (topic: string, level: KnowledgeLevel, folderId: string | null, goal: LearningGoal, style: LearningStyle, source: CourseSource | undefined, specificTech: string, includeTheory: boolean) => void;
    handleSelectCourse: (courseId: string | null) => void;
    handleSelectArticle: (articleId: string | null) => void;
    handleDeleteCourse: (courseId: string) => void;
    handleToggleItemComplete: (courseId: string, subtopicId: string) => void;
    handleCreateFolder: (name: string) => void;
    handleDeleteFolder: (folderId: string) => void;
    handleUpdateFolderName: (folderId: string, newName: string) => void;
    handleMoveCourseToFolder: (courseId: string, targetFolderId: string | null) => void;
    handleSaveItemNote: (courseId: string, subtopicId: string, note: string) => void;
    handleDeleteArticle: (articleId: string) => void;
    handleMoveArticleToFolder: (articleId: string, folderId: string | null) => void;
    
    lastActiveCourseId: string | null;
    
    // Chat
    isChatOpen: boolean;
    chatHistory: ChatMessage[];
    isChatLoading: boolean;
    toggleChat: () => void;
    sendChatMessage: (message: string) => void;
    
    // Background Tasks
    activeTask: BackgroundTask | null;
    backgroundTasks: BackgroundTask[];
    cancelTask: (taskId: string) => void;
    minimizeTask: (taskId: string) => void;
    clearBackgroundTask: (taskId: string) => void;
    handleBackgroundTaskClick: (taskId: string) => void;

    // Projects
    handleSelectProject: (projectId: string | null) => void;
    handleDeleteProject: (projectId: string) => void;
    handleToggleProjectStepComplete: (projectId: string, stepId: string) => void;
    handleGenerateProject: (course: Course, subtopic: Subtopic | LearningItem) => void;


    // Live Interview
    liveInterviewState: LiveInterviewState | null;
    handleStartLiveInterview: (topic: string) => void;
    handleSendLiveInterviewMessage: (message: string) => void;
    handleEndLiveInterview: () => void;

    // Quick Practice
    practiceQuizSession: { topic: string; difficulty: KnowledgeLevel; questions: QuizData[] } | null;
    isPracticeQuizLoading: boolean;
    handleStartPracticeQuiz: (topic: string, difficulty: KnowledgeLevel, navigate: () => void) => void;

    // Topic Practice
    practiceSession: PracticeSession | null;
    isPracticeLoading: boolean;
    practiceError: string | null;
    handleStartTopicPractice: (course: Course, topic: Topic | Module, subtopic: Subtopic | LearningItem, navigate: () => void) => void;


    // Code Explainer
    codeExplanation: { isLoading: boolean; content: string | null; error: string | null; };
    handleGenerateCodeExplanation: (input: { type: 'link' | 'text' | 'image'; content: string | File; }) => void;
    
    // New Folder Flow
    createTopicsModalState: CreateTopicsModalState;
    openCreateTopicsModal: (folderId: string) => void;
    closeCreateTopicsModal: () => void;
    handleBulkGenerateCourses: (topics: string[], folderId: string) => Promise<void>;
    createArticlesModalState: CreateArticlesModalState;
    openCreateArticlesModal: (folderId: string) => void;
    closeCreateArticlesModal: () => void;
    
    // Interactive Planner
    handleGeneratePlanOutline: (topic: string, duration?: number, syllabus?: string, refinementPrompt?: string) => void;
    handleCreateLearningPlanFromOutline: (outline: PlanOutline, folderId: string | null) => void;
    planOutline: PlanOutline | null;
    isPlanOutlineLoading: boolean;
    clearPlanOutline: () => void;

    // Gamification & Interactivity
    unlockAchievement: (id: AchievementId) => void;
    unlockedAchievementNotification: Achievement | null;
    clearUnlockedAchievementNotification: () => void;
    dailyQuest: DailyQuest | null;
    handleDefineTerm: (term: string, position: { top: number; left: number, right?: number }, targetWidth: number) => void;
    definitionState: DefinitionState | null;
    isDefinitionLoading: boolean;
    closeDefinition: () => void;

    // Article Creator
    handleGenerateBlogPost: (topic: string, folderId?: string | null) => void;
    handleGenerateBulkArticles: (syllabus: string, folderId: string | null) => void;
    
    // Article Ideas
    articleIdeasModalState: ArticleIdeasModalState;
    handleShowArticleIdeasModal: (course: Course) => void;
    closeArticleIdeasModal: () => void;
    handleGenerateArticle: (topic: string, courseId: string) => void;

    // Modals
    storyModalState: StoryModalState;
    handleShowTopicStory: (subtopic: Subtopic | LearningItem) => void;
    closeStoryModal: () => void;
    analogyModalState: AnalogyModalState;
    handleShowTopicAnalogy: (subtopic: Subtopic | LearningItem) => void;
    closeAnalogyModal: () => void;
    flashcardModalState: FlashcardModalState;
    handleShowTopicFlashcards: (subtopic: Subtopic | LearningItem) => void;
    closeFlashcardModal: () => void;
    expandTopicModalState: ExpandTopicModalState;
    closeExpandTopicModal: () => void;
    handleExpandTopicInModule: (course: Course, topic: Topic, subtopic: Subtopic, prompt: string) => void;
    handleShowExpandTopicModal: (course: Course) => void;
    exploreModalState: ExploreModalState;
    handleShowExploreModal: (course: Course) => void;
    closeExploreModal: () => void;
    mindMapModalState: MindMapModalState;
    handleShowMindMapModal: (course: Course) => void;
    closeMindMapModal: () => void;
    socraticModalState: SocraticModalState;
    handleShowSocraticQuiz: (subtopic: Subtopic | LearningItem) => void;
    closeSocraticModal: () => void;
    
    // Interview Prep
    interviewPrepState: InterviewPrepState;
    handleStartInterviewPrep: (course: Course) => void;
    handleGenerateInterviewQuestions: (courseId: string, difficulty: KnowledgeLevel, count: number) => void;
    handleElaborateAnswer: (courseId: string, setId: string, qIndex: number, question: string, answer: string) => void;
    resetInterviewPrep: () => void;
    closeInterviewPrepModal: () => void;
    preloadedTest: { topic: string, difficulty: KnowledgeLevel, questions: QuizData[] } | null;
    clearPreloadedTest: () => void;

    // Course Content
    handleUpdateContentBlock: (courseId: string, itemId: string, blockId: string, newSyntax: string) => void;

    // Article Tutor
    articleTutorModalState: ArticleTutorModalState;
    handleOpenArticleTutor: (article: Article) => void;
    closeArticleTutor: () => void;
    sendArticleTutorMessage: (message: string) => void;

    // LearnAI 2.0 Features
    upNextItem: UpNextItem | null;
    understandingCheckState: UnderstandingCheckState;
    handleCheckUnderstanding: (subtopic: Subtopic | LearningItem) => void;
    closeUnderstandingCheckModal: () => void;
    handleUnderstandingCheckSubmit: (answers: Map<number, number>) => void;
    projectTutorState: ProjectTutorState;
    closeProjectTutorModal: () => void;
    handleGetProjectFeedback: (step: ProjectStep, userCode: string) => void;

    // Planner CRUD
    handleRescheduleTask: (planId: string, taskId: string, newDate: number) => void;
    handleDeleteTaskFromPlan: (planId: string, taskId: string) => void;
    handleSetTaskPriority: (planId: string, taskId: string, priority: TaskPriority) => void;
    
    // Habits
    handleAddHabit: (title: string) => void;
    handleToggleHabitCompletion: (habitId: string, date: string) => void;
    handleDeleteHabit: (habitId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, setUser: setAuthUser } = useAuth();

    // Local state, source of truth for the UI during a session.
    const [courses, setCourses] = useState<Course[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    
    const localUser = useMemo(() => {
        if (!user) return null;
        return {
            ...user,
            courses,
            folders,
            projects,
            articles,
            habits,
        };
    }, [user, courses, folders, projects, articles, habits]);

    // --- DATA SYNC & PERSISTENCE ---

    useEffect(() => {
        setIsDataLoading(true);
        if (isAuthenticated && user) {
            // Deserialize maps from user object loaded from storage
            const coursesWithProgress = (user.courses || []).map(c => ({
                ...c,
                progress: new Map(Object.entries(c.progress || {})),
            }));
            const projectsWithProgress = (user.projects || []).map(p => ({
                ...p,
                progress: new Map(Object.entries(p.progress || {})),
            }));
             const courseMap = new Map(coursesWithProgress.map(c => [c.id, c]));
            const articleMap = new Map((user.articles || []).map(a => [a.id, a]));

            const populatedFolders = (user.folders || []).map(folder => ({
                ...folder,
                courses: folder.courses.map(c => c ? courseMap.get(c.id) : null).filter((c): c is Course => !!c),
                articles: folder.articles.map(a => a ? articleMap.get(a.id) : null).filter((a): a is Article => !!a),
            }));

            setCourses(coursesWithProgress);
            setFolders(populatedFolders);
            setProjects(projectsWithProgress);
            setArticles(user.articles || []);
            setHabits(user.habits || []);
            setIsDataLoading(false);
        } else if (!isAuthenticated) {
            // Clear data on logout
            setCourses([]);
            setFolders([]);
            setProjects([]);
            setArticles([]);
            setHabits([]);
            setIsDataLoading(false);
        }
    }, [isAuthenticated, user]);

    // Debounced effect to save all app data to local storage for guest user
    useEffect(() => {
        if (!isAuthenticated || !user || isDataLoading) return;

        const handler = setTimeout(() => {
            if (!localUser) return;
            storageService.saveGuestUserProfile(localUser);
        }, 1500); // Debounce for 1.5 seconds

        return () => clearTimeout(handler);
    }, [courses, folders, projects, articles, habits, user, isAuthenticated, isDataLoading, localUser]);
    
    // === SESSION STATE ===
    const [error, setError] = useState<string | null>(null);
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [activeArticle, setActiveArticle] = useState<Article | null>(null);
    const [topic, setTopic] = useState<string>('');
    const [lastActiveCourseId, setLastActiveCourseId] = useState<string|null>(() => localStorage.getItem('learnai-last-active-course'));
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Chat is ephemeral
    const [liveInterviewState, setLiveInterviewState] = useState<LiveInterviewState | null>(null);
    const [practiceQuizSession, setPracticeQuizSession] = useState<{ topic: string; difficulty: KnowledgeLevel; questions: QuizData[] } | null>(null);
    const [isPracticeQuizLoading, setIsPracticeQuizLoading] = useState(false);
    const [codeExplanation, setCodeExplanation] = useState<{ isLoading: boolean; content: string | null; error: string | null; }>({ isLoading: false, content: null, error: null });
    const [createTopicsModalState, setCreateTopicsModalState] = useState<CreateTopicsModalState>({isOpen: false, folderId: null});
    const [createArticlesModalState, setCreateArticlesModalState] = useState<CreateArticlesModalState>({isOpen: false, folderId: null});
    const [unlockedAchievementNotification, setUnlockedAchievementNotification] = useState<Achievement | null>(null);
    const [activeTask, setActiveTask] = useState<BackgroundTask | null>(null);
    const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
    
    // --- GAMIFICATION & INTERACTIVITY STATE ---
    const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
    const [definitionState, setDefinitionState] = useState<DefinitionState | null>(null);
    const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);
    const [upNextItem, setUpNextItem] = useState<UpNextItem | null>(null);
    const [understandingCheckState, setUnderstandingCheckState] = useState<UnderstandingCheckState>({ isOpen: false, isLoading: false, subtopic: null, quiz: [], error: null });
    const [projectTutorState, setProjectTutorState] = useState<ProjectTutorState>({ isOpen: false, isLoading: false, projectStep: null, userCode: null, feedback: null, error: null });


    // --- MODAL STATES ---
    const [storyModalState, setStoryModalState] = useState<StoryModalState>({ isOpen: false, isLoading: false, title: '', story: '', error: null });
    const [analogyModalState, setAnalogyModalState] = useState<AnalogyModalState>({ isOpen: false, isLoading: false, title: '', analogy: '', error: null });
    const [flashcardModalState, setFlashcardModalState] = useState<FlashcardModalState>({ isOpen: false, isLoading: false, title: '', flashcards: [], error: null });
    const [socraticModalState, setSocraticModalState] = useState<SocraticModalState>({ isOpen: false, isLoading: false, subtopic: null, quiz: [], error: null });
    const [expandTopicModalState, setExpandTopicModalState] = useState<ExpandTopicModalState>({ isOpen: false, isLoading: false, course: null, topic: null, subtopic: null, error: null });
    const [exploreModalState, setExploreModalState] = useState<ExploreModalState>({ isOpen: false, isLoading: false, course: null, relatedTopics: [] });
    const [mindMapModalState, setMindMapModalState] = useState<MindMapModalState>({ isOpen: false, course: null });
    const [articleIdeasModalState, setArticleIdeasModalState] = useState<ArticleIdeasModalState>({ isOpen: false, isLoading: false, course: null, ideas: [], error: null });
    const [interviewPrepState, setInterviewPrepState] = useState<InterviewPrepState>({ isOpen: false, course: null, questionSets: [], isGenerating: false, elaboratingIndex: null, error: null });
    const [preloadedTest, setPreloadedTest] = useState<{ topic: string, difficulty: KnowledgeLevel, questions: QuizData[] } | null>(null);
    const [articleTutorModalState, setArticleTutorModalState] = useState<ArticleTutorModalState>({ isOpen: false, isLoading: false, article: null, chatHistory: [] });
    
    // --- PLANNER STATE ---
    const [planOutline, setPlanOutline] = useState<PlanOutline | null>(null);
    const [isPlanOutlineLoading, setIsPlanOutlineLoading] = useState(false);

    // Practice Session State
    const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
    const [isPracticeLoading, setIsPracticeLoading] = useState(false);
    const [practiceError, setPracticeError] = useState<string | null>(null);

    // Fetch daily quest on load
    useEffect(() => {
        const today = new Date().toDateString();
        const lastQuestDate = localStorage.getItem('learnai-quest-date');

        const fetchQuest = async () => {
            if (today !== lastQuestDate) {
                try {
                    const questData = await geminiService.generateDailyQuest();
                    const newQuest = { ...questData, completed: false };
                    setDailyQuest(newQuest);
                    localStorage.setItem('learnai-quest', JSON.stringify(newQuest));
                    localStorage.setItem('learnai-quest-date', today);
                } catch (e) {
                    console.error("Failed to fetch daily quest", e);
                }
            } else {
                const savedQuest = localStorage.getItem('learnai-quest');
                if (savedQuest) {
                    setDailyQuest(JSON.parse(savedQuest));
                } else {
                    // refetch if it's missing for some reason
                    localStorage.removeItem('learnai-quest-date');
                    fetchQuest();
                }
            }
        };
        if (isAuthenticated) fetchQuest();
    }, [isAuthenticated]);

    // Generate "Up Next" item locally
    useEffect(() => {
        if (!isAuthenticated) {
            setUpNextItem(null);
            return;
        };
        const lastActiveCourse = courses.find(c => c.id === lastActiveCourseId);

        if (lastActiveCourse) {
            const totalLessons = lastActiveCourse.topics.reduce((sum, t) => sum + t.subtopics.length, 0);
            const isComplete = totalLessons > 0 && lastActiveCourse.progress.size === totalLessons;
            if (!isComplete) {
                setUpNextItem({
                    type: 'continue_course',
                    title: 'Pick Up Where You Left Off',
                    description: `You're making great progress in "${lastActiveCourse.title}".`,
                    cta: 'Continue Learning',
                    courseId: lastActiveCourse.id,
                });
                return;
            }
        }

        const firstUnstartedCourse = courses.find(c => c.progress.size === 0);
        if (firstUnstartedCourse) {
             setUpNextItem({
                type: 'start_course',
                title: 'Start a New Adventure',
                description: `Dive into "${firstUnstartedCourse.title}" and expand your skills.`,
                cta: 'Start Topic',
                courseId: firstUnstartedCourse.id,
            });
            return;
        }

        setUpNextItem({
            type: 'skill_assessment',
            title: 'Discover Your Strengths',
            description: 'Take a quick skill assessment to find out what you should learn next.',
            cta: 'Take Assessment',
        });
    }, [courses, lastActiveCourseId, isAuthenticated]);


    const clearPreloadedTest = useCallback(() => setPreloadedTest(null), []);
    const closeStoryModal = useCallback(() => setStoryModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeAnalogyModal = useCallback(() => setAnalogyModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeFlashcardModal = useCallback(() => setFlashcardModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeSocraticModal = useCallback(() => setSocraticModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeExpandTopicModal = useCallback(() => setExpandTopicModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeExploreModal = useCallback(() => setExploreModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeMindMapModal = useCallback(() => setMindMapModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeArticleIdeasModal = useCallback(() => setArticleIdeasModalState(prev => ({ ...prev, isOpen: false })), []);
    const closeDefinition = useCallback(() => setDefinitionState(null), []);
    const closeUnderstandingCheckModal = useCallback(() => setUnderstandingCheckState(prev => ({ ...prev, isOpen: false, subtopic: null, quiz: [], error: null })), []);
    const closeProjectTutorModal = useCallback(() => setProjectTutorState(prev => ({ ...prev, isOpen: false })), []);
    
    const resetInterviewPrep = useCallback(() => {
        setInterviewPrepState({
            isOpen: false,
            course: null,
            questionSets: [],
            isGenerating: false,
            elaboratingIndex: null,
            error: null,
        });
    }, []);

    const closeInterviewPrepModal = useCallback(() => {
        setInterviewPrepState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const clearUnlockedAchievementNotification = useCallback(() => setUnlockedAchievementNotification(null), []);

    const unlockAchievement = useCallback((id: AchievementId) => {
        setAuthUser(prev => {
            if (!prev || prev.achievements.includes(id)) return prev;
            const newAchievements = [...prev.achievements, id];
            const achievement = achievementsMap.get(id);
            if (achievement) { setUnlockedAchievementNotification(achievement); }
            return { ...prev, achievements: newAchievements };
        });
    }, [setAuthUser]);

    const openCreateTopicsModal = useCallback((folderId: string) => setCreateTopicsModalState({ isOpen: true, folderId }), []);
    const closeCreateTopicsModal = useCallback(() => setCreateTopicsModalState({ isOpen: false, folderId: null }), []);
    const openCreateArticlesModal = useCallback((folderId: string) => setCreateArticlesModalState({ isOpen: true, folderId }), []);
    const closeCreateArticlesModal = useCallback(() => setCreateArticlesModalState({ isOpen: false, folderId: null }), []);

    const handleGenerateCourse = useCallback(async (topic: string, level: KnowledgeLevel, folderId: string | null, goal: LearningGoal, style: LearningStyle, source: CourseSource | undefined, specificTech: string, includeTheory: boolean) => {
        const taskId = `task-course-${Date.now()}`;
        setError(null);
        setActiveTask({ id: taskId, type: 'course_generation', topic, status: 'generating', message: 'Generating Learning Path...' });
        
        try {
            const generatedCourseData = await geminiService.generateCourse(topic, level, goal, style, source, specificTech, includeTheory);
            const newCourse: Course = { ...generatedCourseData, id: `course_local_${Date.now()}`, progress: new Map(), knowledgeLevel: level };
            
            setCourses(prev => [...prev, newCourse]);
            if (folderId) {
                setFolders(prev => prev.map(f => f.id === folderId ? { ...f, courses: [...f.courses, newCourse] } : f));
            }

            unlockAchievement('curiousMind');
            if (courses.length + 1 >= 5) unlockAchievement('topicExplorer');
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', courseId: newCourse.id } : prev);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate course.';
            setError(errorMessage);
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, [courses.length, unlockAchievement]);

    const handleToggleItemComplete = useCallback((courseId: string, subtopicId: string) => {
        setCourses(prevCourses =>
            prevCourses.map(course => {
                if (course.id === courseId) {
                    const newProgress = new Map(course.progress);
                    if (newProgress.has(subtopicId)) {
                        newProgress.delete(subtopicId);
                    } else {
                        newProgress.set(subtopicId, Date.now());
                        setAuthUser(prevUser => {
                            if (!prevUser) return null;
                            let newXp = prevUser.xp + XP_PER_LESSON;
                            let newLevel = prevUser.level;
                            let requiredXp = calculateRequiredXp(newLevel);
                            while (newXp >= requiredXp) {
                                newXp -= requiredXp;
                                newLevel++;
                                requiredXp = calculateRequiredXp(newLevel);
                            }
                            return { ...prevUser, xp: newXp, level: newLevel };
                        });
                        unlockAchievement('firstSteps');
                    }
                    return { ...course, progress: newProgress };
                }
                return course;
            })
        );
    }, [unlockAchievement, setAuthUser]);

    const handleAddHabit = useCallback((title: string) => {
        const newHabit: Habit = {
            id: `habit_${Date.now()}`,
            title,
            goal: 'daily',
            createdAt: Date.now(),
            history: {},
        };
        setHabits(prev => [...prev, newHabit]);
    }, []);

    const handleToggleHabitCompletion = useCallback((habitId: string, date: string) => {
        setHabits(prev => {
            return prev.map(habit => {
                if (habit.id === habitId) {
                    const newHistory = { ...habit.history };
                    if (newHistory[date]) {
                        delete newHistory[date];
                    } else {
                        newHistory[date] = true;
                    }
                    return { ...habit, history: newHistory };
                }
                return habit;
            });
        });
    }, []);

    const handleDeleteHabit = useCallback((habitId: string) => {
        if (window.confirm("Are you sure you want to delete this habit? All its history will be lost.")) {
            setHabits(prev => prev.filter(h => h.id !== habitId));
        }
    }, []);
    
    const handleSelectCourse = useCallback((courseId: string | null) => {
        if (!courseId) {
            setActiveCourse(null);
            return;
        }
        const course = courses.find(c => c.id === courseId);
        setActiveCourse(course || null);
        if (course) {
            localStorage.setItem('learnai-last-active-course', courseId);
            setLastActiveCourseId(courseId);
            setActiveArticle(null);
            setActiveProject(null);
        }
    }, [courses]);

    const handleDeleteCourse = useCallback((courseId: string) => {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setFolders(prev => prev.map(folder => ({
            ...folder,
            courses: folder.courses.filter(c => c.id !== courseId)
        })));
        if (activeCourse?.id === courseId) setActiveCourse(null);
    }, [activeCourse]);

    const clearPlanOutline = useCallback(() => {
        setPlanOutline(null);
        setIsPlanOutlineLoading(false);
    }, []);

    const handleGeneratePlanOutline = useCallback(async (topic: string, duration?: number, syllabus?: string, refinementPrompt?: string) => {
        setIsPlanOutlineLoading(true);
        setError(null);
        try {
            const outline = await geminiService.generatePlanOutline(topic, duration, syllabus, refinementPrompt);
            setPlanOutline(outline);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate plan outline.");
            setPlanOutline(null);
        } finally {
            setIsPlanOutlineLoading(false);
        }
    }, []);
    
    const handleMoveCourseToFolder = useCallback((courseId: string, targetFolderId: string | null) => {
        const courseToMove = courses.find(c => c.id === courseId);
        if (!courseToMove) return;

        setFolders(prev => {
            const newFolders = prev.map(f => ({ ...f, courses: f.courses.filter(c => c.id !== courseId) }));
            if (targetFolderId) {
                const targetFolderIndex = newFolders.findIndex(f => f.id === targetFolderId);
                if (targetFolderIndex !== -1) {
                    newFolders[targetFolderIndex].courses.push(courseToMove);
                }
            }
            return newFolders;
        });
    }, [courses]);

    const handleCreateLearningPlanFromOutline = useCallback(async (outline: PlanOutline, folderId: string | null) => {
        const taskId = `task-plan-${Date.now()}`;
        setActiveTask({ 
            id: taskId, 
            type: 'plan_generation', 
            topic: outline.planTitle, 
            status: 'generating', 
            message: 'Generating full course from outline...' 
        });
        
        try {
            const generatedCourseData = await geminiService.generateCourseFromOutline(outline);
            const newCourse: Course = { 
                ...generatedCourseData, 
                id: `course_plan_${Date.now()}`, 
                progress: new Map(), 
                knowledgeLevel: 'beginner', // Default for plans for now
                learningPlanId: `plan_${Date.now()}` // Link course to a plan
            };
            
            setCourses(prev => [...prev, newCourse]);
            if (folderId) {
                handleMoveCourseToFolder(newCourse.id, folderId);
            }
    
            const startDate = new Date();
            startDate.setHours(0,0,0,0);
    
            const newTasks: DailyTask[] = outline.dailyBreakdown.map(item => ({
                id: `task_${newCourse.id}_${item.day}`,
                day: item.day,
                date: startDate.getTime() + (item.day - 1) * 24 * 60 * 60 * 1000,
                courseId: newCourse.id,
                isCompleted: false,
                priority: 'medium' as TaskPriority,
            }));
    
            const newPlan: LearningPlan = {
                id: newCourse.learningPlanId!,
                title: outline.planTitle,
                startDate: startDate.getTime(),
                duration: outline.optimalDuration,
                dailyTasks: newTasks,
                status: 'active',
                folderId: folderId || '',
            };
            
            setAuthUser(prev => {
                if (!prev) return null;
                const updatedPlans = (prev.learningPlans || []).map(p => ({...p, status: 'archived' as const}));
                return { ...prev, learningPlans: [...updatedPlans, newPlan] };
            });
            
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', courseId: newCourse.id } : prev);
            unlockAchievement('curiousMind');
    
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate plan.';
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        } finally {
            clearPlanOutline();
        }
    }, [setAuthUser, unlockAchievement, clearPlanOutline, handleMoveCourseToFolder]);

    const handleRescheduleTask = useCallback((planId: string, taskId: string, newDate: number) => {
        setAuthUser(prev => {
            if (!prev) return null;
            const newPlans = (prev.learningPlans || []).map(plan => {
                if (plan.id === planId) {
                    return {
                        ...plan,
                        dailyTasks: plan.dailyTasks.map(task => 
                            task.id === taskId ? { ...task, date: newDate } : task
                        )
                    };
                }
                return plan;
            });
            return { ...prev, learningPlans: newPlans };
        });
    }, [setAuthUser]);
    
    const handleDeleteTaskFromPlan = useCallback((planId: string, taskId: string) => {
        setAuthUser(prev => {
            if (!prev) return null;
            const newPlans = (prev.learningPlans || []).map(plan => {
                if (plan.id === planId) {
                    return {
                        ...plan,
                        dailyTasks: plan.dailyTasks.filter(task => task.id !== taskId)
                    };
                }
                return plan;
            });
            return { ...prev, learningPlans: newPlans };
        });
    }, [setAuthUser]);

    const handleSetTaskPriority = useCallback((planId: string, taskId: string, priority: TaskPriority) => {
        setAuthUser(prev => {
            if (!prev) return null;
            const newPlans = (prev.learningPlans || []).map(plan => {
                if (plan.id === planId) {
                    return {
                        ...plan,
                        dailyTasks: plan.dailyTasks.map(task => 
                            task.id === taskId ? { ...task, priority } : task
                        )
                    };
                }
                return plan;
            });
            return { ...prev, learningPlans: newPlans };
        });
    }, [setAuthUser]);

    const handleSelectArticle = useCallback((articleId: string | null) => {
        if (!articleId) {
            setActiveArticle(null);
            return;
        }
        const article = articles.find(a => a.id === articleId);
        setActiveArticle(article || null);
        if (article) {
            setActiveCourse(null);
            setActiveProject(null);
        }
    }, [articles]);

    const handleDeleteArticle = useCallback((articleId: string) => {
        setArticles(prev => prev.filter(a => a.id !== articleId));
        setFolders(prev => prev.map(folder => ({
            ...folder,
            articles: folder.articles.filter(a => a.id !== articleId)
        })));
        if (activeArticle?.id === articleId) setActiveArticle(null);
    }, [activeArticle]);

    const handleCreateFolder = useCallback((name: string) => {
        const newFolder: Folder = { id: `folder_${Date.now()}`, name, courses: [], articles: [] };
        setFolders(prev => [...prev, newFolder]);
    }, []);

    const handleDeleteFolder = useCallback((folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
    }, []);

    const handleUpdateFolderName = useCallback((folderId: string, newName: string) => {
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
    }, []);

    const handleMoveArticleToFolder = useCallback((articleId: string, folderId: string | null) => {
        const articleToMove = articles.find(a => a.id === articleId);
        if (!articleToMove) return;

        setFolders(prev => {
            const newFolders = prev.map(f => ({ ...f, articles: f.articles.filter(a => a.id !== articleId) }));
            if (folderId) {
                const targetFolderIndex = newFolders.findIndex(f => f.id === folderId);
                if (targetFolderIndex !== -1) {
                    newFolders[targetFolderIndex].articles.push(articleToMove);
                }
            }
            return newFolders;
        });
    }, [articles]);

    const handleSaveItemNote = useCallback((courseId: string, subtopicId: string, note: string) => {
        setCourses(prev => prev.map(course => {
            if (course.id !== courseId) return course;
            
            const newTopics = course.topics.map(topic => ({
                ...topic,
                subtopics: topic.subtopics.map(subtopic => 
                    subtopic.id === subtopicId ? { ...subtopic, notes: note } : subtopic
                )
            }));
            return { ...course, topics: newTopics };
        }));
    }, []);

    const handleSelectProject = useCallback((projectId: string | null) => {
        if (!projectId) {
            setActiveProject(null);
            return;
        }
        const project = projects.find(p => p.id === projectId);
        setActiveProject(project || null);
        if (project) {
            setActiveCourse(null);
            setActiveArticle(null);
        }
    }, [projects]);

    const cancelTask = useCallback((taskId: string) => {
        setActiveTask(prev => (prev?.id === taskId ? null : prev));
    }, []);

    const minimizeTask = useCallback((taskId: string) => {
        const task = activeTask || backgroundTasks.find(t => t.id === taskId);
        if (task) {
            setBackgroundTasks(prev => [...prev.filter(t => t.id !== taskId), task]);
            setActiveTask(null);
        }
    }, [activeTask, backgroundTasks]);

    const clearBackgroundTask = useCallback((taskId: string) => {
        setBackgroundTasks(p => p.filter(t => t.id !== taskId));
    }, []);

    const handleBackgroundTaskClick = useCallback((taskId: string) => {
        const task = backgroundTasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (task.status === 'done') {
            if (task.courseId) {
                handleSelectCourse(task.courseId);
                clearBackgroundTask(taskId);
            } else if (task.projectId) {
                handleSelectProject(task.projectId);
                clearBackgroundTask(taskId);
            }
        } else {
            setActiveTask(task);
            setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
        }
    }, [backgroundTasks, handleSelectCourse, handleSelectProject, clearBackgroundTask]);


    const handleGenerateProject = useCallback(async (course: Course, subtopic: Subtopic | LearningItem) => {
        const taskId = `task-project-${Date.now()}`;
        setActiveTask({ id: taskId, type: 'project_generation', topic: subtopic.title, status: 'generating', message: 'Generating Guided Project...' });
        
        try {
            const objective = (subtopic.data as ArticleData).objective || 'Create a project based on this topic.';
            const projectData = await geminiService.generateProject(course.title, subtopic.title, objective);
            const newProject: Project = {
                ...projectData,
                id: `project_local_${Date.now()}`,
                progress: new Map(),
                course: { id: course.id, title: course.title }
            };
            setProjects(prev => [...prev, newProject]);
            unlockAchievement('projectStarter');
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', projectId: newProject.id } : prev);
            setTimeout(() => {
                cancelTask(taskId);
                handleSelectProject(newProject.id);
            }, 100);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate project.';
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, [unlockAchievement, cancelTask, handleSelectProject]);

    const handleDeleteProject = useCallback((projectId: string) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
        }
    }, []);

    const handleToggleProjectStepComplete = useCallback((projectId: string, stepId: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const newProgress = new Map(project.progress);
                if (newProgress.has(stepId)) {
                    newProgress.delete(stepId);
                } else {
                    newProgress.set(stepId, Date.now());
                }
                return { ...project, progress: newProgress };
            }
            return project;
        }));
    }, []);
    
    const handleGenerateBlogPost = useCallback(async (topic: string, folderId?: string | null) => {
        const taskId = `task-article-${Date.now()}`;
        setActiveTask({ id: taskId, type: 'article_generation', topic, status: 'generating', message: `Writing article on "${topic}"...` });
        try {
            const result = await geminiService.generateBlogPostAndIdeas(topic);
            const newArticle: Article = { id: `article_${Date.now()}`, title: result.title, subtitle: result.subtitle, blogPost: result.blogPost };
            setArticles(prev => [...prev, newArticle]);
            if (folderId) { handleMoveArticleToFolder(newArticle.id, folderId); }
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', articleId: newArticle.id } : prev);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate blog post";
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMsg } : prev);
        }
    }, [handleMoveArticleToFolder]);

    const handleGenerateBulkArticles = useCallback(async (syllabus: string, folderId: string | null) => {
        const taskId = `task-bulk-article-${Date.now()}`;
        setActiveTask({ id: taskId, type: 'bulk_article_generation', topic: syllabus.substring(0, 50) + '...', status: 'generating', message: 'Generating article ideas...' });
        try {
            const topics = await geminiService.generateArticleTopicsFromSyllabus(syllabus);
            const generated: Article[] = [];
            
            for (let i = 0; i < topics.length; i++) {
                const topic = topics[i];
                setActiveTask(prev => prev?.id === taskId ? { ...prev, message: `Writing article ${i + 1}/${topics.length}: "${topic}"`} : prev);
                const result = await geminiService.generateBlogPostAndIdeas(topic);
                const newArticle: Article = { id: `article_bulk_${i}_${Date.now()}`, title: result.title, subtitle: result.subtitle, blogPost: result.blogPost };
                generated.push(newArticle);
            }

            setArticles(prev => [...prev, ...generated]);
            if (folderId) { generated.forEach(article => handleMoveArticleToFolder(article.id, folderId)); }
            
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'done', message: 'Success!', articleId: generated[0]?.id } : prev);

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An error occurred during bulk generation.";
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMsg } : prev);
        }
    }, [handleMoveArticleToFolder]);
    
    const sendChatMessage = useCallback(async (message: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        setIsChatLoading(true);
        try {
            const response = await geminiService.generateChatResponse(newHistory);
            setChatHistory(prev => [...prev, { role: 'model', content: response }]);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Sorry, I couldn't respond.";
            setChatHistory(prev => [...prev, { role: 'model', content: errorMsg }]);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatHistory]);
    
    const handleStartLiveInterview = useCallback(async (topic: string) => {
        setLiveInterviewState({ topic, transcript: [], isLoading: true, error: null });
        try {
            const firstMessage = await geminiService.startLiveInterview(topic);
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [{ role: 'model', content: firstMessage }], isLoading: false } : null);
        } catch(e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to start interview.";
            setLiveInterviewState(prev => prev ? { ...prev, error: errorMsg, isLoading: false } : null);
        }
    }, []);
    
    const handleSendLiveInterviewMessage = useCallback(async (message: string) => {
        if (!liveInterviewState) return;
        const newTranscript: ChatMessage[] = [...liveInterviewState.transcript, { role: 'user', content: message }];
        setLiveInterviewState({ ...liveInterviewState, transcript: newTranscript, isLoading: true });
        try {
            const response = await geminiService.generateLiveInterviewResponse(liveInterviewState.topic, newTranscript);
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [...prev.transcript, { role: 'model', content: response }], isLoading: false } : null);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to get response.";
            setLiveInterviewState(prev => prev ? { ...prev, error: errorMsg, isLoading: false } : null);
        }
    }, [liveInterviewState]);

    const handleEndLiveInterview = useCallback(() => setLiveInterviewState(null), []);

    const handleStartPracticeQuiz = useCallback(async (topic: string, difficulty: KnowledgeLevel, navigate: () => void) => {
        setIsPracticeQuizLoading(true);
        try {
            const questions = await geminiService.generateQuickPracticeQuiz(topic, difficulty, 10);
            setPracticeQuizSession({ topic, difficulty, questions });
            navigate();
        } catch (e) {
            console.error("Failed to generate practice quiz", e);
        } finally {
            setIsPracticeQuizLoading(false);
        }
    }, []);

    const handleStartTopicPractice = useCallback(async (course: Course, topic: Topic | Module, subtopic: Subtopic | LearningItem, navigate: () => void) => {
        setIsPracticeLoading(true);
        setPracticeError(null);
        setPracticeSession(null);
        try {
            const sessionData = await geminiService.generatePracticeSession(subtopic.title);
            setPracticeSession(sessionData);
            navigate();
        } catch (e) {
            setPracticeError(e instanceof Error ? e.message : 'Failed to generate practice session.');
        } finally {
            setIsPracticeLoading(false);
        }
    }, []);

    const handleGenerateCodeExplanation = useCallback(async (input: { type: 'link' | 'text' | 'image'; content: string | File; }) => {
        setCodeExplanation({ isLoading: true, content: null, error: null });
        try {
            let geminiInput: any;
            if (input.type === 'image' && input.content instanceof File) {
                const fileToRead = input.content;
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(fileToRead);
                });
                geminiInput = { type: 'image', content: { data: base64, mimeType: input.content.type }};
            } else {
                geminiInput = { type: input.type, content: input.content as string };
            }
            const explanation = await geminiService.generateCodeExplanation(geminiInput);
            setCodeExplanation({ isLoading: false, content: explanation, error: null });
        } catch (e) {
            setCodeExplanation({ isLoading: false, content: null, error: e instanceof Error ? e.message : 'Failed to generate explanation.' });
        }
    }, []);
    
    const handleBulkGenerateCourses = useCallback(async (topics: string[], folderId: string) => {
        for (const topic of topics) {
            // This generates courses one by one with the default settings
            await handleGenerateCourse(topic, 'beginner', folderId, 'theory', 'balanced', undefined, '', false);
            // A delay can prevent hitting API rate limits if any
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }, [handleGenerateCourse]);

    const handleDefineTerm = useCallback(async (term: string, position: { top: number; left: number, right?: number }, targetWidth: number) => {
        setDefinitionState({ term, definition: '', position, targetWidth });
        setIsDefinitionLoading(true);
        try {
            const definition = await geminiService.defineTerm(term);
            setDefinitionState({ term, definition, position, targetWidth });
        } catch (e) {
            setDefinitionState({ term, definition: "Could not fetch definition.", position, targetWidth });
        } finally {
            setIsDefinitionLoading(false);
        }
    }, []);

    const handleShowTopicStory = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setStoryModalState({ isOpen: true, isLoading: true, title: subtopic.title, story: '', error: null });
        try {
            const story = await geminiService.generateStory(subtopic.title);
            setStoryModalState(prev => ({ ...prev, story, isLoading: false }));
        } catch(e) {
            setStoryModalState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to generate story', isLoading: false }));
        }
    }, []);
    
    const handleShowTopicAnalogy = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setAnalogyModalState({ isOpen: true, isLoading: true, title: subtopic.title, analogy: '', error: null });
        try {
            const analogy = await geminiService.generateAnalogy(subtopic.title);
            setAnalogyModalState(prev => ({ ...prev, analogy, isLoading: false }));
        } catch(e) {
            setAnalogyModalState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to generate analogy', isLoading: false }));
        }
    }, []);

    const handleShowTopicFlashcards = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setFlashcardModalState({ isOpen: true, isLoading: true, title: subtopic.title, flashcards: [], error: null });
        try {
            const flashcards = await geminiService.generateFlashcards(subtopic.title);
            setFlashcardModalState(prev => ({ ...prev, flashcards, isLoading: false }));
        } catch(e) {
            setFlashcardModalState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to generate flashcards', isLoading: false }));
        }
    }, []);

    const handleShowSocraticQuiz = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setSocraticModalState({ isOpen: true, isLoading: true, subtopic, quiz: [], error: null });
        try {
            // FIX: Add type guard to safely access contentBlocks
            const content = (subtopic.type === 'article' && subtopic.data.contentBlocks)
                ? subtopic.data.contentBlocks.map(b => b.text || b.code).join('\n') 
                : subtopic.title;
            const quiz = await geminiService.generateSocraticQuiz(content);
            setSocraticModalState(prev => ({ ...prev, quiz, isLoading: false }));
        } catch(e) {
            setSocraticModalState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to generate quiz', isLoading: false }));
        }
    }, []);

    const handleShowExpandTopicModal = useCallback((course: Course) => {
        setExpandTopicModalState({ isOpen: true, isLoading: false, course, topic: null, subtopic: null, error: null });
    }, []);

    const handleExpandTopicInModule = useCallback(async (course: Course, topic: Topic, subtopic: Subtopic, prompt: string) => {
        setExpandTopicModalState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const newSubtopics = await geminiService.generateFollowUpSubtopics(course.title, topic.title, subtopic.title, prompt);
            setCourses(prevCourses => {
                return prevCourses.map(c => {
                    if (c.id !== course.id) return c;
                    const newTopics = c.topics.map(t => {
                        if (t.title !== topic.title) return t;
                        const subtopicIndex = t.subtopics.findIndex(s => s.id === subtopic.id);
                        if (subtopicIndex === -1) return t;
                        
                        const newSubtopicsForTopic = [...t.subtopics];
                        newSubtopicsForTopic.splice(subtopicIndex + 1, 0, ...newSubtopics.map(s => ({...s, isAdaptive: true})));
                        return { ...t, subtopics: newSubtopicsForTopic };
                    });
                    return { ...c, topics: newTopics };
                });
            });
            setExpandTopicModalState(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to expand topic";
            setExpandTopicModalState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        }
    }, []);

    const handleShowExploreModal = useCallback(async (course: Course) => {
        setExploreModalState({ isOpen: true, isLoading: true, course, relatedTopics: [] });
        try {
            const topics = await geminiService.generateRelatedTopics(course.title);
            setExploreModalState(prev => ({ ...prev, isLoading: false, relatedTopics: topics }));
        } catch (e) {
            console.error(e);
            setExploreModalState(prev => ({ ...prev, isLoading: false })); // Close or show error
        }
    }, []);

    // FIX: Implement missing function
    const handleShowArticleIdeasModal = useCallback(async (course: Course) => {
        setArticleIdeasModalState({ isOpen: true, isLoading: true, course, ideas: [], error: null });
        try {
            const ideas = await geminiService.generateArticleIdeas(course.title);
            setArticleIdeasModalState(prev => ({ ...prev, isLoading: false, ideas }));
        } catch (e) {
            setArticleIdeasModalState(prev => ({ ...prev, isLoading: false, error: e instanceof Error ? e.message : 'Failed to generate ideas' }));
        }
    }, []);

    // FIX: Implement missing function
    const handleGenerateArticle = useCallback(async (topic: string, courseId: string) => {
        setArticleIdeasModalState(prev => ({ ...prev, isLoading: true }));
        try {
            const result = await geminiService.generateBlogPostAndIdeas(topic);
            const course = courses.find(c => c.id === courseId);
            const newArticle: Article = { 
                id: `article_${Date.now()}`, 
                title: result.title, 
                subtitle: result.subtitle, 
                blogPost: result.blogPost,
                course: course ? { id: course.id, title: course.title } : undefined,
            };
            setArticles(prev => [...prev, newArticle]);
            closeArticleIdeasModal();
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate blog post";
            setArticleIdeasModalState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        }
    }, [courses, closeArticleIdeasModal]);


    const handleShowMindMapModal = useCallback((course: Course) => {
        setMindMapModalState({ isOpen: true, course });
    }, []);
    
    const handleStartInterviewPrep = useCallback((course: Course) => {
        setInterviewPrepState({ isOpen: true, course, questionSets: course.interviewQuestionSets || [], isGenerating: false, elaboratingIndex: null, error: null });
    }, []);
    
    const handleGenerateInterviewQuestions = useCallback(async (courseId: string, difficulty: KnowledgeLevel, count: number) => {
        setInterviewPrepState(prev => ({ ...prev, isGenerating: true, error: null }));
        try {
            const course = courses.find(c => c.id === courseId);
            if (!course) throw new Error("Course not found");

            const existingQuestions = (course.interviewQuestionSets || []).flatMap(set => set.questions.map(q => q.question));
            const newQuestions = await geminiService.generateInterviewQuestions(course.title, difficulty, count, existingQuestions);
            
            const newSet: InterviewQuestionSet = {
                id: `set_${Date.now()}`,
                timestamp: Date.now(),
                difficulty,
                questionCount: newQuestions.length,
                questions: newQuestions
            };
            
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, interviewQuestionSets: [...(c.interviewQuestionSets || []), newSet] } : c));
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, questionSets: [...prev.questionSets, newSet] }));

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate questions";
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, error: errorMsg }));
        }
    }, [courses]);
    
    const handleElaborateAnswer = useCallback(async (courseId: string, setId: string, qIndex: number, question: string, answer: string) => {
        const setIndex = interviewPrepState.questionSets.findIndex(s => s.id === setId);
        if (setIndex === -1) return;

        setInterviewPrepState(prev => ({ ...prev, elaboratingIndex: { setIndex, qIndex } }));
        try {
            const elaborated = await geminiService.elaborateOnAnswer(question, answer);
            
            setCourses(prevCourses => prevCourses.map(c => {
                if (c.id !== courseId) return c;
                const newSets = (c.interviewQuestionSets || []).map(s => {
                    if (s.id !== setId) return s;
                    const newQuestions = [...s.questions];
                    newQuestions[qIndex] = { ...newQuestions[qIndex], answer: elaborated };
                    return { ...s, questions: newQuestions };
                });
                return { ...c, interviewQuestionSets: newSets };
            }));

             setInterviewPrepState(prev => ({
                ...prev,
                questionSets: prev.questionSets.map(s => {
                    if (s.id !== setId) return s;
                     const newQuestions = [...s.questions];
                    newQuestions[qIndex] = { ...newQuestions[qIndex], answer: elaborated };
                    return { ...s, questions: newQuestions };
                }),
                elaboratingIndex: null
            }));

        } catch(e) {
             setInterviewPrepState(prev => ({ ...prev, elaboratingIndex: null, error: "Failed to elaborate." }));
        }
    }, [interviewPrepState.questionSets]);

    // FIX: Refactored to use a type guard for 'article' subtopics to ensure type safety when updating content blocks. This resolves a complex TypeScript error.
    const handleUpdateContentBlock = useCallback((courseId: string, itemId: string, blockId: string, newSyntax: string) => {
        setCourses(prev => prev.map(c => {
            if (c.id !== courseId) return c;
            const newTopics = c.topics.map(t => ({
                ...t,
                subtopics: t.subtopics.map(s => {
                    if (s.id !== itemId || s.type !== 'article') {
                        return s;
                    }

                    const newData: ArticleData = {
                        ...s.data,
                        contentBlocks: s.data.contentBlocks.map(b => 
                            b.id === blockId && b.type === 'diagram' ? { ...b, diagram: newSyntax } : b
                        ),
                    };
                    return { ...s, data: newData };
                })
            }));
            return { ...c, topics: newTopics };
        }));
    }, []);

    const handleOpenArticleTutor = useCallback((article: Article) => {
        const initialMessage: ChatMessage = { role: 'model', content: `Hi there! I'm your AI Tutor. Feel free to ask me anything about the article "${article.title}". What's on your mind?`};
        setArticleTutorModalState({ isOpen: true, isLoading: false, article, chatHistory: [initialMessage] });
    }, []);

    const closeArticleTutor = useCallback(() => {
        setArticleTutorModalState({ isOpen: false, isLoading: false, article: null, chatHistory: [] });
    }, []);
    
    const sendArticleTutorMessage = useCallback(async (message: string) => {
        if (!articleTutorModalState.article) return;
        
        const newHistory: ChatMessage[] = [...articleTutorModalState.chatHistory, { role: 'user', content: message }];
        setArticleTutorModalState(prev => ({...prev, chatHistory: newHistory, isLoading: true }));
        
        const context = `The user is asking about the following article:\n\nTitle: ${articleTutorModalState.article.title}\nContent:\n${articleTutorModalState.article.blogPost}`;
        
        try {
            const response = await geminiService.generateChatResponse(newHistory, context);
            setArticleTutorModalState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, { role: 'model', content: response }], isLoading: false }));
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Sorry, I couldn't respond.";
            setArticleTutorModalState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, { role: 'model', content: errorMsg }], isLoading: false }));
        }
    }, [articleTutorModalState]);

    const handleCheckUnderstanding = useCallback(async (subtopic: Subtopic | LearningItem) => {
        setUnderstandingCheckState({ isOpen: true, isLoading: true, subtopic, quiz: [], error: null });
        try {
            // FIX: Add type guard to safely access contentBlocks
            const content = (subtopic.type === 'article' && subtopic.data.contentBlocks) 
                ? subtopic.data.contentBlocks.map(b => b.text || b.code).join('\n') 
                : subtopic.title;
            const quiz = await geminiService.generateUnderstandingCheck(content);
            setUnderstandingCheckState(prev => ({ ...prev, quiz, isLoading: false }));
        } catch (e) {
            setUnderstandingCheckState(prev => ({ ...prev, isLoading: false, error: e instanceof Error ? e.message : "Failed to generate quiz." }));
        }
    }, []);
    
    const handleUnderstandingCheckSubmit = useCallback(async (answers: Map<number, number>) => {
        const { subtopic, quiz } = understandingCheckState;
        if (!subtopic || quiz.length === 0) return;
        
        let correctCount = 0;
        answers.forEach((answer, index) => {
            if (quiz[index].answer === answer) {
                correctCount++;
            }
        });

        const score = correctCount / quiz.length;
        closeUnderstandingCheckModal();

        if (score < 0.5) { // Threshold for adaptive learning
             const taskId = `task-topic-expansion-${Date.now()}`;
             minimizeTask(taskId); // Show it in the background
             setBackgroundTasks(prev => [...prev, { id: taskId, type: 'topic_expansion', topic: subtopic.title, status: 'generating', message: 'Generating a remedial lesson...' }]);
             
             try {
                 const remedialSubtopic = await geminiService.generateRemedialSubtopic(subtopic);
                 remedialSubtopic.isAdaptive = true;
                 
                 setCourses(prevCourses => prevCourses.map(c => {
                     const newTopics = c.topics.map(t => {
                         const subtopicIndex = t.subtopics.findIndex(s => s.id === subtopic.id);
                         if (subtopicIndex > -1) {
                             t.subtopics.splice(subtopicIndex, 0, remedialSubtopic);
                         }
                         return { ...t };
                     });
                     return { ...c, topics: newTopics };
                 }));
                 setBackgroundTasks(prev => prev.map(t => t.id === taskId ? {...t, status: 'done', message: 'Remedial lesson added!'} : t));
             } catch(e) {
                  setBackgroundTasks(prev => prev.map(t => t.id === taskId ? {...t, status: 'error', message: 'Failed to add lesson.'} : t));
             }
        } else {
            // Find next subtopic and continue
        }
    }, [understandingCheckState, closeUnderstandingCheckModal, minimizeTask]);

    const handleGetProjectFeedback = useCallback(async (step: ProjectStep, userCode: string) => {
        setProjectTutorState({ isOpen: true, isLoading: true, projectStep: step, userCode, feedback: null, error: null });
        try {
            const feedback = await geminiService.reviewProjectCode(step.challenge, userCode);
            setProjectTutorState(prev => ({ ...prev, isLoading: false, feedback }));
        } catch (e) {
            setProjectTutorState(prev => ({ ...prev, isLoading: false, error: e instanceof Error ? e.message : "Failed to get feedback" }));
        }
    }, []);

    const value: AppContextType = {
        courses, folders, projects, articles, localUser: localUser!, activeCourse, activeProject, activeArticle, topic, error, isDataLoading, handleGenerateCourse, handleSelectCourse, handleToggleItemComplete, handleAddHabit, handleToggleHabitCompletion, handleDeleteHabit,
        handleDeleteCourse, lastActiveCourseId, isChatOpen, chatHistory, isChatLoading, activeTask, backgroundTasks, liveInterviewState, practiceQuizSession, isPracticeQuizLoading, practiceSession, isPracticeLoading, practiceError, codeExplanation, createTopicsModalState, openCreateTopicsModal, closeCreateTopicsModal, createArticlesModalState, openCreateArticlesModal, closeCreateArticlesModal, unlockAchievement, unlockedAchievementNotification, clearUnlockedAchievementNotification, dailyQuest, definitionState, isDefinitionLoading, closeDefinition, articleIdeasModalState, closeArticleIdeasModal, storyModalState, closeStoryModal, analogyModalState, closeAnalogyModal, flashcardModalState, closeFlashcardModal, expandTopicModalState, closeExpandTopicModal, exploreModalState, closeExploreModal, mindMapModalState, closeMindMapModal, socraticModalState, closeSocraticModal, interviewPrepState, resetInterviewPrep, closeInterviewPrepModal, preloadedTest, clearPreloadedTest, articleTutorModalState, closeArticleTutor, upNextItem, understandingCheckState, closeUnderstandingCheckModal, projectTutorState, closeProjectTutorModal,
        handleGeneratePlanOutline, handleCreateLearningPlanFromOutline, planOutline, isPlanOutlineLoading, clearPlanOutline,
        handleRescheduleTask, handleDeleteTaskFromPlan, handleSetTaskPriority,
        handleSelectArticle, handleCreateFolder, handleDeleteFolder, handleUpdateFolderName, handleSaveItemNote, handleDeleteArticle, handleMoveArticleToFolder, handleMoveCourseToFolder,
        toggleChat: () => setIsChatOpen(p => !p), sendChatMessage,
        cancelTask, minimizeTask, clearBackgroundTask, handleBackgroundTaskClick,
        handleSelectProject, handleDeleteProject, handleToggleProjectStepComplete, handleGenerateProject,
        handleStartLiveInterview, handleSendLiveInterviewMessage, handleEndLiveInterview,
        handleStartPracticeQuiz, handleStartTopicPractice, handleGenerateCodeExplanation, handleBulkGenerateCourses,
        handleDefineTerm, handleGenerateBlogPost, handleGenerateBulkArticles,
        handleShowArticleIdeasModal,
        handleGenerateArticle,
        handleShowTopicStory, handleShowTopicAnalogy, handleShowTopicFlashcards,
        handleExpandTopicInModule, handleShowExpandTopicModal, handleShowExploreModal,
        handleShowMindMapModal, handleShowSocraticQuiz, handleStartInterviewPrep,
        handleGenerateInterviewQuestions, handleElaborateAnswer,
        handleUpdateContentBlock, handleOpenArticleTutor, sendArticleTutorMessage,
        handleCheckUnderstanding, handleUnderstandingCheckSubmit, handleGetProjectFeedback,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
