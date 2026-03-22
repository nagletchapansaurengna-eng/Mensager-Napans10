import React, { useState, useEffect } from 'react';
import { Key, Lock, ExternalLink } from 'lucide-react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const checkKey = async () => {
    try {
      const result = await window.aistudio.hasSelectedApiKey();
      setHasKey(result);
    } catch (e) {
      console.error("Failed to check API key", e);
      setHasKey(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    await window.aistudio.openSelectKey();
    // Assume success as per instructions
    setHasKey(true);
  };

  if (hasKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
          <div className="h-4 w-32 bg-surface-container rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">API Key Required</h1>
          <p className="text-on-surface-variant mb-8">
            To use Gemini 3 Pro Image generation, you need to select a paid API key from your Google Cloud project.
          </p>
          
          <button
            onClick={handleOpenSelectKey}
            className="w-full cta-gradient text-white py-3 px-6 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
          >
            <Key className="w-5 h-5" />
            Select API Key
          </button>

          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Learn about billing <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
