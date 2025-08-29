import { GoogleGenAI, Type } from "@google/genai";
import type { Course, Flashcard, Subtopic, KnowledgeLevel, ChatMessage, QuizData, TestResult, Recommendation, Topic, PracticeSession, Project, ProjectStep, LearningGoal, LearningStyle, CourseSource, BlogPostAndIdeas, ContentBlock, InteractiveModelData, HyperparameterData, TriageChallengeData, InterviewQuestion } from '../types';

// Only initialize if we have an API key and we're in a server environment
let ai: GoogleGenAI | null = null;

try {
    const apiKey = AIzaSyBhw2DcMTkN2d0vRDaodOeXsCERL-0gS10||(import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    }
} catch (error) {
    console.warn('Google GenAI not initialized - API key not available');
}


// --- SCHEMAS ---
const quizSchema = {
    type: Type.OBJECT,
    properties: {
        q: { type: Type.STRING, description: "The quiz question." },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2, maxItems: 4, },
        answer: { type: Type.INTEGER, description: "The 0-based index of the correct answer." },
        explanation: { type: Type.STRING, description: "A brief, clear explanation." }
    },
    required: ['q', 'options', 'answer', 'explanation']
};

const interactiveModelSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        layers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['input', 'hidden', 'output'] },
                    neurons: { type: Type.INTEGER },
                    activation: { type: Type.STRING, enum: ['relu', 'sigmoid', 'tanh'] }
                }
            }
        },
        sampleInput: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        expectedOutput: { type: Type.ARRAY, items: { type: Type.NUMBER } }
    },
    required: ['title', 'description', 'layers', 'sampleInput', 'expectedOutput']
};

const hyperparameterSimulatorSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        parameters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                description: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        },
        outcomes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    combination: { type: Type.STRING },
                    result: {
                        type: Type.OBJECT,
                        properties: {
                            trainingLoss: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            validationLoss: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            description: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    },
    required: ['title', 'description', 'parameters', 'outcomes']
};

const triageChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        scenario: { type: Type.STRING },
        evidence: { type: Type.STRING, description: "A valid Mermaid.js graph syntax string." },
        options: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            }
        },
        correctOptionIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
    },
    required: ['scenario', 'evidence', 'options', 'correctOptionIndex', 'explanation']
};


const contentBlockSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['text', 'code', 'quiz', 'diagram', 'interactiveModel', 'hyperparameterSimulator', 'triageChallenge'] },
        text: { type: Type.STRING, description: "For 'text' blocks, the content in Markdown format." },
        code: { type: Type.STRING, description: "For 'code' blocks, the code snippet." },
        quiz: quizSchema,
        diagram: { type: Type.STRING, description: "A valid Mermaid.js graph syntax string." },
        interactiveModel: interactiveModelSchema,
        hyperparameterSimulator: hyperparameterSimulatorSchema,
        triageChallenge: triageChallengeSchema,
    },
    required: ['type']
};

const articleDataSchema = {
    type: Type.OBJECT,
    properties: {
        objective: { type: Type.STRING },
        contentBlocks: { type: Type.ARRAY, items: contentBlockSchema, minItems: 2, maxItems: 5 }
    },
    required: ['objective', 'contentBlocks']
};

const subtopicSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['article', 'quiz', 'project'] },
        title: { type: Type.STRING },
        data: { 
            type: Type.OBJECT,
            properties: {
                // Properties for 'article'
                objective: { type: Type.STRING },
                contentBlocks: { type: Type.ARRAY, items: contentBlockSchema },
                // Properties for 'quiz'
                description: { type: Type.STRING },
                questions: { type: Type.ARRAY, items: quizSchema },
                // Properties for 'project'
                codeStub: { type: Type.STRING },
                challenge: { type: Type.STRING }
            }
        }
    },
    required: ['type', 'title', 'data']
};

const courseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING, description: "A one-sentence tagline or subtitle for the course." },
        about: { type: Type.STRING, description: "A detailed, engaging paragraph describing the learning path." },
        category: { type: Type.STRING, description: "A high-level category, e.g., 'Web Development', 'Data Science', 'AI/ML'." },
        technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
        learningOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        overview: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING, description: "Estimated time to complete, e.g., '1 week', '15 hours'." },
                totalTopics: { type: Type.INTEGER },
                totalSubtopics: { type: Type.INTEGER },
                keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, maxItems: 6 }
            },
            required: ['duration', 'totalTopics', 'totalSubtopics', 'keyFeatures']
        },
        topics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    subtopics: { type: Type.ARRAY, items: subtopicSchema }
                },
                required: ['title', 'subtopics']
            }
        }
    },
    required: ['title', 'description', 'about', 'category', 'technologies', 'learningOutcomes', 'skills', 'overview', 'topics']
};

const blogPostSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, SEO-friendly title for the blog post." },
        subtitle: { type: Type.STRING, description: "A brief, one-sentence subtitle that summarizes the article." },
        blogPost: { type: Type.STRING, description: "The full blog post content in Markdown format, starting from the first section heading (##)." },
        relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 related, but distinct, topic ideas for a subsequent blog post."}
    },
    required: ['title', 'subtitle', 'blogPost', 'relatedTopics']
};

const articleIdeasSchema = { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 article topic ideas." };

const articleTopicsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    },
    description: "A list of 5-10 distinct and focused article topics based on the provided syllabus."
};

const flashcardSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
        },
        required: ['question', 'answer']
    }
};

const practiceConceptSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        codeExample: { type: Type.STRING }
    },
    required: ['title', 'description', 'codeExample']
};

const practiceSessionSchema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING },
        concepts: { type: Type.ARRAY, items: practiceConceptSchema },
        quiz: { type: Type.ARRAY, items: quizSchema }
    },
    required: ['topic', 'concepts', 'quiz']
};

const projectStepSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        codeStub: { type: Type.STRING },
        challenge: { type: Type.STRING }
    },
    required: ['title', 'description', 'codeStub', 'challenge']
};

const projectSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        steps: { type: Type.ARRAY, items: projectStepSchema }
    },
    required: ['title', 'description', 'steps']
};

const newSubtopicsSchema = {
    type: Type.ARRAY,
    items: subtopicSchema
};

const learningPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planTitle: { type: Type.STRING, description: "A concise, engaging title for the entire learning plan." },
        optimalDuration: { type: Type.INTEGER, description: "The AI-determined optimal number of days to complete this plan."},
        dailyBreakdown: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING, description: "The specific, focused sub-topic for this day." },
                    objective: { type: Type.STRING, description: "A one-sentence learning objective for the day." }
                },
                required: ['day', 'title', 'objective']
            }
        }
    },
    required: ['planTitle', 'optimalDuration', 'dailyBreakdown']
};

export interface LearningPlanBreakdown {
    planTitle: string;
    optimalDuration: number;
    dailyBreakdown: {
        day: number;
        title: string;
        objective: string;
    }[];
}


// --- API CALLER ---
const callGemini = async (contents: any, schema?: object) => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    try {
        const config = schema ? { responseMimeType: "application/json", responseSchema: schema } : {};
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents, config });
        const text = response.text.trim();
        if (schema) {
            const cleanedJsonString = text.replace(/^```json\s*|```$/g, '');
            return JSON.parse(cleanedJsonString);
        }
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof SyntaxError) throw new Error("Failed to parse the AI's response. The format was invalid.");
        if (error instanceof Error && error.message.includes('INVALID_ARGUMENT')) throw new Error("Request contains an invalid argument.");
        throw new Error("The AI model failed to generate content.");
    }
}

// --- EXPORTED FUNCTIONS ---

const getSourcePrompt = (source?: CourseSource) => {
    if (!source || !source.content) return '';
    switch(source.type) {
        case 'syllabus': return `**COURSE SOURCE:** Base the course on the following syllabus: \n\`\`\`\n${source.content}\n\`\`\``;
        case 'url': return `**COURSE SOURCE:** Base the course on the content from this URL: ${source.content}`;
        case 'pdf': return `**COURSE SOURCE:** Base the course on the following text extracted from a document: \n\`\`\`\n${source.content}\n\`\`\``;
        default: return '';
    }
};

