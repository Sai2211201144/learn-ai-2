

export type AchievementId = 'curiousMind' | 'topicExplorer' | 'firstSteps' | 'dedicatedLearner' | 'projectStarter' | 'quizMaster';

export interface Achievement {
    id: AchievementId;
    title: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface QuizData {
  q: string;
  options: string[];
  answer: number; // index of the correct option
  explanation?: string;
}

export interface InteractiveModelData {
    title: string;
    description: string;
    layers: {
        type: 'input' | 'hidden' | 'output';
        neurons: number;
        activation?: 'relu' | 'sigmoid' | 'tanh';
    }[];
    sampleInput: number[];
    expectedOutput: number[];
}

export interface Outcome {
    trainingLoss: number[];
    validationLoss: number[];
    description: string;
}

export type OutcomeCombination = string; // e.g., '0-1-2'

export interface HyperparameterData {
    title: string;
    description: string;
    parameters: {
        name: string;
        options: {
            label: string;
            description: string;
        }[];
    }[];
    outcomes: {
        combination: OutcomeCombination;
        result: Outcome;
    }[];
}

export interface TriageChallengeData {
    scenario: string;
    evidence: string; // Mermaid syntax
    options: {
        title: string;
        description: string;
    }[];
    correctOptionIndex: number;
    explanation: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'code' | 'quiz' | 'diagram' | 'interactiveModel' | 'hyperparameterSimulator' | 'triageChallenge';
  text?: string;
  code?: string;
  quiz?: QuizData;
  diagram?: string;
  interactiveModel?: InteractiveModelData;
  hyperparameterSimulator?: HyperparameterData;
  triageChallenge?: TriageChallengeData;
}

export interface ArticleData {
  objective: string;
  contentBlocks: ContentBlock[];
}

export interface QuizActivityData {
    description: string;
    questions: QuizData[];
}

export interface ProjectActivityData {
    description: string;
    codeStub: string;
    challenge: string;
}

export type Subtopic = { id: string; notes?: string; isAdaptive?: boolean; } & (
    | { type: 'article'; title: string; data: ArticleData; }
    | { type: 'quiz'; title: string; data: QuizActivityData; }
    | { type: 'project'; title: string; data: ProjectActivityData; }
);

export interface Topic {
  title: string;
  subtopics: Subtopic[];
}

export interface PathOverview {
    duration: string;
    totalTopics: number;
    totalSubtopics: number;
    keyFeatures: string[];
}

export interface Course {
  id:string;
  title:string;
  description: string;
  category: string;
  technologies: string[];
  topics: Topic[];
  knowledgeLevel: KnowledgeLevel;
  progress: Progress;
  about: string;
  overview: PathOverview;
  learningOutcomes: string[];
  skills: string[];
  interviewQuestionSets?: InterviewQuestionSet[];
  learningPlanId?: string;
  dayInPlan?: number;
}

export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  codeStub: string;
  challenge: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  steps: ProjectStep[];
  course?: {
    id: string;
    title: string;
  };
  progress: Progress;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface Article {
    id: string;
    title: string;
    subtitle: string;
    blogPost: string;
    course?: { id: string, title: string };
}

export interface Folder {
  id: string;
  name: string;
  courses: (Course | { id: string } | null)[];
  articles: (Article | { id: string } | null)[];
}

// Progress is a map of completed Subtopic IDs to their completion timestamp.
export type Progress = Map<string, number>; 
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal = 'project' | 'interview' | 'theory' | 'curiosity';
export type LearningStyle = 'visual' | 'code' | 'balanced' | 'interactive';

// Aliases for legacy types
export type Module = Topic;
export type LearningItem = Subtopic;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface TestResult {
  id: string;
  topic: string;
  difficulty: KnowledgeLevel;
  score: number; // e.g., 0.8 for 80%
  questionCount: number;
  timestamp: number;
}

export interface Recommendation {
    topic: string;
    reason: string;
}
export interface RelatedTopic extends Recommendation {}

export interface InterviewQuestion {
    question: string;
    answer: string;
}

export interface InterviewQuestionSet {
    id: string;
    timestamp: number;
    difficulty: KnowledgeLevel;
    questionCount: number;
    questions: InterviewQuestion[];
}

export interface StoryModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  story: string;
  error: string | null;
}

export interface CreateTopicsModalState {
  isOpen: boolean;
  folderId: string | null;
}

export interface CreateArticlesModalState {
  isOpen: boolean;
  folderId: string | null;
}

