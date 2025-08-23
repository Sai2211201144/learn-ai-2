
import { GoogleGenAI, Type } from "@google/genai";
import { InterviewQuestion, ChatMessage } from '../../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const callGemini = async (contents: any, schema?: object) => {
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

const interviewQuestionSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ['question', 'answer'] } };

export const generateInterviewQuestions = (topic: string, difficulty: string, count: number, existingQuestions: string[]): Promise<InterviewQuestion[]> => {
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
    const prompt = `A student is preparing for an interview. The question is: "${question}". The current answer is: "${answer}". Elaborate on this answer. Explain it in more depth but using simple terminologies. Provide a clear example or code snippet if applicable. Return only the elaborated answer text.`;
    return callGemini(prompt);
};

// --- LIVE INTERVIEW ---

export const startLiveInterview = (topic: string): Promise<string> => {
    const prompt = `
You are "Alex", an expert, friendly, and collaborative interviewer from a top tech company like Google.
Your goal is to conduct a problem-solving interview session, not a simple Q&A. You need to guide the candidate through a technical problem.

**Your Persona:**
-   **Collaborative:** You work *with* the candidate. Use phrases like "That's an interesting approach, how would you handle...", "Let's explore that idea further.", "What are the trade-offs there?".
-   **Guiding, not Giving:** Never give away the answer. Instead, ask Socratic questions and provide small hints to unblock the candidate if they are stuck.
-   **Problem-focused:** The entire conversation should revolve around solving one or two related problems.

**Your Task:**
Start the interview for the topic: "${topic}".
1.  Briefly introduce yourself as Alex.
2.  State the problem clearly. The problem should be open-ended and require some thought, typical of a mid-level software engineering interview.
3.  Ask an open-ended follow-up question to get the candidate started, like "How would you approach this problem?" or "What are your initial thoughts?".

**DO NOT** ask for their name or any personal details. Jump straight into the interview.
Return only your opening statement.
`;
    return callGemini(prompt);
};

export const generateLiveInterviewResponse = (topic: string, history: ChatMessage[]): Promise<string> => {
    const systemInstruction = `
You are "Alex", an expert, friendly, and collaborative interviewer from a top tech company like Google.
Your goal is to continue a problem-solving interview session based on the provided conversation history.

**Your Persona & Goal:**
-   **Collaborative Problem-Solving:** You are working *with* the candidate to solve a technical problem related to "${topic}".
-   **Analyze the History:** Carefully read the entire conversation history to understand the candidate's current approach, their thought process, and where they might be stuck.
-   **Guide with Questions & Hints:** Your response should guide them forward.
    -   If they are on the right track, affirm their thinking and ask them to elaborate or consider edge cases. ("Good, that seems plausible. What happens if the input is empty?")
    -   If they are stuck or going down a wrong path, gently steer them back with a question or a small hint. ("Have you considered what the time complexity of that would be?", "What data structure might be efficient for lookups here?").
-   **Maintain Context:** Your response MUST be a direct, logical continuation of the last message in the history.
-   **Be Concise:** Keep your responses focused and not overly long.

**Your Task:**
Based on the provided chat history, generate the next response in the interview.
`;
    const contents = history.map(({ role, content }) => ({ role, parts: [{ text: content }] }));
    return ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction, temperature: 0.7 } }).then(res => res.text);
};
