import React, { useState, useRef, useEffect } from 'react';

// --- Type Definitions ---
interface IconProps {
  className?: string;
}

interface UrlFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

interface ErrorDisplayProps {
  message: string;
}

interface SummaryDisplayProps {
  summary: string;
  originalUrl: string;
}

// --- SVG Icons ---
const LinkIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);

const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z"></path>
    <path d="M5 3L6 5"></path><path d="M18 19L19 21"></path>
    <path d="M3 18L5 19"></path><path d="M19 5L21 6"></path>
  </svg>
);

// --- UI Components ---

const Header: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
        AI Article Summarizer
      </h1>
    </div>
  </header>
);

const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit}>
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          Enter article URL to summarize
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LinkIcon />
          </div>
          <input
            type="url"
            id="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="https://example.com/article"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center"
        >
          {loading ? 'Summarizing...' : 'Generate Summary'}
          {!loading && <SparklesIcon className="h-5 w-5 ml-2" />}
        </button>
      </form>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600 font-medium">Analyzing article...</p>
  </div>
);

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
    <p className="font-bold">An error occurred</p>
    <p>{message}</p>
  </div>
);

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, originalUrl }) => {
    const summaryRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = () => {
        if (summaryRef.current) {
            const range = document.createRange();
            range.selectNode(summaryRef.current);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            try {
                // Using document.execCommand for broader iframe compatibility
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            window.getSelection()?.removeAllRanges();
        }
    };
    
  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
        <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div ref={summaryRef} className="text-gray-700 leading-relaxed space-y-4">
        {summary.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
          Read original article
        </a>
      </div>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  const [summary, setSummary] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Effect to add a simple fade-in animation class
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
        document.head.removeChild(style);
    };
  }, []);

  const handleSummarize = async (url: string) => {
    setLoading(true);
    setError('');
    setSummary('');
    setCurrentUrl(url);

    const apiKey = ""; // 👈 PASTE YOUR OPENAI API KEY HERE

    if (!apiKey) {
      setError("API Key is missing. Please add your OpenAI API key to the 'apiKey' constant in the code.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = `https://api.openai.com/v1/chat/completions`;
      
      const systemPrompt = "You are an expert summarizer. Provide a concise, easy-to-read summary of the given article URL. Focus on the key points and main takeaways.";
      const userQuery = `Please summarize this article: ${url}`;
      
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
        ],
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.choices && result.choices.length > 0 && result.choices[0].message?.content) {
          const generatedText = result.choices[0].message.content.trim();
          setSummary(generatedText);
      } else {
        console.error("Unexpected API response structure:", result);
        setError("Could not extract a valid summary from the API response.");
      }

    } catch (apiError) {
        console.error("API Error:", apiError);
        if (apiError instanceof Error) {
          setError(`An error occurred: ${apiError.message}. Please check the URL or try again later.`);
        } else {
          setError("An unknown error occurred. Please try again later.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
        <UrlForm onSubmit={handleSummarize} loading={loading} />
        
        <div className="mt-8">
            {loading && <LoadingSpinner />}
            {error && <ErrorDisplay message={error} />}
            {summary && <SummaryDisplay summary={summary} originalUrl={currentUrl} />}
        </div>
      </main>
    </div>
  );
}

