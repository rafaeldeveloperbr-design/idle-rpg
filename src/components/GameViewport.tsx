import React from 'react';

type GamePhase = 'approaching' | 'fighting' | 'waiting';

interface GameViewportProps {
  heroX: number;
  enemyX: number;
  enemyHp: number;
  enemyMaxHp: number;
  scrollOffset: number;
  gamePhase: GamePhase;
}

const GameViewport: React.FC<GameViewportProps> = ({
  heroX,
  enemyX,
  enemyHp,
  enemyMaxHp,
  scrollOffset,
  gamePhase,
}) => {
  const enemyHpPercent = Math.max(0, Math.round((enemyHp / enemyMaxHp) * 100));
  const isMoving = gamePhase === 'approaching';
  const isAttacking = gamePhase === 'fighting' && enemyHp > 0;
  const isWaiting = gamePhase === 'waiting';
  const isEnemyDead = enemyHp <= 0;

  return (
    <div className="flex-1 w-full relative overflow-hidden sky-gradient pixel-border rounded-md">
      {/* Enemy Name/HP Bar at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
        <span className="text-[9px] text-red-300 tracking-wider">👹 Goblin Selvagem</span>
        <div className="relative w-40 h-3 bg-[#0f0f1a]/80 border border-red-900/50 rounded-sm overflow-hidden">
          <div
            className="hp-bar h-full rounded-sm transition-all duration-200"
            style={{ width: `${enemyHpPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {Math.max(0, enemyHp)}/{enemyMaxHp}
          </span>
        </div>
      </div>

      {/* Stars/Particles in background (slow parallax) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translateX(${-(scrollOffset * 0.1) % 200}px)` }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/30 rounded-full animate-pulse-glow"
            style={{
              top: `${(i * 17 + 5) % 60}%`,
              left: `${(i * 23 + 10) % 120}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Mountains/Background decoration (medium parallax) */}
      <div
        className="absolute bottom-16 left-0 pointer-events-none"
        style={{
          transform: `translateX(${-(scrollOffset * 0.3) % 400}px)`,
          width: '200%',
        }}
      >
        <svg className="w-full h-24 opacity-30" viewBox="0 0 1600 100" preserveAspectRatio="none">
          <polygon points="0,100 100,40 200,80 300,20 400,70 500,30 600,60 700,25 800,90 900,40 1000,80 1100,20 1200,70 1300,30 1400,60 1500,25 1600,100" fill="#2a1a4e" />
          <polygon points="0,100 150,60 250,85 350,50 500,80 650,45 800,100 950,60 1050,85 1150,50 1300,80 1450,45 1600,100" fill="#1a1a3e" />
        </svg>
      </div>

      {/* Ground/Floor with scrolling (full parallax) */}
      <div
        className="absolute bottom-0 left-0 h-16 ground-texture"
        style={{
          width: '200%',
          transform: `translateX(${-(scrollOffset * 0.8) % 400}px)`,
        }}
      >
        {/* Grass on top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-green-700 to-green-900 opacity-80" />
        {/* Ground details - repeated for seamless scroll */}
        {[0, 400, 800, 1200].map((offset) => (
          <React.Fragment key={offset}>
            <div className="absolute top-3 w-3 h-1 bg-amber-900/40 rounded-full" style={{ left: `${offset + 40}px` }} />
            <div className="absolute top-5 w-2 h-1 bg-amber-900/30 rounded-full" style={{ left: `${offset + 120}px` }} />
            <div className="absolute top-4 w-4 h-1 bg-amber-900/40 rounded-full" style={{ left: `${offset + 240}px` }} />
            <div className="absolute top-6 w-2 h-1 bg-amber-900/30 rounded-full" style={{ left: `${offset + 320}px` }} />
            <div className="absolute top-3 w-2 h-2 bg-green-800/30 rounded-full" style={{ left: `${offset + 180}px` }} />
            <div className="absolute top-5 w-3 h-1 bg-amber-900/20 rounded-full" style={{ left: `${offset + 360}px` }} />
          </React.Fragment>
        ))}
      </div>

      {/* Hero - FIXED position on screen */}
      <div
        className={`absolute bottom-16 ${
          isMoving ? 'animate-walk' : isAttacking ? 'animate-attack' : 'animate-float'
        }`}
        style={{ left: `${heroX}px` }}
      >
        <div className="flex flex-col items-center">
          {/* Hero Pixel Art */}
          <div className="relative">
            <div className="w-12 h-16 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 rounded-t-lg relative">
              {/* Head */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-200 to-amber-400 border-2 border-amber-600 rounded-sm">
                <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                <div className="absolute -top-1 left-0 right-0 h-2 bg-amber-700 rounded-t-sm" />
              </div>
              {/* Sword - transform-origin at the base (handle) so the blade swings */}
              <div
                className={`absolute -right-3 top-1 w-2 h-10 bg-gradient-to-b from-gray-200 to-gray-400 border border-gray-500 rounded-t-sm sword-swing ${
                  isAttacking ? 'animate-sword-swing' : ''
                }`}
                style={{ transformOrigin: '50% 100%' }}
              >
                {/* Blade tip */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-gray-100 border border-gray-400 rounded-t-full" />
                {/* Handle/guard */}
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-amber-700 border border-amber-900 rounded-sm" />
              </div>
              {/* Shield */}
              <div className="absolute -left-3 top-3 w-4 h-5 bg-gradient-to-b from-gray-400 to-gray-600 border border-gray-700 rounded-sm">
                <div className="absolute inset-0.5 border border-blue-400/50 rounded-sm" />
              </div>
            </div>
            {/* Legs */}
            <div className="flex justify-center gap-0.5">
              <div className={`w-4 h-3 bg-blue-800 border border-blue-900 rounded-b-sm ${isMoving ? 'animate-leg-left' : ''}`} />
              <div className={`w-4 h-3 bg-blue-800 border border-blue-900 rounded-b-sm ${isMoving ? 'animate-leg-right' : ''}`} />
            </div>
          </div>
          <span className="text-[8px] text-green-300 mt-1 bg-black/50 px-1 rounded">Herói</span>
        </div>
      </div>

      {/* Enemy - moves from right to left */}
      <div
        className={`absolute bottom-16 transition-opacity duration-500 ${
          isEnemyDead ? 'opacity-0 scale-90' : isAttacking ? 'animate-hit' : ''
        }`}
        style={{
          left: `${enemyX}px`,
          transform: isEnemyDead ? 'scale(0.9)' : undefined,
        }}
      >
        <div className="flex flex-col items-center">
          {/* Enemy Pixel Art - Goblin */}
          <div className="relative">
            <div className="w-10 h-14 bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-400 rounded-t-md relative">
              {/* Head */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-gradient-to-b from-green-400 to-green-600 border-2 border-green-800 rounded-sm">
                <div className="absolute top-1.5 left-1 w-2 h-2 bg-red-500 rounded-full" />
                <div className="absolute top-1.5 right-1 w-2 h-2 bg-red-500 rounded-full" />
                <div className="absolute -left-2 top-0 w-2 h-3 bg-green-500 border border-green-800 rounded-sm rotate-[-15deg]" />
                <div className="absolute -right-2 top-0 w-2 h-3 bg-green-500 border border-green-800 rounded-sm rotate-[15deg]" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-900 rounded-sm" />
              </div>
              {/* Club weapon */}
              <div className="absolute -left-4 top-4 w-3 h-8 bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-950 rounded-sm">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-amber-800 border border-amber-950 rounded-sm" />
              </div>
            </div>
            {/* Legs */}
            <div className="flex justify-center gap-0.5">
              <div className={`w-3 h-2.5 bg-green-900 border border-green-950 rounded-b-sm ${isMoving ? 'animate-leg-left' : ''}`} />
              <div className={`w-3 h-2.5 bg-green-900 border border-green-950 rounded-b-sm ${isMoving ? 'animate-leg-right' : ''}`} />
            </div>
          </div>
          <span className="text-[8px] text-red-300 mt-1 bg-black/50 px-1 rounded">Inimigo</span>
        </div>
      </div>

      {/* Damage numbers */}
      {isAttacking && (
        <div
          key={`dmg-${Date.now()}`}
          className="absolute text-[10px] text-yellow-300 font-bold animate-damage-float pointer-events-none"
          style={{
            left: `${enemyX + 10}px`,
            bottom: '110px',
          }}
        >
          -10
        </div>
      )}

      {/* Waiting phase indicator */}
      {isWaiting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-[10px] text-yellow-400/70 animate-pulse-glow bg-black/40 px-3 py-1 rounded-sm border border-yellow-900/30">
            ⏳ Aguardando próximo inimigo...
          </span>
        </div>
      )}

      {/* Zone indicator */}
      <div className="absolute top-3 left-3 bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-1">
        <span className="text-[8px] text-purple-300">📍 Floresta Sombria</span>
      </div>

      {/* Kill counter */}
      <div className="absolute top-3 right-3 bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-1">
        <span className="text-[8px] text-gray-300">💀 Kills: 42</span>
      </div>

      {/* Phase indicator (debug-style) */}
      <div className="absolute bottom-[72px] left-3 bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-0.5">
        <span className={`text-[7px] ${
          gamePhase === 'approaching' ? 'text-cyan-300' :
          gamePhase === 'fighting' ? 'text-red-300' :
          'text-yellow-300'
        }`}>
          {gamePhase === 'approaching' ? '🚶 Aproximando' :
           gamePhase === 'fighting' ? '⚔️ Combate' :
           '💤 Aguardando'}
        </span>
      </div>
    </div>
  );
};

export default GameViewport;
