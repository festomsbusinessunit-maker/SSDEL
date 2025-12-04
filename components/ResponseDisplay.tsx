
import React from 'react';
import type { GeminiResponse } from '../types';
import { renderMarkdownAsHtml } from '../utils/markdownRenderer';

interface ResponseDisplayProps {
  response: GeminiResponse;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  return (
    <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-2xl border border-indigo-500/50">
      <h2 className="text-3xl font-bold text-indigo-300 border-b border-indigo-700 pb-3 mb-4">
        SSDEL Compliance Report
      </h2>
      
      <div 
        className="text-gray-300 leading-relaxed report-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdownAsHtml(response.text) }}
      />

      {response.sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-gray-400 mb-3">
            Regulatory Grounding (NTA 2025)
          </h3>
          <ul className="space-y-2 text-sm text-gray-500">
            {response.sources.map((source, index) => (
              <li key={index}>
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-indigo-400 transition duration-150 break-words"
                >
                  [{index + 1}] {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