export interface ExpandTopicModalState {
  isOpen: boolean;
  isLoading: boolean;
  course: Course | null;
  topic: Topic | null;
  subtopic: Subtopic | null;
  error: string | null;
}

export interface AnalogyModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  analogy: string;
  error: string | null;
}

export interface SocraticModalState {
  isOpen: boolean;
  isLoading: boolean;
  subtopic: Subtopic | LearningItem | null;
  quiz: QuizData[];
  error: string | null;
}

export interface FlashcardModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  flashcards: Flashcard[];
  error: string | null;
}

export interface PracticeConcept {
    title: string;
    description: string;
    codeExample: string;
}

export interface PracticeSession {
    topic: string;
    concepts: PracticeConcept[];
    quiz: QuizData[];
}

export interface BackgroundTask {
    id: string;
    type: 'course_generation' | 'topic_expansion' | 'project_generation' | 'plan_generation';
    topic: string;
    status: 'generating' | 'done' | 'error';
    message: string;
    courseId?: string;
    projectId?: string;
}

export interface LiveInterviewState {
  topic: string;
  transcript: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface Habit {
  id: string;
  title: string;
  goal: 'daily' | 'weekly';
  createdAt: number;
  history: Record<string, boolean>; // "YYYY-MM-DD": true
}

export interface DailyTask {
  id: string;
  day: number;
  date: number;
  courseId: string;
  isCompleted: boolean;
}

export interface LearningPlan {
  id: string;
  title:string;
  startDate: number;
  duration: number;
  dailyTasks: DailyTask[];
  status: 'active' | 'completed' | 'archived';
  folderId: string;
}


export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  xp: number;
  level: number;
  achievements: AchievementId[];
  courses: Course[];
  projects: Project[];
  articles: Article[];
  folders: Folder[];
  learningPlans: LearningPlan[];
  habits: Habit[];
}

export type CourseSource = {
  type: 'syllabus';
  content: string;
} | {
  type: 'url';
  content: string;
} | {
  type: 'pdf';
  content: string; // base64 encoded text content
  filename: string;
};

// Article Creator
export interface BlogPostAndIdeas {
    title: string;
    subtitle: string;
    blogPost: string;
    relatedTopics: string[];
}

export interface ArticleCreatorState {
    isLoading: boolean;
    error: string | null;
    title: string | null;
    subtitle: string | null;
    blogPost: string | null;
    ideas: string[];
}

export interface BulkArticleGenerationState {
    isLoading: boolean;
    progressMessage: string | null;
    generatedArticles: Article[];
    error: string | null;
}

export interface InterviewPrepState {
  isOpen: boolean;
  course: Course | null;
  questionSets: InterviewQuestionSet[];
  isGenerating: boolean;
  elaboratingIndex: { setIndex: number; qIndex: number } | null;
  error: string | null;
}

export interface ArticleIdeasModalState {
    isOpen: boolean;
    isLoading: boolean;
    course: Course | null;
    ideas: string[];
    error?: string | null;
}

export interface ExploreModalState {
    isOpen: boolean;
    isLoading: boolean;
    course: Course | null;
    relatedTopics: RelatedTopic[];
}

export interface MindMapModalState {
    isOpen: boolean;
    course: Course | null;
}

export interface MindMapNode {
    title: string;
    children: MindMapNode[];
}

export interface ArticleTutorModalState {
  isOpen: boolean;
  isLoading: boolean;
  article: Article | null;
  chatHistory: ChatMessage[];
}

export interface DailyQuest {
    title: string;
    description: string;
    xp: number;
    completed: boolean;
}

export interface DefinitionState {
    term: string;
    definition: string;
    position: {
        top: number;
        left: number;
        right?: number;
    };
    targetWidth: number;
}

export interface UpNextItem {
    type: 'continue_course' | 'start_course' | 'practice_topic' | 'skill_assessment';
    title: string;
    description: string;
    cta: string;
    courseId?: string;
    topic?: string;
}

export interface UnderstandingCheckState {
  isOpen: boolean;
  isLoading: boolean;
  subtopic: Subtopic | LearningItem | null;
  quiz: QuizData[];
  error: string | null;
}

export interface ProjectTutorState {
    isOpen: boolean;
    isLoading: boolean;
    projectStep: ProjectStep | null;
    userCode: string | null;
    feedback: string | null;
    error: string | null;
}


export type View = 'planner' | 'assessment' | 'practice' | 'interview' | 'projects' | 'practice_quiz' | 'code_explainer' | 'profile' | 'login' | 'article_viewer' | 'habits';