export const generateCourse = async (
    topic: string, 
    knowledgeLevel: KnowledgeLevel, 
    goal: LearningGoal, 
    style: LearningStyle,
    source: CourseSource | undefined,
    specificTech: string,
    includeTheory: boolean
): Promise<Omit<Course, 'id' | 'progress'>> => {
    const prompt = `
You are a world-class AI Technical Writer and Curriculum Designer. Your task is to generate a comprehensive, personalized learning path structured as a JSON object. This path must contain rich, self-contained educational content for each subtopic.

**USER PROFILE & GOALS:**
*   **Knowledge Level:** ${knowledgeLevel}
*   **Primary Goal:** ${goal}
*   **Learning Style:** ${style}

${getSourcePrompt(source)}

**LEARNING PATH STRUCTURE (CRITICAL):**
Generate a complete JSON object for a learning path about "${topic}". The path must contain:
1.  **Top-Level Information:** title, description (tagline), about (detailed paragraph), category, technologies, learningOutcomes (bullet points), skills (tags), and an overview object with stats.
2.  **Curriculum (topics & subtopics):**
    *   The path must have 3-5 high-level **Topics**.
    *   Each Topic must have 3-5 **Subtopics**. A Subtopic is a specific learning unit.
    *   Each Subtopic must be of type 'article'.
3.  **Content Generation (VERY IMPORTANT):**
    *   For each 'article' subtopic, you MUST generate its content. The content is an array of 2-5 **Content Blocks**.
    *   A Content Block can be of type 'text', 'code', 'diagram', 'quiz'.
    *   For an '${style}' learning style, you should also incorporate advanced blocks like 'interactiveModel', 'hyperparameterSimulator', and 'triageChallenge' where appropriate to create a hands-on experience.
    *   'text' blocks should contain clear explanations in well-written Markdown.
    *   'code' blocks should contain relevant, well-commented code examples.
    *   'diagram' blocks must contain valid Mermaid.js syntax.
    *   'quiz' blocks should be a single, relevant multiple-choice question.

**REQUIREMENTS (STRICT):**
*   Adhere strictly to the provided JSON schema. DO NOT add any extra fields.
*   The content must be tailored to the user's knowledge level and goals.
*   Calculate and fill in the 'overview' object with accurate totals (totalTopics, totalSubtopics) based on the curriculum you generate.
*   Ensure all generated text (descriptions, outcomes, lesson content, etc.) is high-quality, well-written, and engaging.
    `;
    const courseData = await callGemini(prompt, courseSchema);
    if (!courseData.title || !courseData.topics || courseData.topics.length === 0) {
        throw new Error("Received malformed course data from API.");
    }
    
    // Add unique IDs to the generated content
    const courseWithIds = {
        ...courseData,
        knowledgeLevel,
        topics: courseData.topics.map((topic: Topic, topicIndex: number) => ({
            ...topic,
            subtopics: topic.subtopics.map((subtopic: Subtopic, subtopicIndex: number) => ({
                ...subtopic,
                id: `subtopic_${topicIndex}-${subtopicIndex}_${Date.now()}`,
                data: {
                    ...subtopic.data,
                    contentBlocks: (subtopic.data as any).contentBlocks?.map((block: ContentBlock, blockIndex: number) => ({
                        ...block,
                        id: `block_${topicIndex}-${subtopicIndex}-${blockIndex}_${Date.now()}`
                    })) || []
                }
            }))
        }))
    };

    return courseWithIds;
};

export const generateLearningPlan = (topic: string, duration?: number): Promise<LearningPlanBreakdown> => {
    const durationPrompt = duration
        ? `Create a plan that spans exactly ${duration} days.`
        : `First, determine the optimal number of days for a beginner to learn this topic comprehensively and use that duration for the plan.`;

    const prompt = `
You are an expert curriculum designer and project manager. Your task is to break down a large learning topic into a structured, day-by-day learning plan.

**Topic:** "${topic}"

**Instructions:**
1.  ${durationPrompt}
2.  The plan should be logical, progressive, and cover the topic from fundamentals to more advanced concepts.
3.  For each day, define a specific, focused sub-topic title and a clear, one-sentence learning objective.
4.  Generate a concise, engaging title for the entire learning plan.

**Output Format:**
Return a single JSON object that strictly adheres to the provided schema. The 'dailyBreakdown' array must contain an entry for each day of the plan.
`;
    return callGemini(prompt, learningPlanSchema);
}


