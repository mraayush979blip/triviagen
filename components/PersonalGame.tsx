import React, { useState, useEffect } from 'react';
import { generateFakes } from '../services/gemini';
import { User, Send, RefreshCw, Trophy, Skull, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface SharedGameData {
  question: string;
  options: { text: string; isReal: boolean }[];
  hostName: string;
}

interface PersonalGameProps {
  playerName: string;
  initialData?: SharedGameData | null;
  onNewGame?: () => void;
}

const TEMPLATES = [
  "What is the strange, highly specific pet peeve that instantly ruins [Name]'s entire day?",
  "If [Name] started a cult, what would be the main rule?",
  "What is the weirdest thing [Name] has in their search history right now?",
  "What is [Name]'s 'useless talent' that they are secretly proud of?",
  "If [Name] were arrested, what would it be for?",
  "What is the title of [Name]'s autobiography?",
  "What is the one food [Name] would ban from existence if they could?",
  "What does [Name] talk about for way too long at parties?",
];

type GameState = 'idle' | 'input' | 'generating' | 'voting' | 'result';

export const PersonalGame: React.FC<PersonalGameProps> = ({ playerName, initialData, onNewGame }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [realAnswer, setRealAnswer] = useState('');
  const [options, setOptions] = useState<{ text: string; isReal: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize from shared URL data if present
  useEffect(() => {
    if (initialData) {
      setCurrentQuestion(initialData.question);
      setOptions(initialData.options);
      setGameState('voting');
    } else {
      setGameState('idle');
    }
  }, [initialData]);

  // When entering voting state as HOST, update URL to shareable link
  useEffect(() => {
    if (gameState === 'voting' && !initialData && options.length > 0) {
      const shareData: SharedGameData = {
        question: currentQuestion,
        options: options,
        hostName: playerName
      };
      
      const encoded = btoa(JSON.stringify(shareData));
      const url = new URL(window.location.href);
      url.searchParams.set('data', encoded);
      window.history.replaceState({}, '', url.toString());
    }
  }, [gameState, options, currentQuestion, playerName, initialData]);

  const startRound = () => {
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const question = randomTemplate.replace('[Name]', playerName);
    setCurrentQuestion(question);
    setRealAnswer('');
    setGameState('input');
  };

  const handleSubmitRealAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realAnswer.trim()) return;

    setGameState('generating');
    try {
      const fakes = await generateFakes(currentQuestion, realAnswer);
      
      const allOptions = [
        { text: realAnswer, isReal: true },
        ...fakes.map(fake => ({ text: fake, isReal: false }))
      ];
      
      // Shuffle options
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      setOptions(shuffled);
      setGameState('voting');
    } catch (error) {
      console.error(error);
      setGameState('input'); // Go back on error
    }
  };

  const handleVote = (index: number) => {
    setSelectedOption(index);
    setGameState('result');
  };

  const resetGame = () => {
    setGameState('idle');
    setSelectedOption(null);
    setOptions([]);
    if (onNewGame) onNewGame();
  };

  const copyGameLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (gameState === 'idle') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
        <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4 font-marker">It's Your Turn, {playerName}!</h2>
        <p className="text-gray-300 mb-8">
          We'll ask a question about YOU. You provide the truth, and our AI will generate the lies.
        </p>
        <button
          onClick={startRound}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          Start My Round
        </button>
      </div>
    );
  }

  if (gameState === 'input') {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl">
        <h3 className="text-xl text-purple-400 font-bold uppercase mb-4 tracking-wider text-center">Answer Truthfully</h3>
        <p className="text-2xl md:text-3xl text-white font-bold text-center mb-8 font-marker leading-relaxed">
          {currentQuestion}
        </p>
        
        <form onSubmit={handleSubmitRealAnswer} className="space-y-6">
          <input
            type="text"
            value={realAnswer}
            onChange={(e) => setRealAnswer(e.target.value)}
            placeholder="Type your real answer here..."
            className="w-full px-6 py-4 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            autoFocus
          />
          <button
            type="submit"
            disabled={!realAnswer.trim()}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Generate Fakes <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-center text-gray-500 mt-4">Only you can see this screen. Don't show your friends yet!</p>
      </div>
    );
  }

  if (gameState === 'generating') {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
       <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" />
          
          <div className="p-8">
            <h3 className="text-purple-400 font-bold uppercase mb-2 tracking-wider text-center text-sm">Find the Truth</h3>
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 font-marker">
              {currentQuestion}
            </h2>

            {/* Link sharing specifically for the Host */}
            {!initialData && gameState === 'voting' && (
              <div className="mb-8 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="text-sm text-indigo-200">
                    Invite friends to guess! 
                  </span>
                </div>
                <button 
                  onClick={copyGameLink}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"
                >
                  {linkCopied ? 'Copied!' : 'Copy Round Link'} <LinkIcon className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {options.map((option, index) => {
                const isSelected = selectedOption === index;
                const showResult = gameState === 'result';
                
                let buttonStyle = "bg-gray-700 hover:bg-gray-600 border-gray-600";
                if (showResult) {
                  if (option.isReal) {
                    buttonStyle = "bg-green-600 border-green-500 ring-2 ring-green-400";
                  } else if (isSelected) {
                    buttonStyle = "bg-red-600 border-red-500";
                  } else {
                    buttonStyle = "bg-gray-700 opacity-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && handleVote(index)}
                    disabled={showResult}
                    className={`
                      w-full p-4 rounded-xl border-2 text-left transition-all transform duration-300
                      ${buttonStyle}
                      ${!showResult && "hover:scale-[1.02] active:scale-[0.98]"}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-white">{option.text}</span>
                      {showResult && option.isReal && <Trophy className="w-6 h-6 text-yellow-300 animate-bounce" />}
                      {showResult && !option.isReal && isSelected && <Skull className="w-6 h-6 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {gameState === 'result' && (
              <div className="mt-8 flex justify-center animate-fade-in-up">
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  {initialData ? 'Back to Room' : 'Next Round'}
                </button>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};