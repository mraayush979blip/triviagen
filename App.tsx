import React, { useState, useEffect } from 'react';
import { generateTrivia } from './services/gemini';
import type { TriviaCard } from './types';
import { TriviaDisplay } from './components/TriviaDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HistoryList } from './components/HistoryList';
import { JoinRoom } from './components/JoinRoom';
import { RoomHeader } from './components/RoomHeader';
import { PersonalGame } from './components/PersonalGame';
import { Sparkles, AlertCircle, Dice5, Users, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentCard, setCurrentCard] = useState<TriviaCard | null>(null);
  const [history, setHistory] = useState<TriviaCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Room State
  const [view, setView] = useState<'home' | 'join' | 'room'>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [gameMode, setGameMode] = useState<'trivia' | 'personal'>('trivia');
  
  // Shared Game State (parsed from URL)
  const [sharedGameData, setSharedGameData] = useState<any>(null);

  // Check URL for room parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    const data = params.get('data');

    if (room) {
      setRoomId(room);
      setView('join');
      
      // If there is shared game data, we default to personal mode
      if (data) {
        try {
          const parsed = JSON.parse(atob(data));
          setSharedGameData(parsed);
          setGameMode('personal');
        } catch (e) {
          console.error("Failed to parse shared game data", e);
        }
      }
    }
  }, []);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const url = new URL(window.location.href);
    url.searchParams.set('room', newRoomId);
    window.history.pushState({}, '', url.toString());
    
    setRoomId(newRoomId);
    setPlayerName('Host'); // Default host name
    setView('room');
    setGameMode('personal'); // Default to new mode for rooms
    setSharedGameData(null);
  };

  const joinRoom = (name: string) => {
    setPlayerName(name);
    setView('room');
    // If we have shared data, we stay in personal mode, otherwise default to it
    setGameMode('personal');
  };

  const fetchNewTrivia = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateTrivia();
      setCurrentCard(data);
      setHistory(prev => [data, ...prev]);
    } catch (err) {
      setError("Failed to generate content. The AI might be taking a nap. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // Initial load for solo play
  useEffect(() => {
    if (view === 'home') {
      fetchNewTrivia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view === 'join') {
    return <JoinRoom roomId={roomId} onJoin={joinRoom} />;
  }

  return (
    <div className="min-h-screen bg-[#121212] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-[#121212] to-black text-white selection:bg-purple-500/30">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        
        {/* Header */}
        <header className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4 shadow-lg border border-gray-700 cursor-pointer hover:scale-110 transition-transform" onClick={() => window.location.href = '/'}>
            <Dice5 className="w-8 h-8 text-purple-500 animate-bounce-slow" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 font-marker transform -rotate-2">
            TriviaGen
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            Generate obscure, hilarious, and bizarre trivia cards for your next bluffing party game.
          </p>
        </header>

        {view === 'room' && (
          <>
            <RoomHeader roomId={roomId} playerName={playerName} />
            
            {/* Mode Switcher - Only show if we aren't locked into a shared game */}
            {!sharedGameData && (
              <div className="flex justify-center mb-8">
                <div className="bg-gray-800 p-1 rounded-xl flex gap-1 border border-gray-700">
                  <button
                    onClick={() => setGameMode('personal')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      gameMode === 'personal'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <UserCircle className="w-4 h-4" />
                    Personal Bluff
                  </button>
                  <button
                    onClick={() => setGameMode('trivia')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      gameMode === 'trivia'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Classic Trivia
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {view === 'home' && (
           <div className="flex justify-center mb-8">
             <button
               onClick={createRoom}
               className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-xl font-bold border border-gray-700 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-900/20 group"
             >
               <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
               Create Party Room
             </button>
           </div>
        )}

        <div className="flex flex-col md:flex-row items-start justify-center">
          
          {/* Main Content Area */}
          <div className="w-full flex-1 flex flex-col items-center">
            
            {gameMode === 'personal' && view === 'room' ? (
              <PersonalGame 
                playerName={playerName} 
                initialData={sharedGameData}
                onNewGame={() => {
                  setSharedGameData(null);
                  // Clean URL
                  const url = new URL(window.location.href);
                  url.searchParams.delete('data');
                  window.history.pushState({}, '', url.toString());
                }}
              />
            ) : (
              <>
                {/* Action Area for Trivia */}
                <div className="mb-8 w-full flex justify-center">
                  <button
                    onClick={fetchNewTrivia}
                    disabled={loading}
                    className={`
                      relative overflow-hidden group
                      px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 active:scale-95
                      ${loading 
                        ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/25 ring-2 ring-purple-500/50 hover:ring-purple-400'}
                    `}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        'Generating...'
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate New Card
                        </>
                      )}
                    </span>
                    {!loading && (
                      <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    )}
                  </button>
                </div>

                {/* Content Display */}
                <div className="w-full min-h-[400px] flex items-center justify-center">
                  {error ? (
                    <div className="text-center p-8 bg-red-900/20 border border-red-800 rounded-xl max-w-md">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-200">{error}</p>
                      <button 
                        onClick={fetchNewTrivia}
                        className="mt-4 text-sm text-red-400 hover:text-red-300 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : loading ? (
                    <LoadingSpinner />
                  ) : currentCard ? (
                    <TriviaDisplay data={currentCard} />
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <p className="text-lg">Waiting for the first card...</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar History - Only show for Trivia mode */}
          {gameMode === 'trivia' && (
            <HistoryList 
              history={history} 
              onSelect={(card) => {
                setCurrentCard(card);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-600 text-sm">
          <p>Powered by Google Gemini 2.5 Flash</p>
        </footer>
      </div>
    </div>
  );
};

export default App;