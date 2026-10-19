import React, { useState } from 'react';
import type { DamagePopup, Skill, ActiveBuff, Biome } from '../App';

type GamePhase = 'approaching' | 'fighting' | 'waiting' | 'respawning';

interface GameViewportProps {
  heroX: number;
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
  activeBuffs: ActiveBuff[];
  onUseSkill: (skillId: string) => void;
  currentBiome: Biome;
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
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
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
  activeBuffs,
  onUseSkill,
  currentBiome,
  isBossWave,
  biomeKills,
}) => {
  const enemyHpPercent = Math.max(0, Math.round((enemyHp / enemyMaxHp) * 100));
  const isMoving = gamePhase === 'approaching';
  const isAttacking = gamePhase === 'fighting' && enemyHp > 0;
  const isWaiting = gamePhase === 'waiting';
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
            {isBossWave ? '💀' : '👹'} {isBossWave ? 'CHEFÃO' : 'Goblin Selvagem'} <span className="text-purple-300">[Wave {wave}]</span>
          </span>
          <div className={`relative ${isBossWave ? 'w-48 sm:w-64' : 'w-40 sm:w-48'} h-3 sm:h-4 bg-[#0f0f1a]/80 border ${isBossWave ? 'border-red-500' : 'border-red-900/50'} rounded-sm overflow-hidden`}>
            <div
              className={`h-full rounded-sm transition-all duration-200 ${isBossWave ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600' : 'hp-bar'}`}
              style={{ width: `${enemyHpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.max(0, enemyHp)}/{enemyMaxHp}
            </span>
          </div>
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
          background: `repeating-linear-gradient(90deg, ${currentBiome.theme.groundColor.includes('green') ? '#3d2b1f' : currentBiome.theme.groundColor.includes('stone') ? '#4a4a4a' : '#4a1a1a'} 0px, ${currentBiome.theme.groundColor.includes('green') ? '#4a3728' : currentBiome.theme.groundColor.includes('stone') ? '#5a5a5a' : '#5a2a2a'} 4px, ${currentBiome.theme.groundColor.includes('green') ? '#3d2b1f' : currentBiome.theme.groundColor.includes('stone') ? '#4a4a4a' : '#4a1a1a'} 8px)`,
        }}
      >
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-b ${currentBiome.theme.groundColor} opacity-80`} />
        {[0, 400, 800, 1200].map((offset) => (
          <React.Fragment key={offset}>
            <div className="absolute top-3 w-3 h-1 bg-amber-900/40 rounded-full" style={{ left: `${offset + 40}px` }} />
            <div className="absolute top-5 w-2 h-1 bg-amber-900/30 rounded-full" style={{ left: `${offset + 120}px` }} />
            <div className="absolute top-4 w-4 h-1 bg-amber-900/40 rounded-full" style={{ left: `${offset + 240}px` }} />
            <div className="absolute top-6 w-2 h-1 bg-amber-900/30 rounded-full" style={{ left: `${offset + 320}px` }} />
          </React.Fragment>
        ))}
      </div>

      {/* Hero - FIXED position (responsive) */}
      <div
        className={`absolute bottom-16 ${
          isMoving ? 'animate-walk' : isAttacking ? 'animate-attack' : 'animate-float'
        } ${heroHitFlash ? 'animate-hero-hit' : ''}`}
        style={{ left: `max(60px, min(${heroX}px, 20%))` }}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Hit flash overlay */}
            {heroHitFlash && (
              <div className="absolute inset-0 bg-red-500/50 rounded-lg pointer-events-none animate-flash" style={{ zIndex: 5 }} />
            )}
            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 rounded-t-lg relative">
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
          <span className="text-[8px] text-green-300 mt-1 bg-black/50 px-1 rounded">Herói</span>
        </div>
      </div>

      {/* Enemy - moves from right to left */}
      <div
        className={`absolute bottom-16 transition-opacity duration-500 ${
          isEnemyDead ? 'opacity-0' : ''
        } ${enemyHitFlash ? 'animate-hit' : isMoving ? 'animate-walk' : ''} ${
          isBossWave ? 'scale-125' : ''
        }`}
        style={{ 
          left: `${enemyX}px`,
          filter: isBossWave ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' : undefined,
        }}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Hit flash overlay */}
            {enemyHitFlash && (
              <div className="absolute inset-0 bg-red-500/50 rounded-lg pointer-events-none animate-flash" style={{ zIndex: 5 }} />
            )}
            <div className="w-9 h-12 sm:w-10 sm:h-14 bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-400 rounded-t-md relative">
              {/* Head */}
              <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-b from-green-400 to-green-600 border-2 border-green-800 rounded-sm">
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

      {/* Skill Bar - Quick Access (positioned near the ground) */}
      <SkillBar
        skills={skills.filter(s => s.unlocked)}
        activeBuffs={activeBuffs}
        onUseSkill={onUseSkill}
      />

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

      {/* Waiting phase indicator */}
      {isWaiting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-waiting-pulse">
          <div className="bg-black/70 border-2 border-yellow-500/50 rounded-md px-4 py-2 flex flex-col items-center gap-1 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <span className="text-[10px] text-yellow-400">⚔️ Vitória!</span>
            <span className="text-[8px] text-gray-300">Próximo inimigo em breve...</span>
            <div className="w-24 h-1 bg-[#0f0f1a] border border-yellow-900/50 rounded-sm overflow-hidden mt-1">
              <div className="h-full bg-yellow-500 animate-waiting-bar" />
            </div>
          </div>
        </div>
      )}

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

      {/* Boss Wave Banner */}
      {isBossWave && isMoving && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none animate-pulse-glow">
          <div className="bg-red-900/80 border-2 border-red-500 rounded-md px-4 py-2 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <span className="text-[12px] text-red-200 font-bold">💀 CHEFÃO SE APROXIMA! 💀</span>
          </div>
        </div>
      )}

      {/* Phase indicator */}
      <div className="absolute bottom-[72px] left-4 bg-black/60 border border-[#2d2d5e] rounded-sm px-3 py-1">
        <span className={`text-[9px] ${
          gamePhase === 'approaching' ? 'text-cyan-300' :
          gamePhase === 'fighting' ? (isBossWave ? 'text-red-400' : 'text-red-300') :
          gamePhase === 'respawning' ? 'text-red-500' :
          'text-yellow-300'
        }`}>
          {gamePhase === 'approaching' ? (isBossWave ? '💀 Chefão se aproximando' : '🚶 Aproximando') :
           gamePhase === 'fighting' ? (isBossWave ? '💀 COMBATE DE CHEFÃO' : '⚔️ Combate') :
           gamePhase === 'respawning' ? '💀 DERROTADO - Recuperação' :
           '💤 Aguardando'}
        </span>
      </div>
    </div>
  );
};

export default GameViewport;
