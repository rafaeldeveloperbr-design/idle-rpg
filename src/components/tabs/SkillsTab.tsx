import React from 'react';
import type { Skill } from '../../App';
import { GoldIcon } from '../../App';

interface SkillsTabProps {
  skills: Skill[];
  heroGold: number;
  equippedSkillIds: string[];
  onUpgradeSkill: (skillId: string) => void;
  onToggleAutoCast: (skillId: string) => void;
  onEquipSkill: (skillId: string) => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  heroGold,
  equippedSkillIds,
  onUpgradeSkill,
  onToggleAutoCast,
  onEquipSkill,
}) => {
  const unlockedSkills = skills.filter(s => s.unlocked);

  return (
    <div className="p-4">
      <h3 className="text-sm text-purple-300 mb-4 flex items-center gap-2">
        <span>⚡</span> Habilidades
      </h3>
      
      {/* Deck Section */}
      <div className="mb-4">
        <h4 className="text-xs text-purple-300 mb-2">Deck Equipado ({equippedSkillIds.length}/3)</h4>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((slot) => {
            const skillId = equippedSkillIds[slot];
            const skill = skills.find(s => s.id === skillId);
            
            return (
              <div
                key={slot}
                className={`border-2 rounded-md p-2 flex flex-col items-center gap-1 min-h-[80px] ${
                  skill
                    ? 'border-purple-500 bg-purple-900/20 cursor-pointer hover:bg-purple-900/30'
                    : 'border-[#2d2d5e] bg-[#0a0a12]'
                }`}
                onClick={() => skill && onEquipSkill(skill.id)}
              >
                {skill ? (
                  <>
                    <span className="text-xl">{skill.icon}</span>
                    <span className="text-[10px] text-purple-300 text-center">{skill.name}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-600">Vazio</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills List */}
      <h4 className="text-xs text-gray-400 mb-2">Habilidades Desbloqueadas</h4>
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
                {/* Equip/Unequip button */}
                <button
                  onClick={() => onEquipSkill(skill.id)}
                  className={`pixel-btn text-xs px-2 py-2 rounded-sm ${
                    equippedSkillIds.includes(skill.id)
                      ? 'text-red-300 border-red-500/50 bg-red-900/20'
                      : 'text-blue-300 border-blue-500/50 bg-blue-900/20'
                  }`}
                >
                  {equippedSkillIds.includes(skill.id) ? '❌' : '✅'}
                </button>

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
                    className={`pixel-btn text-xs px-3 py-2 rounded-sm flex items-center gap-1 ${
                      canAfford
                        ? 'text-yellow-300 hover:border-yellow-400'
                        : 'text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <GoldIcon size="sm" /> {skill.cost}
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
