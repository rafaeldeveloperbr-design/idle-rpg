import React, { useState } from 'react';
import type { DamagePopup, Skill, ActiveBuff, Biome, Enemy } from '../App';

type GamePhase = 'approaching' | 'fighting' | 'respawning';

interface GameViewportProps {
  heroX: number;
  heroName: string;
  heroHp: number;
  heroMaxHp: number;
  heroXp: number;
  heroMaxXp: number;
  enemyX: number;
  enemyHp: number;
  enemyMaxHp: number;
  scrollOffset: number;
  gamePhase: GamePhase;
  wave: number;
  damagePopups: DamagePopup[];
  heroHitFlash: boolean;
  enemyHitFlash: boolean;
  skills: Skill[];
  equippedSkillIds: string[];
  activeBuffs: ActiveBuff[];
  onUseSkill: (skillId: string) => void;
  currentBiome: Biome;
  currentEnemy: Enemy;
  isBossWave: boolean;
  biomeKills: number;
}

// === Skill Bar Sub-component with Tooltips ===
interface SkillBarProps {
  skills: Skill[];
  activeBuffs: ActiveBuff[];
  onUseSkill: (skillId: string) => void;
}

const SkillBar: React.FC<SkillBarProps> = ({ skills, activeBuffs, onUseSkill }) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {skills.map((skill) => {
        const now = Date.now();
        const cooldownMs = skill.cooldown * 1000;
        const timeSinceUse = now - skill.lastUsed;
        const isOnCooldown = timeSinceUse < cooldownMs;
        const cooldownPercent = isOnCooldown
          ? ((cooldownMs - timeSinceUse) / cooldownMs) * 100
          : 0;
        const cooldownRemaining = isOnCooldown
          ? Math.ceil((cooldownMs - timeSinceUse) / 1000)
          : 0;
        const hasBuff = activeBuffs.some(b => b.skillId === skill.id);
        const isHovered = hoveredSkill === skill.id;

        return (
          <div key={skill.id} className="relative group">
            {/* Tooltip - appears on hover */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-[#0f0f1a] border-2 border-purple-500/70 rounded-md p-3 shadow-[0_0_15px_rgba(139,92,246,0.3)] pointer-events-none z-30">
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                  <div className="w-2 h-2 bg-[#0f0f1a] border-r-2 border-b-2 border-purple-500/70 rotate-45 -translate-y-1" />
                </div>
                {/* Tooltip Content */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{skill.icon}</span>
                    <span className="text-[11px] text-purple-200 font-bold">{skill.name}</span>
                  </div>
                  <div className="h-[1px] bg-purple-500/30 w-full" />
                  <span className="text-[9px] text-gray-300 leading-relaxed">{skill.description}</span>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-gray-400">Efeito:</span>
                      <span className="text-yellow-300">
                        {skill.effect === 'damage' && `${Math.round(skill.effectValue * 100)}% ATK`}
                        {skill.effect === 'heal' && `${Math.round(skill.effectValue * 100)}% HP Max`}
                        {skill.effect === 'buff' && `${Math.round(skill.effectValue * 100)}% ATK por ${skill.buffDuration}s`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-gray-400">Cooldown:</span>
                      <span className={isOnCooldown ? 'text-red-400' : 'text-green-300'}>
                        {isOnCooldown ? `${cooldownRemaining}s` : `${skill.cooldown}s`}
                      </span>
                    </div>
                    {skill.autoCast && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[8px] bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded-sm border border-green-700/50">
                          ⚡ AUTO-CAST ATIVO
                        </span>
                      </div>
                    )}
                    {hasBuff && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[8px] bg-yellow-900/50 text-yellow-300 px-1.5 py-0.5 rounded-sm border border-yellow-700/50">
                          🔥 BUFF ATIVO
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skill Button */}
            <button
              onClick={() => onUseSkill(skill.id)}
              disabled={isOnCooldown}
              onMouseEnter={() => setHoveredSkill(skill.id)}
              onMouseLeave={() => setHoveredSkill(null)}
              className={`relative w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-md flex items-center justify-center transition-all ${
                isOnCooldown
                  ? 'border-gray-600 bg-[#0a0a12]/80 cursor-not-allowed'
                  : 'border-purple-500 bg-[#1a1a2e]/90 hover:border-purple-300 hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] cursor-pointer'
              } ${hasBuff ? 'ring-2 ring-yellow-400 animate-pulse-glow' : ''}`}
            >
              <span className="text-lg sm:text-xl">{skill.icon}</span>
              {/* Cooldown overlay */}
              {isOnCooldown && (
                <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-purple-900/50"
                    style={{ height: `${cooldownPercent}%` }}
                  />
                  <span className="text-[10px] text-white font-bold z-10">
                    {cooldownRemaining}s
                  </span>
                </div>
              )}
              {/* Auto-cast indicator */}
              {skill.autoCast && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border border-green-300 rounded-full flex items-center justify-center">
                  <span className="text-[8px]">⚡</span>
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const GameViewport: React.FC<GameViewportProps> = ({
  heroX,
  heroName,
  heroHp,
  heroMaxHp,
  heroXp,
  heroMaxXp,
  enemyX,
  enemyHp,
  enemyMaxHp,
  scrollOffset,
  gamePhase,
  wave,
  damagePopups,
  heroHitFlash,
  enemyHitFlash,
  skills,
  equippedSkillIds,
  activeBuffs,
  onUseSkill,
  currentBiome,
  currentEnemy,
  isBossWave,
  biomeKills,
}) => {
  const enemyHpPercent = Math.max(0, Math.round((enemyHp / enemyMaxHp) * 100));
  const isMoving = gamePhase === 'approaching';
  const isAttacking = gamePhase === 'fighting' && enemyHp > 0;
  const isEnemyDead = enemyHp <= 0;

  return (
    <div className={`flex-1 w-full relative overflow-hidden bg-gradient-to-b ${currentBiome.theme.skyGradient} pixel-border rounded-md`}>
      {/* Top Info Container - Reorganized for mobile */}
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-col gap-2">
        {/* Line 1: Biome & Wave Info */}
        <div className="flex items-center justify-between gap-2">
          {/* Zone indicator */}
          <div className="bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-1 flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-purple-300">{currentBiome.icon} {currentBiome.name}</span>
          </div>
          
          {/* Wave counter & Boss indicator */}
          <div className="bg-black/60 border border-[#2d2d5e] rounded-sm px-2 py-1 flex flex-col items-end gap-0.5 flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-gray-300">💀 Wave: {wave}</span>
            <span className="text-[8px] sm:text-[9px] text-purple-400">Kills: {biomeKills}</span>
            {biomeKills > 0 && biomeKills % 10 < 3 && (
              <span className="text-[8px] sm:text-[9px] text-red-400 animate-pulse-glow">
                ⚠️ Boss em {10 - (biomeKills % 10)}!
              </span>
            )}
          </div>
        </div>

        {/* Line 2: Enemy Name/HP Bar */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] sm:text-[11px] text-red-300 tracking-wider">
            {isBossWave ? '💀' : '👹'} {currentEnemy?.name || 'Inimigo'} <span className="text-purple-300">[Wave {wave}]</span>
          </span>
          <div className={`relative ${isBossWave ? 'w-48 sm:w-64' : 'w-40 sm:w-48'} h-3 sm:h-4 bg-[#0f0f1a]/80 border ${isBossWave ? 'border-red-500' : 'border-red-900/50'} rounded-sm overflow-hidden`}>
            <div
              className={`h-full rounded-sm transition-all duration-200 ${isBossWave ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600' : 'hp-bar'}`}
              style={{ width: `${enemyHpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.max(0, Math.floor(enemyHp))}/{Math.floor(enemyMaxHp)}
            </span>
          </div>
        </div>
      </div>

      {/* === PARALLAX LAYER 1: Background (10% speed) === */}
      {currentBiome.id === 'forest' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-32 pointer-events-none opacity-40"
          style={{ transform: `translateX(${-(scrollOffset * 0.1) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 200" preserveAspectRatio="none">
            <polygon points="0,200 100,80 200,120 300,60 400,100 500,40 600,90 700,50 800,110 900,70 1000,130 1100,50 1200,100 1300,60 1400,120 1500,80 1600,200" fill="#1a1a3e" />
          </svg>
        </div>
      )}
      {currentBiome.id === 'cave' && (
        <div
          className="absolute top-0 left-0 w-[200%] h-24 pointer-events-none opacity-50"
          style={{ transform: `translateX(${-(scrollOffset * 0.1) % 800}px)` }}
        >
          <div className="w-full h-full bg-gradient-to-b from-stone-950 via-stone-900 to-transparent" />
        </div>
      )}
      {currentBiome.id === 'castle' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-40 pointer-events-none opacity-30"
          style={{ transform: `translateX(${-(scrollOffset * 0.1) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 300" preserveAspectRatio="none">
            <rect x="100" y="100" width="80" height="200" fill="#2a1a1a" />
            <rect x="400" y="80" width="60" height="220" fill="#2a1a1a" />
            <rect x="700" y="120" width="70" height="180" fill="#2a1a1a" />
            <rect x="1000" y="90" width="65" height="210" fill="#2a1a1a" />
            <rect x="1300" y="110" width="75" height="190" fill="#2a1a1a" />
          </svg>
        </div>
      )}

      {/* === PARALLAX LAYER 2: Midground (30% speed) === */}
      {currentBiome.id === 'forest' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-28 pointer-events-none opacity-50"
          style={{ transform: `translateX(${-(scrollOffset * 0.3) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 200" preserveAspectRatio="none">
            {[...Array(20)].map((_, i) => (
              <polygon key={i} points={`${i * 80},200 ${i * 80 + 20},100 ${i * 80 + 40},200`} fill="#0a1a0a" />
            ))}
          </svg>
        </div>
      )}
      {currentBiome.id === 'cave' && (
        <div
          className="absolute top-0 left-0 w-[200%] h-20 pointer-events-none opacity-60"
          style={{ transform: `translateX(${-(scrollOffset * 0.3) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 150" preserveAspectRatio="none">
            {[...Array(30)].map((_, i) => (
              <polygon key={i} points={`${i * 50 + 10},0 ${i * 50 + 25},${40 + (i % 3) * 20} ${i * 50 + 40},0`} fill="#1a1a1a" />
            ))}
          </svg>
        </div>
      )}
      {currentBiome.id === 'castle' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-32 pointer-events-none opacity-40"
          style={{ transform: `translateX(${-(scrollOffset * 0.3) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 250" preserveAspectRatio="none">
            <rect x="0" y="50" width="1600" height="200" fill="#1a0a0a" />
            {[...Array(10)].map((_, i) => (
              <rect key={i} x={i * 160} y="30" width="40" height="220" fill="#2a1a1a" />
            ))}
          </svg>
        </div>
      )}

      {/* === PARALLAX LAYER 3: Foreground (50% speed) === */}
      {currentBiome.id === 'forest' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-24 pointer-events-none opacity-60"
          style={{ transform: `translateX(${-(scrollOffset * 0.5) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 200" preserveAspectRatio="none">
            {[...Array(15)].map((_, i) => (
              <g key={i}>
                <rect x={i * 100 + 30} y="100" width="15" height="100" fill="#2a1a0a" />
                <polygon points={`${i * 100},100 ${i * 100 + 37},20 ${i * 100 + 75},100`} fill="#0a2a0a" />
              </g>
            ))}
          </svg>
        </div>
      )}
      {currentBiome.id === 'cave' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-20 pointer-events-none opacity-70"
          style={{ transform: `translateX(${-(scrollOffset * 0.5) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 150" preserveAspectRatio="none">
            {[...Array(20)].map((_, i) => (
              <g key={i}>
                <circle cx={i * 80 + 20} cy={100 + (i % 2) * 20} r="8" fill="#4a2a6a" opacity="0.6" />
                <circle cx={i * 80 + 50} cy={120 + (i % 3) * 10} r="5" fill="#6a4a8a" opacity="0.5" />
              </g>
            ))}
          </svg>
        </div>
      )}
      {currentBiome.id === 'castle' && (
        <div
          className="absolute bottom-16 left-0 w-[200%] h-24 pointer-events-none opacity-50"
          style={{ transform: `translateX(${-(scrollOffset * 0.5) % 800}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 200" preserveAspectRatio="none">
            {[...Array(12)].map((_, i) => (
              <g key={i}>
                <rect x={i * 130} y="80" width="30" height="120" fill="#1a0a0a" />
                <circle cx={i * 130 + 15} cy="60" r="15" fill="#ff4400" opacity="0.3" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* === GROUND WITH TEXTURES === */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-[300%] h-full"
          style={{ transform: `translateX(${-(scrollOffset * 0.8) % 1200}px)` }}
        >
        {/* Forest Ground */}
        {currentBiome.id === 'forest' && (
          <>
            {/* Grass top layer */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-green-600 via-green-700 to-green-800" />
            {/* Grass texture */}
            <div className="absolute top-0 left-0 right-0 h-3 opacity-60">
              <svg className="w-full h-full" viewBox="0 0 800 20" preserveAspectRatio="none">
                {[...Array(100)].map((_, i) => (
                  <line key={i} x1={i * 8} y1="20" x2={i * 8 + 2} y2="5" stroke="#2a5a2a" strokeWidth="1" />
                ))}
              </svg>
            </div>
            {/* Dirt middle layer */}
            <div className="absolute top-3 left-0 right-0 h-4 bg-gradient-to-b from-amber-900 to-amber-950" />
            {/* Roots texture */}
            <div className="absolute top-3 left-0 right-0 h-4 opacity-40">
              <svg className="w-full h-full" viewBox="0 0 800 30" preserveAspectRatio="none">
                {[...Array(20)].map((_, i) => (
                  <path key={i} d={`M${i * 40},0 Q${i * 40 + 10},15 ${i * 40 + 20},30`} stroke="#3a2a1a" strokeWidth="2" fill="none" />
                ))}
              </svg>
            </div>
            {/* Dark base */}
            <div className="absolute bottom-0 left-0 right-0 h-13 bg-gradient-to-b from-stone-950 to-black" />
          </>
        )}

        {/* Cave Ground */}
        {currentBiome.id === 'cave' && (
          <>
            {/* Rock top layer */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-stone-600 via-stone-700 to-stone-800" />
            {/* Rock texture */}
            <div className="absolute top-0 left-0 right-0 h-3 opacity-50">
              <svg className="w-full h-full" viewBox="0 0 800 20" preserveAspectRatio="none">
                {[...Array(50)].map((_, i) => (
                  <circle key={i} cx={i * 16} cy={10 + (i % 3) * 3} r="3" fill="#2a2a2a" />
                ))}
              </svg>
            </div>
            {/* Dark rock middle */}
            <div className="absolute top-3 left-0 right-0 h-4 bg-gradient-to-b from-stone-900 to-stone-950" />
            {/* Crystal cracks */}
            <div className="absolute top-3 left-0 right-0 h-4 opacity-60">
              <svg className="w-full h-full" viewBox="0 0 800 30" preserveAspectRatio="none">
                {[...Array(15)].map((_, i) => (
                  <g key={i}>
                    <line x1={i * 50 + 10} y1="5" x2={i * 50 + 20} y2="25" stroke="#6a4a8a" strokeWidth="1" />
                    <circle cx={i * 50 + 15} cy="15" r="2" fill="#8a6aaa" opacity="0.7" />
                  </g>
                ))}
              </svg>
            </div>
            {/* Dark base */}
            <div className="absolute bottom-0 left-0 right-0 h-13 bg-black" />
          </>
        )}

        {/* Castle Ground */}
        {currentBiome.id === 'castle' && (
          <>
            {/* Stone tiles top */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-stone-500 via-stone-600 to-stone-700" />
            {/* Tile pattern */}
            <div className="absolute top-0 left-0 right-0 h-3 opacity-70">
              <svg className="w-full h-full" viewBox="0 0 800 20" preserveAspectRatio="none">
                {[...Array(40)].map((_, i) => (
                  <rect key={i} x={i * 20} y="0" width="18" height="18" fill="none" stroke="#1a1a1a" strokeWidth="1" />
                ))}
              </svg>
            </div>
            {/* Brick middle */}
            <div className="absolute top-3 left-0 right-0 h-4 bg-gradient-to-b from-stone-800 to-stone-900" />
            {/* Brick pattern */}
            <div className="absolute top-3 left-0 right-0 h-4 opacity-50">
              <svg className="w-full h-full" viewBox="0 0 800 30" preserveAspectRatio="none">
                {[...Array(20)].map((_, i) => (
                  <g key={i}>
                    <rect x={i * 40} y="0" width="38" height="14" fill="none" stroke="#0a0a0a" strokeWidth="1" />
                    <rect x={i * 40 + 20} y="15" width="38" height="14" fill="none" stroke="#0a0a0a" strokeWidth="1" />
                  </g>
                ))}
              </svg>
            </div>
            {/* Fire glow cracks */}
            <div className="absolute top-3 left-0 right-0 h-4 opacity-40">
              <svg className="w-full h-full" viewBox="0 0 800 30" preserveAspectRatio="none">
                {[...Array(10)].map((_, i) => (
                  <circle key={i} cx={i * 80 + 40} cy="15" r="3" fill="#ff4400" opacity="0.6" />
                ))}
              </svg>
            </div>
            {/* Dark base */}
            <div className="absolute bottom-0 left-0 right-0 h-13 bg-gradient-to-b from-stone-950 to-black" />
          </>
        )}

        {/* Pebbles texture overlay (all biomes) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 80" preserveAspectRatio="none">
            {[...Array(100)].map((_, i) => (
              <circle key={i} cx={(i * 37) % 800} cy={(i * 23) % 80} r={1 + (i % 2)} fill="#000" />
            ))}
          </svg>
        </div>
        </div>
      </div>

      {/* Hero - FIXED position (responsive) */}
      <div
        className={`absolute bottom-16 ${
          isMoving ? 'animate-walk' : isAttacking ? 'animate-attack' : 'animate-float'
        } ${heroHitFlash ? 'animate-hero-hit' : ''}`}
        style={{ left: `max(60px, min(${heroX}px, 20%))` }}
      >
        {/* Hero shadow on ground */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-full blur-sm" />
        <div className="relative">
          {/* Hero Name - Above head */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 mb-3 bg-black/80 border border-green-500/60 rounded-sm z-20 pointer-events-none">
            <span className="text-[9px] sm:text-[10px] text-green-300 font-bold">{heroName}</span>
          </div>
          <div className="relative">
            {/* Hit flash overlay */}
            {heroHitFlash && (
              <div className="absolute inset-0 bg-red-500/50 rounded-lg pointer-events-none animate-flash" style={{ zIndex: 5 }} />
            )}
            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 rounded-t-lg relative">
              {/* Shading overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 rounded-t-lg pointer-events-none" />
              {/* Head */}
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-b from-amber-200 to-amber-400 border-2 border-amber-600 rounded-sm">
                <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                <div className="absolute -top-1 left-0 right-0 h-2 bg-amber-700 rounded-t-sm" />
              </div>
              {/* Sword */}
              <div
                className={`absolute -right-3 top-1 w-2 h-10 bg-gradient-to-b from-gray-200 to-gray-400 border border-gray-500 rounded-t-sm sword-swing ${
                  isAttacking ? 'animate-sword-swing' : ''
                }`}
                style={{ transformOrigin: '50% 100%' }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-gray-100 border border-gray-400 rounded-t-full" />
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
        </div>
      </div>

      {/* Enemy - moves from right to left */}
      <div
        className={`absolute bottom-16 transition-opacity duration-500 ${
          isEnemyDead ? 'opacity-0' : ''
        } ${enemyHitFlash ? 'animate-hit' : isMoving ? 'animate-walk' : ''}`}
        style={{ 
          left: `${enemyX}px`,
        }}
      >
        {/* Enemy shadow on ground */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/40 rounded-full blur-sm"
          style={{ transform: `translateX(-50%) scale(${currentEnemy.scale})` }}
        />
        <div className="relative">
          {/* Enemy Name - Above head (inside scaled container) */}
          <div 
            className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 mb-3 bg-black/80 border border-red-500/60 rounded-sm z-20 pointer-events-none ${
              isBossWave ? 'scale-125' : ''
            }`}
            style={{
              filter: isBossWave && currentEnemy.glowColor ? `drop-shadow(0 0 8px ${currentEnemy.glowColor})` : undefined,
            }}
          >
            <span className="text-[9px] sm:text-[10px] text-red-300 font-bold">
              {currentEnemy.name}
            </span>
          </div>
          <div 
            className={`relative`}
            style={{
              transform: `scale(${currentEnemy.scale})`,
              transformOrigin: 'bottom center',
              filter: isBossWave && currentEnemy.glowColor ? `drop-shadow(0 0 12px ${currentEnemy.glowColor})` : undefined,
            }}
          >
            {/* Hit flash overlay */}
            {enemyHitFlash && (
              <div className="absolute inset-0 bg-red-500/50 rounded-lg pointer-events-none animate-flash" style={{ zIndex: 5 }} />
            )}
            {/* Enemy Body */}
            <div className={`w-9 h-12 sm:w-10 sm:h-14 bg-gradient-to-b ${currentEnemy.sprite.bodyColor} border-2 ${currentEnemy.sprite.accentColor} rounded-t-md relative`}>
              {/* Shading overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 rounded-t-md pointer-events-none" />
              {/* Head */}
              <div className={`absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-b ${currentEnemy.sprite.headColor} border-2 ${currentEnemy.sprite.accentColor} rounded-sm`}>
                {/* Eyes */}
                <div className={`absolute top-1.5 left-1 w-2 h-2 ${currentEnemy.sprite.eyeColor} rounded-full`} />
                <div className={`absolute top-1.5 right-1 w-2 h-2 ${currentEnemy.sprite.eyeColor} rounded-full`} />
                {/* Ears/Horns (only for some enemies) */}
                {currentEnemy.id !== 'skeleton' && currentEnemy.id !== 'golem' && (
                  <>
                    <div className={`absolute -left-2 top-0 w-2 h-3 bg-gradient-to-b ${currentEnemy.sprite.headColor} border ${currentEnemy.sprite.accentColor} rounded-sm rotate-[-15deg]`} />
                    <div className={`absolute -right-2 top-0 w-2 h-3 bg-gradient-to-b ${currentEnemy.sprite.headColor} border ${currentEnemy.sprite.accentColor} rounded-sm rotate-[15deg]`} />
                  </>
                )}
                {/* Mouth */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-gray-900 rounded-sm" />
              </div>
              {/* Weapon */}
              <div className="absolute -left-4 top-4 w-3 h-8 bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-950 rounded-sm">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-amber-800 border border-amber-950 rounded-sm" />
              </div>
            </div>
            {/* Legs */}
            <div className="flex justify-center gap-0.5">
              <div className={`w-3 h-2.5 bg-gradient-to-b ${currentEnemy.sprite.bodyColor} border border-black/30 rounded-b-sm ${isMoving ? 'animate-leg-left' : ''}`} />
              <div className={`w-3 h-2.5 bg-gradient-to-b ${currentEnemy.sprite.bodyColor} border border-black/30 rounded-b-sm ${isMoving ? 'animate-leg-right' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD: HP Bar + Skill Bar + XP Bar */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-1 gap-1 z-20">
        {/* HP Bar - Left of Skills */}
        <div className="flex items-center gap-1 bg-[#0f0f1a]/90 border border-[#2d2d5e] rounded-sm px-1 py-1 flex-1 max-w-[200px]">
          <span className="text-sm text-red-400 whitespace-nowrap">❤️</span>
          <div className="relative flex-1 h-7 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm overflow-hidden">
            <div
              className="hp-bar h-full transition-all duration-300 rounded-sm"
              style={{ width: `${Math.max(0, Math.round((heroHp / heroMaxHp) * 100))}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.floor(heroHp)}/{Math.floor(heroMaxHp)}
            </span>
          </div>
        </div>

        {/* Skill Bar - Center */}
        <SkillBar
          skills={skills.filter(s => equippedSkillIds.includes(s.id))}
          activeBuffs={activeBuffs}
          onUseSkill={onUseSkill}
        />

        {/* XP Bar - Right of Skills */}
        <div className="flex items-center gap-1 bg-[#0f0f1a]/90 border border-[#2d2d5e] rounded-sm px-1 py-1 flex-1 max-w-[200px]">
          <span className="text-sm text-blue-400 whitespace-nowrap">⭐</span>
          <div className="relative flex-1 h-7 bg-[#0f0f1a] border border-[#2d2d5e] rounded-sm overflow-hidden">
            <div
              className="xp-bar h-full transition-all duration-300 rounded-sm"
              style={{ width: `${Math.max(0, Math.round((heroXp / heroMaxXp) * 100))}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.floor(heroXp)}/{Math.floor(heroMaxXp)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Buffs Indicator */}
      {activeBuffs.length > 0 && (
        <div className="absolute top-12 left-3 flex flex-col gap-1">
          {activeBuffs.map((buff) => {
            const skill = skills.find(s => s.id === buff.skillId);
            const timeLeft = Math.max(0, Math.ceil((buff.expiresAt - Date.now()) / 1000));
            return (
              <div key={buff.id} className="flex items-center gap-1 bg-yellow-900/40 border border-yellow-600/50 rounded-sm px-1.5 py-0.5 animate-pulse-glow">
                <span className="text-[10px]">{skill?.icon}</span>
                <span className="text-[7px] text-yellow-300">{timeLeft}s</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Damage Popups */}
      {damagePopups.map((popup) => (
        <div
          key={popup.id}
          className={`absolute pointer-events-none animate-damage-float font-bold ${
            popup.isSkill
              ? popup.isHeal
                ? 'text-emerald-300 text-[14px]'
                : 'text-orange-300 text-[14px]'
              : popup.isHeal
              ? 'text-green-400 text-[11px]'
              : popup.isCrit
              ? 'text-orange-400 text-[13px]'
              : 'text-yellow-300 text-[10px]'
          }`}
          style={{
            left: `${popup.x}px`,
            bottom: '110px',
            textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)',
          }}
        >
          {popup.isHeal ? '+' : '-'}{popup.value}
          {popup.isCrit && ' CRIT!'}
          {popup.isSkill && !popup.isHeal && ' 💥'}
        </div>
      ))}

      {/* Respawning phase indicator */}
      {gamePhase === 'respawning' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow">
          <div className="bg-black/80 border-2 border-red-500/70 rounded-md px-6 py-4 flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <span className="text-[14px] text-red-400 font-bold">💀 DERROTADO!</span>
            <span className="text-[10px] text-gray-300">Recuando para treinar...</span>
            <div className="w-32 h-1.5 bg-[#0f0f1a] border border-red-900/50 rounded-sm overflow-hidden mt-1">
              <div className="h-full bg-red-500 animate-waiting-bar" style={{ animationDuration: '2s' }} />
            </div>
            <span className="text-[8px] text-gray-400">Recuperando HP...</span>
          </div>
        </div>
      )}

      {/* Zone and Wave indicators moved to top container */}




    </div>
  );
};

export default GameViewport;
