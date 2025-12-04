import { GoogleGenAI, Chat, Part } from "@google/genai";
import { MODEL_NAME, SSDEL_PROTOCOL } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Asynchronously initialize the chat session after fetching the knowledge base.
const chatSessionPromise: Promise<Chat> = (async () => {
    // Fetch both the structured JSON and the unstructured text knowledge cores.
    const [jsonResponse, textResponse] = await Promise.all([
        fetch('./nta_2025.json'),
        fetch('./nta_2025.txt')
    ]);

    if (!jsonResponse.ok) {
        throw new Error(`Failed to load Knowledge Core (JSON): ${jsonResponse.statusText}`);
    }
    if (!textResponse.ok) {
        throw new Error(`Failed to load Knowledge Core (TXT): ${textResponse.statusText}`);
    }

    const nta2025JsonData = await jsonResponse.json();
    const nta2025TextData = await textResponse.text();
    
    const nta2025KnowledgeCore = `
<JSON_KNOWLEDGE_CORE>
${JSON.stringify(nta2025JsonData)}
</JSON_KNOWLEDGE_CORE>

<TEXT_KNOWLEDGE_CORE_FOR_VERIFICATION>
${nta2025TextData}
</TEXT_KNOWLEDGE_CORE_FOR_VERIFICATION>
`;

    const startChatParams = {
        model: MODEL_NAME,
        config: {
            systemInstruction: SSDEL_PROTOCOL,
        },
        history: [
            {
                role: "user",
                parts: [{ text: `CONTEXT DOCUMENTS: Here is the structured JSON and unstructured Text of the "Nigeria Tax Act, 2025" (your Augmented Knowledge Core). All your analysis, reasoning, and citations must be based exclusively on this combined schema:\n\n${nta2025KnowledgeCore}` }]
            },
            {
                role: "model",
                parts: [{ text: "System Initialized. I am the SSDEL-G Tax AI Agent. My analysis is grounded in the provided NTA 2025 Augmented Knowledge Core. Please state your query for a Strategic Intelligence Briefing." }]
            }
        ]
    };
    return ai.chats.create(startChatParams);
})();

// Add an error handler for the promise to aid in debugging if the fetch fails.
chatSessionPromise.catch(err => {
    console.error("Failed to initialize chat session:", err);
});

export const sendMessageStream = async (parts: Part[]) => {
    // Wait for the asynchronous initialization to complete.
    const chatSession = await chatSessionPromise;
    const result = await chatSession.sendMessageStream({ message: parts });
    return result;
};