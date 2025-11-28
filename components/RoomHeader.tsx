import React, { useState } from 'react';
import { Link, Copy, Check } from 'lucide-react';

interface RoomHeaderProps {
  roomId: string;
  playerName: string;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, playerName }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    // Copy the exact current URL, which might include specific game state
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in-down">
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="h-12 w-12 bg-gradient-to-br from-purple-900 to-gray-800 rounded-full flex items-center justify-center border border-purple-500/30 shadow-inner shrink-0">
             <span className="text-2xl">👾</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Playing as</div>
            <div className="text-white font-bold text-lg truncate max-w-[150px] md:max-w-[200px]">{playerName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-xl border border-gray-700/50 w-full md:w-auto">
          <div className="flex-1 md:flex-none px-2">
             <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Room Code</div>
             <div className="text-purple-300 font-mono font-bold">{roomId}</div>
          </div>
          <div className="h-8 w-px bg-gray-700 mx-2 hidden md:block"></div>
          <button
            onClick={copyLink}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all w-full md:w-auto ${
              copied 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-gray-500'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
};