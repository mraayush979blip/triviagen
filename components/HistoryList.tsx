import React from 'react';
import type { TriviaCard } from '../types';
import { Clock } from 'lucide-react';

interface HistoryListProps {
  history: TriviaCard[];
  onSelect: (card: TriviaCard) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-8 md:mt-0 md:w-80 md:ml-8 flex-shrink-0">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg sticky top-8">
        <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Recent Gems
        </h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((card, index) => (
            <div 
              key={index}
              onClick={() => onSelect(card)}
              className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-600 group"
            >
              <div className="text-xs text-purple-400 font-bold uppercase mb-1">{card.category}</div>
              <div className="text-sm text-gray-300 line-clamp-2 group-hover:text-white">{card.question}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};