export const generateBlogPostAndIdeas = (topic: string): Promise<BlogPostAndIdeas> => {
    const prompt = `
You are an expert technical writer and content strategist for a high-quality tech blog.
Your task is to generate a complete, well-structured blog post on the given topic, and also provide ideas for the next article.

**Topic:** "${topic}"

**Requirements:**
1.  **Title:** Create a catchy, SEO-friendly title for the blog post.
2.  **Subtitle:** Write a brief, one-sentence subtitle that summarizes the article's value.
3.  **Blog Post Content:** The content MUST be in a single Markdown string.
    *   **Structure:** Use Markdown headings (## for sections, ### for sub-sections), lists, bold text, and code blocks to create a clear and readable article.
    *   **Content:** The post should be comprehensive, insightful, and practical for the reader. It should include clear explanations and relevant code examples where applicable.
    *   **Start:** The content should begin with the first section heading (e.g., \`## Introduction\`), not with the main title.
4.  **Related Topic Ideas:** Generate a list of exactly 3 to 5 related, but distinct, topic ideas that would be a logical next step for someone who just read the article.

Return the entire response as a single JSON object adhering to the provided schema.
`;
    return callGemini(prompt, blogPostSchema);
};

export const generateArticleIdeas = (courseTitle: string): Promise<string[]> => {
    const prompt = `
Based on the course title "${courseTitle}", generate a list of 3-5 distinct and engaging blog post ideas. These ideas should be suitable for someone who has just completed the course and wants to explore related concepts or applications. Return only a JSON array of strings.
`;
    return callGemini(prompt, articleIdeasSchema);
};

export const generateArticleTopicsFromSyllabus = (syllabus: string): Promise<string[]> => {
    const prompt = `
You are an expert content strategist. Your task is to break down a broad topic or syllabus into a series of specific, engaging blog post titles.

**Input Syllabus/Topic:**
\`\`\`
${syllabus}
\`\`\`

**Instructions:**
1.  Analyze the input to understand the key concepts and structure.
2.  Generate a list of 5 to 10 distinct and well-defined article topics that cover the main points of the input.
3.  Each topic should be a concise and compelling title for a blog post.

Return the list as a JSON array of strings.
`;
    return callGemini(prompt, articleTopicsSchema);
};

export const generateStory = (topic: string): Promise<string> => {
    const prompt = `Create a short, engaging story for a learner about the topic "${topic}". The story should be in the style of a short script or play, with character names in bold followed by their dialogue. Use mannerisms in parentheses. This helps to introduce the concept in a fun, memorable way.`;
    return callGemini(prompt);
};

export const generateAnalogy = (topic: string): Promise<string> => {
    const prompt = `Generate a simple, clear, and relatable analogy for the technical concept: "${topic}". The analogy should help a beginner understand the core idea. Return only the analogy itself.`;
    return callGemini(prompt);
};

export const generateFlashcards = (topic: string): Promise<Flashcard[]> => {
    const prompt = `Generate a set of 5-10 concise flashcards for the topic "${topic}". Each flashcard should have a clear question and a direct answer.`;
    return callGemini(prompt, flashcardSchema);
};

export const generatePracticeSession = (topic: string): Promise<PracticeSession> => {
    const prompt = `
Create a comprehensive practice session for the topic: "${topic}".
The session should include:
1.  2-3 **In-Depth Concepts**: For each concept, provide a title, a detailed but easy-to-understand description, and a relevant code example in an appropriate language.
2.  A 3-5 question **Quiz**: Each quiz question should be multiple choice with 4 options and include a clear explanation for the correct answer.

Return the entire session as a single JSON object adhering to the provided schema.
`;
    return callGemini(prompt, practiceSessionSchema);
};

export const generateProject = async (courseTitle: string, subtopicTitle: string, subtopicObjective: string): Promise<Omit<Project, 'id' | 'progress' | 'user'>> => {
    const prompt = `
You are a senior software engineer creating a guided project for a learning platform.
Based on the following learning context, generate a complete guided project.

**Course:** ${courseTitle}
**Subtopic:** ${subtopicTitle}
**Objective:** ${subtopicObjective}

The project needs to be hands-on and directly related to the lesson's objective.
It should include:
1.  A clear **title** and a concise **description**.
2.  A series of 3-5 distinct **steps**.
3.  For each step, provide a **title**, a detailed **description** of what to do, a starting **code stub**, and a specific **challenge** for the learner to solve.

Return the entire project as a single JSON object adhering to the provided schema.
`;
    const projectData = await callGemini(prompt, projectSchema);
    return {
        ...projectData,
        steps: projectData.steps.map((step: any, index: number) => ({...step, id: `step_${index}_${Date.now()}`}))
    };
};

