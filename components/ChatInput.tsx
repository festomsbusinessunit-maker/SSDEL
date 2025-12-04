import React, { useState, useRef } from 'react';
import Spinner from './Spinner';

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (query: string, file: File | null) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ isLoading, onSendMessage }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB.");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onSendMessage(text, file);
    setText('');
    removeFile();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-xl border border-slate-600">
      {filePreview && (
        <div className="mb-2 p-2 bg-slate-700 rounded-lg relative w-24 h-24">
          <img src={filePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
          <button
            type="button"
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
            aria-label="Remove image"
          >
            &times;
          </button>
        </div>
      )}
      <div className="flex items-center space-x-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 bg-slate-700 p-2 rounded-lg text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-40"
          placeholder="Query for strategic analysis (e.g., 'Model the impact of new tax incentives on our capex strategy')..."
          disabled={isLoading}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label htmlFor="file-upload" className={`p-2 rounded-full cursor-pointer transition ${isLoading ? 'opacity-50' : 'hover:bg-slate-700'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
        </label>
        <button
          type="submit"
          className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-indigo-900 disabled:cursor-not-allowed"
          disabled={isLoading || (!text.trim() && !file)}
          aria-label="Send message"
        >
          {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;