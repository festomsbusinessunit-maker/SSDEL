import React, { useState, useCallback } from 'react';
import type { Message } from './types';
import { fileToBase64, getMimeType } from './utils/fileUtils';
import { sendMessageStream } from './services/geminiService';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { Part } from '@google/genai';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init-message', role: 'model', text: "System Initialized. I am the SSDEL-G Tax AI Agent. My analysis is grounded in the provided NTA 2025 Augmented Knowledge Core. Please state your query for a Strategic Intelligence Briefing." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (query: string, file: File | null) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessageId = `user-${Date.now()}`;
    const userParts: Part[] = [{ text: query }];
    let imageUrl: string | undefined = undefined;

    try {
      if (file) {
        const base64 = await fileToBase64(file);
        const mimeType = getMimeType(file);
        userParts.push({ inlineData: { data: base64, mimeType } });
        imageUrl = `data:${mimeType};base64,${base64}`;
      }

      setMessages(prev => [...prev, { id: userMessageId, role: 'user', text: query, image: imageUrl }]);

      const modelMessageId = `model-${Date.now()}`;
      // Add a placeholder for the model's response
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '', wordCount: 0 }]);
      
      const stream = await sendMessageStream(userParts);
      let accumulatedText = '';

      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        const currentWordCount = accumulatedText.trim().split(/\s+/).filter(Boolean).length;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: accumulatedText, wordCount: currentWordCount } : msg
          )
        );
      }
    } catch (e) {
      console.error("SSDEL-TCA Request Error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`A critical error occurred. Details: ${errorMessage}`);
      // Remove the placeholder and show error
      setMessages(prev => prev.slice(0, -1)); 
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans flex flex-col h-screen">
      <header className="py-4 px-4 text-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-indigo-400">
          SSDEL-G Tax AI Agent
        </h1>
        <p className="text-xs text-indigo-200 mt-1">
          Tax Agent Developed by <strong className="font-semibold">SSDEL</strong> and Powered by <strong className="font-semibold">GEMINI LLM & SSDEL</strong>.
        </p>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl mx-auto">
          Not for NTA 2025 Advance Tax review , contact SSDEL with your complex NTA 2025 , EDI Certification, Withhold Tax Credit Strategic Management, Tax review and interpretation.
        </p>
        <p className="text-xs text-slate-300 mt-1">
          Contact: Phone: +1 (281) 310-7181 | Web: <a href="http://www.deelgigasupportservices.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">www.deelgigasupportservices.com</a>
        </p>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
        {error && (
          <div className="bg-red-800 border border-red-500 p-3 m-4 rounded-lg text-sm font-medium">
            <strong className="text-red-300">System Error:</strong> {error}
          </div>
        )}
        
        <MessageList messages={messages} isLoading={isLoading} />

        <div className="p-4 border-t border-slate-700">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
      <footer className="py-3 px-4 text-center border-t border-slate-700 bg-slate-900">
        <p className="text-xs text-slate-400">
          Disclaimer: The submissions generated here are for information and Education purposes which require you request a professional advice and should you need to print a technical report on your queries..
        </p>
      </footer>
    </div>
  );
};

export default App;