export const generateFollowUpSubtopics = async (courseTitle: string, topicTitle: string, subtopicTitle: string, prompt: string): Promise<Subtopic[]> => {
    const fullPrompt = `
You are an expert curriculum designer. A user is currently studying a subtopic and wants to expand on it with more detail.
**Course:** ${courseTitle}
**Topic:** ${topicTitle}
**Current Subtopic:** ${subtopicTitle}
**User Request:** "${prompt}"

Based on this, generate 2-3 new, follow-up subtopics that logically extend from the current one.
Each new subtopic must be of type 'article' and contain:
1. A clear 'title'.
2. A learning 'objective'.
3. An array of 'contentBlocks', which can be of type 'text' or 'code'. Keep content concise and focused.

Return an array of these new subtopic objects, adhering to the provided JSON schema.
`;
    const newSubtopicsData = await callGemini(fullPrompt, newSubtopicsSchema);

    // Add unique IDs to the generated content
    return newSubtopicsData.map((subtopic: Subtopic, subtopicIndex: number) => ({
        ...subtopic,
        id: `subtopic_expanded_${subtopicIndex}_${Date.now()}`,
        data: {
            ...subtopic.data,
            contentBlocks: (subtopic.data as any).contentBlocks?.map((block: ContentBlock, blockIndex: number) => ({
                ...block,
                id: `block_expanded_${subtopicIndex}-${blockIndex}_${Date.now()}`
            })) || []
        }
    }));
}


// --- NEWLY ADDED FUNCTIONS ---
export const generateSocraticQuiz = (content: string): Promise<QuizData[]> => {
    const prompt = `Based on the following content, generate a short, 3-question multiple-choice quiz. The questions should test understanding of the key concepts. For each question, provide a Socratic-style explanation that guides the learner to the correct answer if they get it wrong, rather than just giving the answer.

Content:
---
${content}
---
`;
    return callGemini(prompt, { type: Type.ARRAY, items: quizSchema });
};

export type Persona = 'a curious 5-year-old' | 'a technical interviewer' | 'using a real-world analogy';
export const explainTextWithPersona = (text: string, persona: Persona): Promise<string> => {
    const prompt = `Please re-explain the following text as if you are explaining it to ${persona}. Keep the explanation concise and clear.

Text to explain:
---
"${text}"
---
`;
    return callGemini(prompt);
};


export const generateChatResponse = (history: ChatMessage[], context?: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const systemInstruction = `You are a helpful and knowledgeable AI assistant for a learning platform. ${context || ''}`;
    const contents = history.map(({ role, content }) => ({ role, parts: [{ text: content }] }));
    return ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction } }).then(res => res.text);
};

export const generateCodeSnippet = (prompt: string, language: string): Promise<string> => {
    const fullPrompt = `Generate a code snippet in ${language} for the following description. Return only the raw code, without any markdown formatting or explanation.
Prompt: "${prompt}"`;
    return callGemini(fullPrompt);
};

export const translateCodeSnippet = (code: string, targetLanguage: string): Promise<string> => {
    const prompt = `Translate the following code snippet to ${targetLanguage}. Return only the raw translated code, without any markdown formatting or explanation.
Code:\n\`\`\`\n${code}\n\`\`\``;
    return callGemini(prompt);
};

export const explainCodeSnippet = (selectedCode: string, fullContextCode: string, mode: 'explain' | 'comment' | 'refactor'): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    let promptAction = '';
    switch (mode) {
        case 'comment':
            promptAction = 'Add detailed, explanatory comments to the following selected code snippet. Return only the commented code block, without any other text or markdown formatting.';
            break;
        case 'refactor':
            promptAction = 'Suggest a refactoring for the following code snippet to improve its clarity, performance, or adherence to best practices. Explain your reasoning concisely after the code block.';
            break;
        case 'explain':
        default:
            promptAction = 'Provide a concise, clear explanation of what the selected snippet does.';
            break;
    }

    const prompt = `${promptAction}
Selected snippet:
\`\`\`
${selectedCode}
\`\`\`
Full code context:
\`\`\`
${fullContextCode}
\`\`\`
`;
    return callGemini(prompt);
};

