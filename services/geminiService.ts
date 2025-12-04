
import { SSDEL_PROTOCOL } from '../constants';
import { Part, Content } from "@google/genai";

// Cache the heavy context in memory so we don't fetch it on every single message
let cachedContext: string | null = null;

const getAugmentedContext = async (): Promise<string> => {
    if (cachedContext) return cachedContext;

    try {
        const [jsonResponse, textResponse] = await Promise.all([
            fetch('/nta_2025.json'),
            fetch('/nta_2025.txt')
        ]);

        if (!jsonResponse.ok || !textResponse.ok) {
            throw new Error("Failed to load Knowledge Core files");
        }

        const nta2025JsonData = await jsonResponse.json();
        const nta2025TextData = await textResponse.text();
        
        cachedContext = `
<JSON_KNOWLEDGE_CORE>
${JSON.stringify(nta2025JsonData)}
</JSON_KNOWLEDGE_CORE>

<TEXT_KNOWLEDGE_CORE_FOR_VERIFICATION>
${nta2025TextData}
</TEXT_KNOWLEDGE_CORE_FOR_VERIFICATION>
`;
        return cachedContext;
    } catch (error) {
        console.error("Error loading knowledge core:", error);
        throw error;
    }
};

export const sendMessageStream = async (history: Content[], newParts: Part[]) => {
    const contextData = await getAugmentedContext();
    
    // Combine the protocol with the dynamic data
    const fullSystemInstruction = `${SSDEL_PROTOCOL}\n\nCONTEXT DOCUMENTS: Here is the structured JSON and unstructured Text of the "Nigeria Tax Act, 2025" (your Augmented Knowledge Core). All your analysis, reasoning, and citations must be based exclusively on this combined schema:\n\n${contextData}`;

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            history: history,
            message: newParts,
            systemInstruction: fullSystemInstruction
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} - ${errorText}`);
    }

    if (!response.body) throw new Error('No response body received');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
        async *[Symbol.asyncIterator]() {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                yield { text: chunk };
            }
        }
    };
};
