import React from 'react';

interface PlayerStatusProps {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  hp,
  maxHp,
  level,
  xp,
  maxXp,
  gold,
}) => {
  const hpPercent = Math.round((hp / maxHp) * 100);
  const xpPercent = Math.round((xp / maxXp) * 100);

  return (
    <header className="w-full px-3 py-2 bg-[#1a1a2e] border-b-2 border-[#2d2d5e] flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
      {/* HP Bar */}
      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
        <span className="text-[10px] text-red-400 whitespace-nowrap">❤️ HP</span>
        <div className="relative flex-1 h-5 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm overflow-hidden">
          <div
            className="hp-bar h-full transition-all duration-300 rounded-sm"
            style={{ width: `${hpPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {hp}/{maxHp}
          </span>
        </div>
      </div>

      {/* Level & XP Bar */}
      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
        <span className="text-[10px] text-yellow-400 whitespace-nowrap bg-[#0f0f1a] px-2 py-1 border border-[#2d2d5e] rounded-sm">
          LV.{level}
        </span>
        <div className="relative flex-1 h-5 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm overflow-hidden">
          <div
            className="xp-bar h-full transition-all duration-300 rounded-sm"
            style={{ width: `${xpPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            XP {xp}/{maxXp}
          </span>
        </div>
      </div>

      {/* Gold Counter */}
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex items-center gap-1 bg-[#0f0f1a] px-3 py-1.5 border border-[#2d2d5e] rounded-sm">
          <span className="text-sm">🪙</span>
          <span className="text-[10px] text-yellow-400 font-bold">{gold.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};

export default PlayerStatus;