export const fixMermaidSyntax = (mermaidSyntax: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `The following Mermaid diagram syntax is broken. Please fix it and return only the corrected, valid Mermaid syntax. Do not include any explanation or markdown formatting.
Broken syntax:\n\`\`\`mermaid\n${mermaidSyntax}\n\`\`\``;
    return callGemini(prompt);
};

const quizArraySchema = { type: Type.ARRAY, items: quizSchema };
export const generateAssessmentQuiz = (topic: string, difficulty: KnowledgeLevel, count: number): Promise<QuizData[]> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `Generate a challenging assessment quiz with ${count} questions for a user with "${difficulty}" knowledge of "${topic}". Each question must have 4 options and a clear explanation for the correct answer.`;
    return callGemini(prompt, quizArraySchema);
};

const recommendationsSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['topic', 'reason'] } };
export const generateRecommendations = (topic: string, results: TestResult[]): Promise<Recommendation[]> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `Based on a user's test results for "${topic}", generate 3 specific, actionable recommendations for sub-topics they should study next. For each recommendation, provide a brief reason based on their performance.
Test History:
${results.map(r => `- Difficulty: ${r.difficulty}, Score: ${r.score * 100}%`).join('\n')}
Focus on areas suggested by lower scores on harder difficulties.`;
    return callGemini(prompt, recommendationsSchema);
};

const relatedTopicsSchema = recommendationsSchema;
export const generateRelatedTopics = (courseTitle: string): Promise<Recommendation[]> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `
A user has just completed a course on "${courseTitle}".
Based on this, generate 3 logical and relevant recommendations for the next course or topic they should learn.
For each recommendation, provide a 'topic' (the name of the next course) and a 'reason' (a one-sentence explanation of why it's a good next step).
`;
    return callGemini(prompt, relatedTopicsSchema);
};

export const explainSimply = (text: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    return callGemini(`Explain the following concept in simple terms, as if for a beginner:\n"${text}"`);
};
export const deeperDive = (text: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    return callGemini(`Provide a deeper, more technical explanation of the following concept:\n"${text}"`);
};
export const generateHinglishExplanation = (text: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    return callGemini(`Explain the following concept in Hinglish (a mix of Hindi and English):\n"${text}"`);
};

export const startLiveInterview = (topic: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `You are an expert, friendly interviewer. Start a mock technical interview on the topic of "${topic}". Introduce yourself and present the first open-ended problem.`;
    return callGemini(prompt);
};

export const generateLiveInterviewResponse = (topic: string, history: ChatMessage[]): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const systemInstruction = `You are a friendly interviewer conducting a mock technical interview on "${topic}". Continue the conversation based on the history. Guide the user, but don't give away answers.`;
    const contents = history.map(({ role, content }) => ({ role, parts: [{ text: content }] }));
    return ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction } }).then(res => res.text);
};

export const generateQuickPracticeQuiz = (topic: string, difficulty: KnowledgeLevel, count: number): Promise<QuizData[]> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `Generate a quick practice quiz with ${count} questions for a user with "${difficulty}" knowledge of "${topic}". Include explanations.`;
    return callGemini(prompt, quizArraySchema);
};

export const generateCodeExplanation = (input: { type: 'link' | 'text' | 'image'; content: string | { data: string, mimeType: string } }): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    let contents: any;
    if (input.type === 'image' && typeof input.content === 'object') {
        const imagePart = { inlineData: { mimeType: input.content.mimeType, data: input.content.data } };
        contents = { parts: [imagePart, { text: "Explain the coding problem in this image. Provide a step-by-step breakdown, identify the core concepts, and suggest an optimal approach. Format the entire response in markdown, with '###' for section titles." }] };
    } else {
        const prompt = `Explain the coding problem from the following ${input.type}. Provide a step-by-step breakdown, identify the core concepts, and suggest an optimal approach. Format the entire response in markdown, with '###' for section titles.\n\n${input.content}`;
        contents = prompt;
    }
    return callGemini(contents);
};

export const generateDailyQuest = async (): Promise<{ title: string; description: string; xp: number; }> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `
You are a motivational learning coach for a gamified education platform.
Generate a single, simple, and achievable "Daily Quest" for a user.
The quest should encourage a small amount of learning activity.
The XP reward should be between 150 and 300.

Examples:
- Complete 2 new lessons.
- Start learning a new topic.
- Spend 15 minutes practicing a concept.
- Take a skill assessment quiz.

Return the quest as a JSON object with the keys "title", "description", and "xp".
`;
    const questSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            xp: { type: Type.INTEGER }
        },
        required: ['title', 'description', 'xp']
    };
    return callGemini(prompt, questSchema);
};

