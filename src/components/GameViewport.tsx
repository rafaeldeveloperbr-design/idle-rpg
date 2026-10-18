import React from 'react';

interface GameViewportProps {
  heroX: number;
  enemyX: number;
  isMoving: boolean;
}

const GameViewport: React.FC<GameViewportProps> = ({ heroX, enemyX, isMoving }) => {
  return (
    <div className="flex-1 w-full relative overflow-hidden sky-gradient pixel-border rounded-md">
      {/* Enemy Name/HP Bar at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
        <span className="text-[9px] text-red-300 tracking-wider">👹 Goblin Selvagem</span>
        <div className="relative w-40 h-3 bg-[#0f0f1a]/80 border border-red-900/50 rounded-sm overflow-hidden">
          <div
            className="hp-bar h-full rounded-sm"
            style={{ width: '65%' }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            65/100
          </span>
        </div>
      </div>

      {/* Stars/Particles in background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/30 rounded-full animate-pulse-glow"
            style={{
              top: `${(i * 17 + 5) % 60}%`,
              left: `${(i * 23 + 10) % 100}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Mountains/Background decoration */}
      <div className="absolute bottom-16 left-0 right-0 pointer-events-none">
        <svg className="w-full h-24 opacity-30" viewBox="0 0 800 100" preserveAspectRatio="none">
          <polygon points="0,100 100,40 200,80 300,20 400,70 500,30 600,60 700,25 800,100" fill="#2a1a4e" />
          <polygon points="0,100 150,60 250,85 350,50 500,80 650,45 800,100" fill="#1a1a3e" />
        </svg>
      </div>

      {/* Hero - positioned dynamically */}
      <div
        className={`absolute bottom-16 ${isMoving ? 'animate-walk' : 'animate-float'}`}
        style={{ left: `${heroX}px` }}
      >
        <div className="flex flex-col items-center">
          {/* Hero Pixel Art */}
          <div className="relative">
            <div className="w-12 h-16 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 rounded-t-lg relative">
              {/* Head */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-200 to-amber-400 border-2 border-amber-600 rounded-sm">
                {/* Eyes */}
                <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                {/* Hair */}
                <div className="absolute -top-1 left-0 right-0 h-2 bg-amber-700 rounded-t-sm" />
              </div>
              {/* Sword */}
              <div className={`absolute -right-4 top-2 w-2 h-10 bg-gradient-to-b from-gray-300 to-gray-500 border border-gray-600 rounded-sm transition-transform duration-150 ${!isMoving ? 'rotate-[-10deg]' : ''}`}>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-amber-700 border border-amber-900 rounded-sm" />
              </div>
              {/* Shield */}
              <div className="absolute -left-3 top-3 w-4 h-5 bg-gradient-to-b from-gray-400 to-gray-600 border border-gray-700 rounded-sm">
                <div className="absolute inset-0.5 border border-blue-400/50 rounded-sm" />
              </div>
            </div>
            {/* Legs - animated when walking */}
            <div className="flex justify-center gap-0.5">
              <div className={`w-4 h-3 bg-blue-800 border border-blue-900 rounded-b-sm transition-transform duration-100 ${isMoving ? 'animate-leg-left' : ''}`} />
              <div className={`w-4 h-3 bg-blue-800 border border-blue-900 rounded-b-sm transition-transform duration-100 ${isMoving ? 'animate-leg-right' : ''}`} />
            </div>
          </div>
          <span className="text-[8px] text-green-300 mt-1 bg-black/50 px-1 rounded">Herói</span>
        </div>
      </div>

      {/* Enemy - positioned dynamically */}
      <div
        className="absolute bottom-16"
        style={{ left: `${enemyX}px` }}
      >
        <div className="flex flex-col items-center">
          {/* Enemy Pixel Art - Goblin */}
          <div className="relative">
            <div className="w-10 h-14 bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-400 rounded-t-md relative">
              {/* Head */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-b from-green-400 to-green-600 border-2 border-green-800 rounded-sm">
                {/* Eyes */}
                <div className="absolute top-1.5 left-1 w-2 h-2 bg-red-500 rounded-full" />
                <div className="absolute top-1.5 right-1 w-2 h-2 bg-red-500 rounded-full" />
                {/* Ears */}
                <div className="absolute -left-2 top-0 w-2 h-3 bg-green-500 border border-green-800 rounded-sm rotate-[-15deg]" />
                <div className="absolute -right-2 top-0 w-2 h-3 bg-green-500 border border-green-800 rounded-sm rotate-[15deg]" />
                {/* Mouth */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-900 rounded-sm" />
              </div>
              {/* Club weapon */}
              <div className="absolute -left-4 top-4 w-3 h-8 bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-950 rounded-sm">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-amber-800 border border-amber-950 rounded-sm" />
              </div>
            </div>
            {/* Legs */}
            <div className="flex justify-center gap-0.5">
              <div className="w-3 h-2.5 bg-green-900 border border-green-950 rounded-b-sm" />
              <div className="w-3 h-2.5 bg-green-900 border border-green-950 rounded-b-sm" />
            </div>
          </div>
          <span className="text-[8px] text-red-300 mt-1 bg-black/50 px-1 rounded">Inimigo</span>
        </div>
      </div>

      {/* Ground/Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-16 ground-texture">
        {/* Grass on top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-green-700 to-green-900 opacity-80" />
        {/* Ground details */}
        <div className="absolute top-3 left-[10%] w-3 h-1 bg-amber-900/40 rounded-full" />
        <div className="absolute top-5 left-[30%] w-2 h-1 bg-amber-900/30 rounded-full" />
        <div className="absolute top-4 left-[60%] w-4 h-1 bg-amber-900/40 rounded-full" />
        <div className="absolute top-6 left-[80%] w-2 h-1 bg-amber-900/30 rounded-full" />
      </div>

      {/* Zone indicator */}
      <div className="absolute top-3 left-3 bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-1">
        <span className="text-[8px] text-purple-300">📍 Floresta Sombria</span>
      </div>

      {/* Kill counter */}
      <div className="absolute top-3 right-3 bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-1">
        <span className="text-[8px] text-gray-300">💀 Kills: 42</span>
      </div>

      {/* Debug: distance indicator (visual only) */}
      <div className="absolute bottom-[72px] left-0 right-0 pointer-events-none">
        <div
          className="absolute h-[2px] border-t border-dashed border-purple-500/30"
          style={{
            left: `${heroX + 24}px`,
            width: `${Math.max(0, enemyX - heroX - 48)}px`,
          }}
        />
      </div>
    </div>
  );
};

export default GameViewport;
