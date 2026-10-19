import React, { useState } from 'react';
import type { Biome } from '../App';

interface PlayerStatusProps {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
  currentBiome: Biome;
  biomes: Biome[];
  biomeKills: number;
  totalKills: number;
  isBiomeUnlocked: (biome: Biome) => boolean;
  onChangeBiome: (biomeId: string) => void;
  onOpenSettings: () => void;
  onOpenMerchant: () => void;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  hp,
  maxHp,
  level,
  xp,
  maxXp,
  gold,
  currentBiome,
  biomes,
  biomeKills,
  totalKills,
  isBiomeUnlocked,
  onOpenSettings,
  onOpenMerchant,
  onChangeBiome,
}) => {
  const hpPercent = Math.round((hp / maxHp) * 100);
  const xpPercent = Math.round((xp / maxXp) * 100);
  const [showBiomeSelector, setShowBiomeSelector] = useState(false);

  return (
    <header className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-[#1a1a2e] border-b-2 border-[#2d2d5e]">
      {/* Mobile Layout: 2 rows */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Row 1: HP and Level/XP */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* HP Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px] sm:min-w-[150px]">
            <span className="text-[10px] sm:text-[11px] text-red-400 whitespace-nowrap">❤️ HP</span>
            <div className="relative flex-1 h-5 sm:h-6 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm overflow-hidden">
              <div
                className="hp-bar h-full transition-all duration-300 rounded-sm"
                style={{ width: `${hpPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                {Math.floor(hp)}/{Math.floor(maxHp)}
              </span>
            </div>
          </div>

          {/* Level & XP Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px] sm:min-w-[150px]">
            <span className="text-[10px] sm:text-[11px] text-yellow-400 whitespace-nowrap bg-[#0f0f1a] px-2 sm:px-3 py-1 sm:py-1.5 border border-[#2d2d5e] rounded-sm">
              LV.{level}
            </span>
            <div className="relative flex-1 h-5 sm:h-6 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm overflow-hidden">
              <div
                className="xp-bar h-full transition-all duration-300 rounded-sm"
                style={{ width: `${xpPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                XP {Math.floor(xp)}/{Math.floor(maxXp)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Gold and Biome (on mobile) / Right side (on desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end flex-shrink-0">
          {/* Gold Counter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0f0f1a] px-3 sm:px-4 py-1.5 sm:py-2 border border-[#2d2d5e] rounded-sm">
              <span className="text-sm sm:text-base">🪙</span>
              <span className="text-[10px] sm:text-[11px] text-yellow-400 font-bold">{Math.floor(gold).toLocaleString()}</span>
            </div>
          </div>

          {/* Biome Selector */}
          <div className="relative">
            <button
              onClick={() => setShowBiomeSelector(!showBiomeSelector)}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#0f0f1a] px-3 sm:px-4 py-1.5 sm:py-2 border border-[#2d2d5e] rounded-sm hover:border-purple-500 transition-colors"
            >
              <span className="text-sm sm:text-base">{currentBiome.icon}</span>
              <span className="text-[10px] sm:text-[11px] text-purple-300">{currentBiome.name}</span>
              <span className="text-[9px] sm:text-[10px] text-gray-500">▼</span>
            </button>

            {/* Biome Dropdown */}
            {showBiomeSelector && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#0f0f1a] border-2 border-purple-500/70 rounded-md shadow-[0_0_20px_rgba(139,92,246,0.3)] z-50">
                <div className="p-3 border-b border-purple-500/30">
                  <span className="text-[11px] text-purple-300 font-bold">Selecionar Bioma</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {biomes.map((biome) => {
                    const unlocked = isBiomeUnlocked(biome);
                    const isCurrent = biome.id === currentBiome.id;
                    
                    return (
                      <button
                        key={biome.id}
                        onClick={() => {
                          if (unlocked && !isCurrent) {
                            onChangeBiome(biome.id);
                            setShowBiomeSelector(false);
                          }
                        }}
                        disabled={!unlocked}
                        className={`w-full p-3 flex items-start gap-3 transition-colors border-b border-[#2d2d5e] last:border-b-0 ${
                          isCurrent
                            ? 'bg-purple-900/30 border-l-2 border-l-purple-500'
                            : unlocked
                            ? 'hover:bg-purple-900/20 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-2xl">{biome.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold ${isCurrent ? 'text-purple-200' : 'text-gray-200'}`}>
                              {biome.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded">ATUAL</span>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-400 block mt-1">{biome.description}</span>
                          {!unlocked && (
                            <span className="text-[9px] text-red-400 block mt-1">
                              🔒 {biome.unlockRequirement.type === 'kills' 
                                ? `Derrote ${biome.unlockRequirement.value} inimigos (${totalKills}/${biome.unlockRequirement.value})`
                                : `Alcance o nível ${biome.unlockRequirement.value} (Nv. ${level}/${biome.unlockRequirement.value})`
                              }
                            </span>
                          )}
                          {unlocked && (
                            <div className="flex gap-3 mt-2">
                              <span className="text-[8px] text-gray-500">
                                HP: x{biome.enemyMultiplier.hp} | ATK: x{biome.enemyMultiplier.attack}
                              </span>
                              <span className="text-[8px] text-yellow-500">
                                💰 x{biome.enemyMultiplier.gold} | XP x{biome.enemyMultiplier.xp}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-purple-500/30 bg-[#1a1a2e]">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-gray-400">Kills no bioma:</span>
                    <span className="text-purple-300">{biomeKills}</span>
                  </div>
                  <div className="flex justify-between text-[9px] mt-1">
                    <span className="text-gray-400">Total de kills:</span>
                    <span className="text-purple-300">{totalKills}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Merchant Shop Button */}
          <button
            onClick={onOpenMerchant}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm hover:border-yellow-500 transition-colors"
            title="Mercado"
          >
            <span className="text-base sm:text-lg">🏪</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm hover:border-purple-500 transition-colors"
            title="Configurações"
          >
            <span className="text-base sm:text-lg">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PlayerStatus;
