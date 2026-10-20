import React, { useState } from 'react';
import type { Biome } from '../App';
import { GoldIcon } from '../App';

interface PlayerStatusProps {
  level: number;
  gold: number;
  diamonds: number;
  speedBoostActive: boolean;
  currentBiome: Biome;
  biomes: Biome[];
  biomeKills: number;
  totalKills: number;
  isBiomeUnlocked: (biome: Biome) => boolean;
  onChangeBiome: (biomeId: string) => void;
  onOpenSettings: () => void;
  onOpenMerchant: () => void;
  onOpenDiamondShop: () => void;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  level,
  gold,
  diamonds,
  speedBoostActive,
  currentBiome,
  biomes,
  biomeKills,
  totalKills,
  isBiomeUnlocked,
  onOpenSettings,
  onOpenMerchant,
  onOpenDiamondShop,
  onChangeBiome,
}) => {
  const [showBiomeSelector, setShowBiomeSelector] = useState(false);

  return (
    <header className="w-full h-full px-2 sm:px-4 bg-[#1a1a2e] border-b-2 border-[#2d2d5e] flex items-center">
      {/* Single Row Layout */}
      <div className="flex items-center gap-1 sm:gap-3 justify-between w-full">
        {/* Left: Level + Speed Boost */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] sm:text-[11px] text-yellow-400 whitespace-nowrap bg-[#0f0f1a] px-1.5 sm:px-3 py-1 sm:py-1.5 border border-[#2d2d5e] rounded-sm font-bold">
            LV.{level}
          </span>

          {speedBoostActive && (
            <span
              className="text-[10px] text-yellow-300 font-bold whitespace-nowrap bg-yellow-950/70 border border-yellow-500/50 rounded-sm px-1 py-1"
              title="Acelerador de Velocidade 2× ativo"
            >
              ⚡2×
            </span>
          )}
        </div>

        {/* Center: Gold and Diamonds */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Gold Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0f0f1a] px-2 sm:px-3 py-1 sm:py-1.5 border border-[#2d2d5e] rounded-sm">
            <GoldIcon size="sm" />
            <span className="text-[9px] sm:text-[10px] text-yellow-400 font-bold">{Math.floor(gold).toLocaleString()}</span>
          </div>

          {/* Diamond Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0f0f1a] px-2 sm:px-3 py-1 sm:py-1.5 border border-[#2d2d5e] rounded-sm">
            <span className="text-xs sm:text-sm">💎</span>
            <span className="text-[9px] sm:text-[10px] text-cyan-300 font-bold">{Math.floor(diamonds).toLocaleString()}</span>
          </div>

          {/* Diamond Shop Button */}
          <button
            onClick={onOpenDiamondShop}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-400 rounded-sm hover:from-cyan-500 hover:to-blue-600 transition-colors shadow-[0_0_8px_rgba(34,211,238,0.3)]"
            title="Loja de Diamantes"
          >
            <span className="text-xs sm:text-sm">💎</span>
          </button>
        </div>

        {/* Right: Biome Selector */}
        <div className="relative min-w-0">
          <button
            onClick={() => setShowBiomeSelector(!showBiomeSelector)}
            className="flex items-center gap-1 bg-[#0f0f1a] px-1.5 sm:px-3 py-1 sm:py-1.5 border border-[#2d2d5e] rounded-sm hover:border-purple-500 transition-colors min-w-0 max-w-[140px]"
          >
            <span className="text-xs sm:text-sm">{currentBiome.icon}</span>
            <span className="text-[8px] sm:text-[10px] text-purple-300 truncate">{currentBiome.name}</span>
            <span className="text-[8px] sm:text-[9px] text-gray-500">▼</span>
          </button>

          {/* Biome Dropdown */}
          {showBiomeSelector && (
            <div className="absolute top-full right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-[#0f0f1a] border-2 border-purple-500/70 rounded-md shadow-[0_0_20px_rgba(139,92,246,0.3)] z-[100]">
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
                      className={`w-full p-3 flex items-start gap-3 transition-colors border-b border-[#2d2d5e] last:border-b-0 ${isCurrent
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Merchant Shop Button */}
          <button
            onClick={onOpenMerchant}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm hover:border-yellow-500 transition-colors"
            title="Mercado"
          >
            <span className="text-sm sm:text-base">🏪</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm hover:border-purple-500 transition-colors"
            title="Configurações"
          >
            <span className="text-sm sm:text-base">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PlayerStatus;
