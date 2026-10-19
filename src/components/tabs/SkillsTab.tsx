import React from 'react';
import type { Skill } from '../../App';

interface SkillsTabProps {
  skills: Skill[];
  heroGold: number;
  onUpgradeSkill: (skillId: string) => void;
  onToggleAutoCast: (skillId: string) => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  heroGold,
  onUpgradeSkill,
  onToggleAutoCast,
}) => {
  return (
    <div className="p-4">
      <h3 className="text-sm text-purple-300 mb-4 flex items-center gap-2">
        <span>⚡</span> Habilidades
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {skills.map((skill) => {
          const now = Date.now();
          const cooldownMs = skill.cooldown * 1000;
          const timeSinceUse = now - skill.lastUsed;
          const isOnCooldown = timeSinceUse < cooldownMs;
          const cooldownRemaining = isOnCooldown
            ? Math.ceil((cooldownMs - timeSinceUse) / 1000)
            : 0;
          const canAfford = heroGold >= skill.cost;
          const isMaxLevel = skill.level >= skill.maxLevel;

          return (
            <div
              key={skill.id}
              className={`border rounded-md p-3 flex flex-col gap-2 transition-colors hover:border-purple-500 hover:bg-[#16213e]/40 ${
                skill.unlocked
                  ? 'bg-[#0f0f1a] border-[#2d2d5e]'
                  : 'bg-[#0a0a12] border-[#1a1a2e] opacity-60'
              }`}
            >
              {/* Header: Icon + Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{skill.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200">{skill.name}</span>
                    <span className="text-xs text-blue-300">
                      Nv. {skill.level}/{skill.maxLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <span className="text-xs text-gray-500">{skill.description}</span>

              {/* Stats */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-300">CD: {skill.cooldown}s</span>
                <span className="text-gray-400">|</span>
                <span className="text-yellow-300">
                  {skill.effect === 'damage' && `${Math.round(skill.effectValue * 100)}% dano`}
                  {skill.effect === 'heal' && `${Math.round(skill.effectValue * 100)}% HP`}
                  {skill.effect === 'buff' && `${Math.round(skill.effectValue * 100)}% ATK (${skill.buffDuration}s)`}
                </span>
              </div>

              {/* Cooldown Bar */}
              {isOnCooldown && (
                <div className="w-full h-2 bg-[#1a1a2e] rounded-sm overflow-hidden border border-[#2d2d5e]">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{
                      width: `${((cooldownMs - timeSinceUse) / cooldownMs) * 100}%`,
                    }}
                  />
                </div>
              )}
              {isOnCooldown && (
                <span className="text-xs text-purple-300 text-center">
                  ⏳ {cooldownRemaining}s
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-2 gap-2">
                {/* Auto-cast toggle */}
                <button
                  onClick={() => onToggleAutoCast(skill.id)}
                  className={`pixel-btn text-xs px-3 py-2 rounded-sm flex items-center gap-1 ${
                    skill.autoCast
                      ? 'text-green-300 border-green-500/50 bg-green-900/20'
                      : 'text-gray-500'
                  }`}
                  title={skill.autoCast ? 'Auto-cast ATIVO' : 'Auto-cast DESATIVADO'}
                >
                  <span>⚡</span>
                  <span>Auto</span>
                </button>

                {/* Upgrade button */}
                {skill.unlocked && !isMaxLevel ? (
                  <button
                    onClick={() => onUpgradeSkill(skill.id)}
                    disabled={!canAfford}
                    className={`pixel-btn text-xs px-3 py-2 rounded-sm ${
                      canAfford
                        ? 'text-yellow-300 hover:border-yellow-400'
                        : 'text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    🪙 {skill.cost}
                  </button>
                ) : isMaxLevel ? (
                  <span className="text-xs text-purple-400 px-3 py-2">MAX</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsTab;
