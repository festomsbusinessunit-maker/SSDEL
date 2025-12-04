
import React, { useState } from 'react';
import Spinner from './Spinner';

interface InputFormProps {
  isLoading: boolean;
  onSubmit: (query: string, file: File | null) => void;
}

const InputForm: React.FC<InputFormProps> = ({ isLoading, onSubmit }) => {
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        setImageFile(null);
        event.target.value = ''; // Clear the input
        return;
      }
      setError(null);
      setImageFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim() && !imageFile) {
      setError("Please enter a tax query or upload a document.");
      return;
    }
    setError(null);
    onSubmit(query, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
      {error && (
          <div className="bg-red-800 border border-red-500 p-3 rounded-lg mb-4 text-sm font-medium">
              <strong className="text-red-300">Input Error:</strong> {error}
          </div>
      )}
      <div className="mb-4">
        <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-2">
          Tax Compliance Query
        </label>
        <textarea
          id="query"
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400 resize-none"
          placeholder="e.g., What are the WHT implications of a cross-border software service invoice?"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Document (Invoice, Receipt)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          />
          {imageFile && (
            <p className="mt-2 text-xs text-green-400">Attached: {imageFile.name}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition duration-300 shadow-lg flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-900 disabled:text-indigo-400 disabled:cursor-not-allowed"
          disabled={isLoading || (!query.trim() && !imageFile)}
        >
          {isLoading ? (
            <>
              <Spinner />
              Analyzing...
            </>
          ) : 'Generate Compliance Report'}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
