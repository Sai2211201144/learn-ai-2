
import { Course, Folder, ChatMessage, TestResult, Progress, Project, User, Article } from '../types';

const CHAT_HISTORY_KEY = 'mindflow:chat_history';
const TEST_RESULTS_KEY = 'mindflow:test_results';
const COURSES_KEY = 'learnai:courses';
const FOLDERS_KEY = 'learnai:folders';
const PROJECTS_KEY = 'learnai:projects';
const ARTICLES_KEY = 'learnai:articles';
const GUEST_USER_PROFILE_KEY = 'learnai:guest_user_profile';

// --- Guest User Profile ---
export const getGuestUserProfile = (): User | null => {
    try {
        const saved = localStorage.getItem(GUEST_USER_PROFILE_KEY);
        if (saved) {
            const user = JSON.parse(saved);
            // Ensure habits array exists for backward compatibility
            if (!user.habits) {
                user.habits = [];
            }
            if (!user.learningPlans) {
                user.learningPlans = [];
            }
            return user;
        }
        return null;
    } catch (e) {
        console.error("Failed to load guest user profile", e);
        return null;
    }
};

export const saveGuestUserProfile = (user: User): void => {
    try {
        // Serialize progress Maps before saving to localStorage
        const serializableUser = {
            ...user,
            courses: user.courses.map(c => ({
                ...c,
                progress: Object.fromEntries(c.progress),
            })),
            projects: user.projects.map(p => ({
                ...p,
                progress: Object.fromEntries(p.progress),
            })),
        };
        localStorage.setItem(GUEST_USER_PROFILE_KEY, JSON.stringify(serializableUser));
    } catch (e) {
        console.error("Failed to save guest user profile", e);
    }
};

// --- Course Management ---
export const getCourses = (): Course[] => {
    try {
        const saved = localStorage.getItem(COURSES_KEY);
        if (!saved) return [];
        const courses = JSON.parse(saved);
        return courses.map((c: any) => ({
            ...c,
            progress: new Map(Object.entries(c.progress || {})),
        }));
    } catch (e) {
        console.error("Failed to load courses from localStorage", e);
        return [];
    }
};

export const saveCourses = (courses: Course[]): void => {
    try {
        const serializableCourses = courses.map(c => ({
            ...c,
            progress: Object.fromEntries(c.progress),
        }));
        localStorage.setItem(COURSES_KEY, JSON.stringify(serializableCourses));
    } catch (e) {
        console.error("Failed to save courses to localStorage", e);
    }
};

// --- Folder Management ---
export const getFolders = (): Folder[] => {
    try {
        const saved = localStorage.getItem(FOLDERS_KEY);
        // Ensure articles array exists
        const folders = saved ? JSON.parse(saved) : [];
        return folders.map((f: any) => ({...f, articles: f.articles || []}));
    } catch (e) {
        console.error("Failed to load folders from localStorage", e);
        return [];
    }
};

export const saveFolders = (folders: Folder[]): void => {
    try {
        const serializableFolders = folders.map(folder => ({
            ...folder,
            courses: folder.courses.map(course => course ? ({ id: course.id }) : null).filter(Boolean),
            articles: folder.articles.map(article => article ? ({ id: article.id }) : null).filter(Boolean)
        }));
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(serializableFolders));
    } catch (e) {
        console.error("Failed to save folders to localStorage", e);
    }
};

// --- Project Management ---
export const getProjects = (): Project[] => {
    try {
        const saved = localStorage.getItem(PROJECTS_KEY);
        if (!saved) return [];
        const projects = JSON.parse(saved);
        return projects.map((p: any) => ({
            ...p,
            progress: new Map(Object.entries(p.progress || {})),
        }));
    } catch (e) {
        console.error("Failed to load projects from localStorage", e);
        return [];
    }
};

