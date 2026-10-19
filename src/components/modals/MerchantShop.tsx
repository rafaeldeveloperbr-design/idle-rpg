import React, { useState } from 'react';
import type { Skill, Consumable } from '../../App';

interface MerchantShopProps {
  skills: Skill[];
  consumables: Consumable[];
  heroGold: number;
  heroLevel: number;
  equippedSkillIds: string[];
  onBuySkill: (skillId: string) => void;
  onBuyConsumable: (consumableId: string) => void;
  onEquipSkill: (skillId: string) => void;
  onClose: () => void;
}

const MerchantShop: React.FC<MerchantShopProps> = ({
  skills,
  consumables,
  heroGold,
  heroLevel,
  equippedSkillIds,
  onBuySkill,
  onBuyConsumable,
  onEquipSkill,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'consumables'>('skills');

  const unlockedSkills = skills.filter(s => s.unlocked);
  const lockedSkills = skills.filter(s => !s.unlocked);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#0f0f1a] border-2 border-yellow-500/70 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(234,179,8,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-500/30">
          <h2 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
            <span>🏪</span> Mercado do Mercador
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#1a1a2e] px-3 py-1.5 border border-yellow-500/50 rounded-sm">
              <span className="text-sm">🪙</span>
              <span className="text-xs text-yellow-400 font-bold">{heroGold.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-yellow-500/30">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3 text-sm transition-all border-b-2 ${
              activeTab === 'skills'
                ? 'text-yellow-300 border-yellow-500 bg-yellow-900/20'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            ⚔️ Habilidades
          </button>
          <button
            onClick={() => setActiveTab('consumables')}
            className={`flex-1 py-3 text-sm transition-all border-b-2 ${
              activeTab === 'consumables'
                ? 'text-yellow-300 border-yellow-500 bg-yellow-900/20'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            🧪 Consumíveis
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Equipped Skills Section */}
              <div>
                <h3 className="text-sm text-yellow-300 mb-2">Deck Equipado ({equippedSkillIds.length}/3)</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[0, 1, 2].map((slot) => {
                    const skillId = equippedSkillIds[slot];
                    const skill = skills.find(s => s.id === skillId);
                    
                    return (
                      <div
                        key={slot}
                        className={`border-2 rounded-md p-3 flex flex-col items-center gap-1 min-h-[100px] ${
                          skill
                            ? 'border-purple-500 bg-purple-900/20 cursor-pointer hover:bg-purple-900/30'
                            : 'border-[#2d2d5e] bg-[#0a0a12]'
                        }`}
                        onClick={() => skill && onEquipSkill(skill.id)}
                      >
                        {skill ? (
                          <>
                            <span className="text-2xl">{skill.icon}</span>
                            <span className="text-xs text-purple-300 text-center">{skill.name}</span>
                            <span className="text-[10px] text-gray-400">Clique para remover</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-600">Slot Vazio</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unlocked Skills */}
              {unlockedSkills.length > 0 && (
                <div>
                  <h3 className="text-sm text-green-300 mb-2">Habilidades Desbloqueadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {unlockedSkills.map((skill) => {
                      const isEquipped = equippedSkillIds.includes(skill.id);
                      
                      return (
                        <div
                          key={skill.id}
                          className={`border rounded-md p-3 flex items-start gap-3 transition-colors ${
                            isEquipped
                              ? 'border-purple-500 bg-purple-900/20'
                              : 'border-[#2d2d5e] bg-[#0f0f1a] hover:border-purple-500'
                          }`}
                        >
                          <span className="text-2xl">{skill.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-200 font-bold">{skill.name}</span>
                              <span className="text-[10px] text-blue-300">Nv.{skill.level}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{skill.description}</p>
                            <button
                              onClick={() => onEquipSkill(skill.id)}
                              className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                                isEquipped
                                  ? 'bg-red-600 hover:bg-red-500 text-white'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                              }`}
                            >
                              {isEquipped ? 'Remover do Deck' : 'Equipar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Locked Skills */}
              {lockedSkills.length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Habilidades para Comprar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {lockedSkills.map((skill) => {
                      const canAfford = heroGold >= skill.cost;
                      const levelRequired = skill.requiredLevel || 1;
                      const levelMet = heroLevel >= levelRequired;
                      const canBuy = canAfford && levelMet;

                      return (
                        <div
                          key={skill.id}
                          className={`border rounded-md p-3 flex items-start gap-3 transition-colors ${
                            canBuy
                              ? 'border-yellow-500/50 bg-yellow-900/10 hover:bg-yellow-900/20'
                              : 'border-[#2d2d5e] bg-[#0a0a12] opacity-60'
                          }`}
                        >
                          <span className="text-2xl">{skill.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-200 font-bold">{skill.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{skill.description}</p>
                            {!levelMet && (
                              <p className="text-[10px] text-red-400 mb-2">
                                🔒 Desbloqueia no Nv. {levelRequired}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                🪙 {skill.cost}
                              </span>
                              <button
                                onClick={() => onBuySkill(skill.id)}
                                disabled={!canBuy}
                                className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                                  canBuy
                                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                Comprar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'consumables' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {consumables.map((consumable) => {
                const canAfford = heroGold >= consumable.cost;
                const levelMet = heroLevel >= consumable.requiredLevel;
                const canBuy = canAfford && levelMet;

                return (
                  <div
                    key={consumable.id}
                    className={`border rounded-md p-3 flex items-start gap-3 transition-colors ${
                      canBuy
                        ? 'border-green-500/50 bg-green-900/10 hover:bg-green-900/20'
                        : 'border-[#2d2d5e] bg-[#0a0a12] opacity-60'
                    }`}
                  >
                    <span className="text-3xl">{consumable.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-200 font-bold mb-1">{consumable.name}</div>
                      <p className="text-xs text-gray-400 mb-2">{consumable.description}</p>
                      {!levelMet && (
                        <p className="text-[10px] text-red-400 mb-2">
                          🔒 Desbloqueia no Nv. {consumable.requiredLevel}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                          🪙 {consumable.cost}
                        </span>
                        <button
                          onClick={() => onBuyConsumable(consumable.id)}
                          disabled={!canBuy}
                          className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                            canBuy
                              ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Usar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantShop;