export const defineTerm = (term: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `Provide a concise, clear, and easy-to-understand definition for the following technical term. Return only the definition text.
Term: "${term}"`;
    return callGemini(prompt);
};

// --- LearnAI 2.0 Features ---

export const generateUnderstandingCheck = (lessonContent: string): Promise<QuizData[]> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `Based *only* on the key concepts from the following lesson content, generate a very short, 2-question multiple-choice quiz to check for understanding. The questions must be direct and simple. Provide a clear explanation for each correct answer.

Lesson Content:
---
${lessonContent}
---
`;
    return callGemini(prompt, { type: Type.ARRAY, items: quizSchema, maxItems: 2, minItems: 2 });
};

export const generateRemedialSubtopic = (originalSubtopic: Subtopic): Promise<Subtopic> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `A student is struggling with the subtopic "${originalSubtopic.title}". Your task is to generate a new, simplified, remedial 'article' subtopic to help them understand the core concept.

**Original Subtopic Objective:** ${(originalSubtopic.data as any).objective}

**Instructions:**
1.  **Simplify Title:** Create a new title that is more approachable, like "Understanding [Concept]: A Simpler Look".
2.  **Simplify Objective:** Write a new, simpler objective.
3.  **Create Content Blocks:**
    *   Generate 2-3 content blocks.
    *   The first block should be a 'text' block using a simple analogy or a very basic, step-by-step explanation.
    *   The second block should be a 'code' block with a minimal, well-commented example.
    *   Avoid jargon where possible.

Return a single JSON object for the new subtopic, adhering to the provided schema.
`;
    // We only need the schema for a single subtopic, not an array
    return callGemini(prompt, subtopicSchema);
};

export const reviewProjectCode = (stepInstructions: string, userCode: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `
You are an expert, friendly AI Pair Programmer. Your role is to provide constructive feedback on a student's code for a project step.

**BEHAVIOR:**
- Be encouraging and positive. Start with what they did well.
- Be a guide, not a solution provider. Point out potential issues or areas for improvement, and ask guiding questions.
- Keep feedback concise and focused on the user's code.

**Project Step Instructions:**
---
${stepInstructions}
---

**Student's Code:**
\`\`\`
${userCode}
\`\`\`

**Your Task:**
Review the student's code based on the instructions. Provide a short, helpful code review in Markdown format.
- If the code is good, praise it and perhaps suggest one minor improvement or edge case to consider.
- If there are errors, gently point them out and ask a question to help them find the solution (e.g., "I see you're using a 'for' loop here. Have you considered what might happen if the input array is empty?").
- Return only your feedback text.
`;
    return callGemini(prompt);
};


const interviewQuestionSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ['question', 'answer'] } };

export const generateInterviewQuestions = (topic: string, difficulty: KnowledgeLevel, count: number, existingQuestions: string[]): Promise<InterviewQuestion[]> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `
Act as a senior technical interviewer preparing for a session.
Topic: "${topic}"
Difficulty: "${difficulty}"
Number of questions to generate: ${count}

Your task is to generate a new, unique set of interview questions. For each question, provide a concise but thorough answer, as if explaining it to a candidate.

**CRITICAL INSTRUCTION:** Do NOT repeat or create questions that are conceptually similar to the ones in the following list of already-asked questions.

Already asked questions to avoid:
${existingQuestions.length > 0 ? existingQuestions.map(q => `- ${q}`).join('\n') : "None"}

Generate a completely fresh set of ${count} questions.
`;
    return callGemini(prompt, interviewQuestionSchema);
};

export const elaborateOnAnswer = (question: string, answer: string): Promise<string> => {
    if (!ai) {
        throw new Error("Google GenAI model not initialized. API key not available.");
    }
    const prompt = `A student is preparing for an interview. The question is: "${question}". The current answer is: "${answer}". Elaborate on this answer. Explain it in more depth but using simple terminologies. Provide a clear example or code snippet if applicable. Return only the elaborated answer text.`;
    return callGemini(prompt);
};