export const saveProjects = (projects: Project[]): void => {
    try {
        const serializableProjects = projects.map(p => ({
            ...p,
            progress: Object.fromEntries(p.progress),
        }));
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(serializableProjects));
    } catch (e) {
        console.error("Failed to save projects to localStorage", e);
    }
};

// --- Article Management ---
export const getArticles = (): Article[] => {
    try {
        const saved = localStorage.getItem(ARTICLES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to load articles", e);
        return [];
    }
};

export const saveArticles = (articles: Article[]): void => {
    try {
        localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
    } catch (e) {
        console.error("Failed to save articles", e);
    }
};


// --- Chat History Management ---

export const getChatHistory = (): ChatMessage[] => {
    try {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
        console.error("Failed to load chat history from localStorage", error);
        return [];
    }
};

export const saveChatHistory = (history: ChatMessage[]): void => {
    try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
};

// --- Test Results Management ---

export const getTestResults = (): TestResult[] => {
    try {
        const savedResults = localStorage.getItem(TEST_RESULTS_KEY);
        return savedResults ? JSON.parse(savedResults) : [];
    } catch (error) {
        console.error("Failed to load test results from localStorage", error);
        return [];
    }
};

export const saveTestResult = (newResult: TestResult): void => {
    try {
        const existingResults = getTestResults();
        const updatedResults = [newResult, ...existingResults];
        localStorage.setItem(TEST_RESULTS_KEY, JSON.stringify(updatedResults));
    } catch (error) {
        console.error("Failed to save test result to localStorage", error);
    }
};

// --- Data Management ---
export const getAllDataForBackup = () => {
    // This function now just reads raw string data from localStorage for export.
    return {
        courses: localStorage.getItem(COURSES_KEY),
        folders: localStorage.getItem(FOLDERS_KEY),
        projects: localStorage.getItem(PROJECTS_KEY),
        articles: localStorage.getItem(ARTICLES_KEY),
        guestUserProfile: localStorage.getItem(GUEST_USER_PROFILE_KEY),
        chatHistory: localStorage.getItem(CHAT_HISTORY_KEY),
        testResults: localStorage.getItem(TEST_RESULTS_KEY),
        backupVersion: '1.3', // Incremented version for new structure
        timestamp: Date.now(),
    };
};

export const importData = (jsonString: string): void => {
    const data = JSON.parse(jsonString);

    // Validate top-level keys
    const requiredKeys = ['courses', 'folders', 'projects'];
    for (const key of requiredKeys) {
        if (data[key] === undefined) {
            throw new Error(`Import failed: Missing required key "${key}" in backup file.`);
        }
    }
    
    // Clear existing data before importing
    localStorage.removeItem(COURSES_KEY);
    localStorage.removeItem(FOLDERS_KEY);
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ARTICLES_KEY);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(TEST_RESULTS_KEY);
    localStorage.removeItem(GUEST_USER_PROFILE_KEY);

    // Import new data
    // The data is stored as a string, as it came from the backup file.
    if (data.courses) localStorage.setItem(COURSES_KEY, data.courses);
    if (data.folders) localStorage.setItem(FOLDERS_KEY, data.folders);
    if (data.projects) localStorage.setItem(PROJECTS_KEY, data.projects);
    if (data.articles) localStorage.setItem(ARTICLES_KEY, data.articles);
    if (data.chatHistory) localStorage.setItem(CHAT_HISTORY_KEY, data.chatHistory);
    if (data.testResults) localStorage.setItem(TEST_RESULTS_KEY, data.testResults);
    if (data.guestUserProfile) localStorage.setItem(GUEST_USER_PROFILE_KEY, data.guestUserProfile);
};

export const resetApplication = (): void => {
    // Keeps theme and user session, but clears all learning data.
    localStorage.removeItem(COURSES_KEY);
    localStorage.removeItem(FOLDERS_KEY);
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ARTICLES_KEY);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(TEST_RESULTS_KEY);
    localStorage.removeItem(GUEST_USER_PROFILE_KEY);
    localStorage.removeItem('learnai-last-active-course');
};
