import React, { useState, useEffect } from 'react';
import type { TriviaCard } from '../types';
import { Eye, EyeOff, Copy } from 'lucide-react';

interface TriviaDisplayProps {
  data: TriviaCard;
}

export const TriviaDisplay: React.FC<TriviaDisplayProps> = ({ data }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset revealed state when data changes
  useEffect(() => {
    setRevealed(false);
    setCopied(false);
  }, [data]);

  const handleCopy = () => {
    const text = `Q: ${data.question}\nA: ${data.real_answer}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" />
        
        <div className="p-8">
          {/* Category Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-block px-4 py-1.5 bg-gray-700 text-purple-300 rounded-full text-sm font-bold tracking-wider uppercase shadow-inner border border-gray-600">
              {data.category}
            </span>
          </div>

          {/* Question */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white font-marker tracking-wide drop-shadow-md">
              {data.question}
            </h2>
          </div>

          {/* Answer Section */}
          <div className="relative">
            <div 
              className={`
                transition-all duration-500 ease-in-out transform
                ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
              `}
            >
              <div className="bg-green-900/30 border border-green-800 rounded-xl p-6 text-center backdrop-blur-sm">
                <p className="text-sm text-green-400 uppercase font-bold mb-2 tracking-widest">Real Answer</p>
                <p className="text-xl md:text-2xl font-bold text-green-100">{data.real_answer}</p>
              </div>
            </div>

            {/* Reveal Button Overlay */}
            {!revealed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setRevealed(true)}
                  className="group flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white rounded-lg transition-all shadow-lg hover:shadow-xl border border-gray-600"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Reveal Answer</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex justify-between items-center">
           <button 
            onClick={() => setRevealed(!revealed)}
            className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
           >
             {revealed ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
             {revealed ? 'Hide' : 'Show'}
           </button>

           <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
           >
             <Copy className="w-4 h-4" />
             {copied ? 'Copied!' : 'Copy to Clipboard'}
           </button>
        </div>
      </div>
    </div>
  );
};