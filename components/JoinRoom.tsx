import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';

interface JoinRoomProps {
  roomId: string;
  onJoin: (name: string) => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ roomId, onJoin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onJoin(name);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-[#121212] to-black">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gray-700 rounded-full mb-4 ring-2 ring-gray-600">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white font-marker mb-2 tracking-wide">Join the Party</h2>
          <p className="text-gray-400">You're entering Room <span className="text-purple-400 font-mono font-bold">{roomId}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">What should we call you?</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
              placeholder="e.g. Pizza Slayer"
              autoFocus
              required
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transform transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            Enter Room <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};