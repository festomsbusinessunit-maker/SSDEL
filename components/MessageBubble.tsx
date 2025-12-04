import React from 'react';
import type { Message } from '../types';
import { renderMarkdownAsHtml } from '../utils/markdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const bubbleClasses = isUser 
    ? 'bg-indigo-600 text-white self-end'
    : 'bg-slate-700 text-gray-300 self-start';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  // Don't render empty model messages (placeholders) during streaming
  if (message.role === 'model' && !message.text.trim()) {
      return null;
  }

  const handlePrint = () => {
    const printContent = document.getElementById(`message-content-${message.id}`);
    if (printContent) {
      printContent.classList.add('printable');
      window.print();
      printContent.classList.remove('printable');
    }
  };

  return (
    <div className={`flex ${containerClasses}`}>
      <div className={`max-w-xl lg:max-w-3xl rounded-2xl ${bubbleClasses} relative group flex flex-col`}>
        {message.image && (
          <img src={message.image} alt="User upload" className="rounded-t-lg mb-2 max-h-60" />
        )}
        <div
          id={`message-content-${message.id}`}
          className="leading-relaxed p-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdownAsHtml(message.text) }}
        />
         {!isUser && message.text.trim() && (
          <div className="flex justify-between items-center px-4 pb-2">
            <span className="text-xs text-slate-400">
              {message.wordCount && message.wordCount > 0 ? `${message.wordCount} words` : ''}
            </span>
            <button
              onClick={handlePrint}
              className="p-1.5 bg-slate-600 rounded-full text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Share or Print Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                <path fillRule="evenodd" d="M4 3a2 2 0 100 4 2 2 0 000-4zm0 10a2 2 0 100 4 2 2 0 000-4zm12-5a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;