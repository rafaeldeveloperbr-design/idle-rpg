import React from 'react';
import type { HeroAttributes, AttributeCosts } from '../../App';

interface AttributesTabProps {
  heroAttributes: HeroAttributes;
  attributeCosts: AttributeCosts;
  heroGold: number;
  onUpgradeAttribute: (attribute: keyof HeroAttributes) => void;
}

const AttributesTab: React.FC<AttributesTabProps> = ({
  heroAttributes,
  attributeCosts,
  heroGold,
  onUpgradeAttribute,
}) => {
  const attributes = [
    { 
      key: 'attack' as keyof HeroAttributes, 
      name: 'Ataque', 
      icon: '⚔️', 
      value: heroAttributes.attack, 
      upgrade: '+5',
      description: 'Aumenta o dano causado'
    },
    { 
      key: 'defense' as keyof HeroAttributes, 
      name: 'Defesa', 
      icon: '🛡️', 
      value: heroAttributes.defense, 
      upgrade: '+3',
      description: 'Reduz dano recebido'
    },
    { 
      key: 'maxHp' as keyof HeroAttributes, 
      name: 'Vida Max', 
      icon: '❤️', 
      value: heroAttributes.maxHp, 
      upgrade: '+20',
      description: 'Aumenta vida máxima'
    },
    { 
      key: 'speed' as keyof HeroAttributes, 
      name: 'Velocidade', 
      icon: '💨', 
      value: heroAttributes.speed, 
      upgrade: '+2',
      description: 'Aumenta velocidade de ataque'
    },
    { 
      key: 'critChance' as keyof HeroAttributes, 
      name: 'Crítico', 
      icon: '🎯', 
      value: heroAttributes.critChance, 
      upgrade: '+1%',
      description: 'Chance de dano dobrado'
    },
    { 
      key: 'regen' as keyof HeroAttributes, 
      name: 'Regeneração', 
      icon: '💚', 
      value: heroAttributes.regen, 
      upgrade: '+1/s',
      description: 'Recupera HP ao longo do tempo'
    },
  ];

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-sm text-purple-300 mb-3 sm:mb-4 flex items-center gap-2">
        <span>📊</span> Atributos do Personagem
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {attributes.map((attr) => {
          const cost = attributeCosts[attr.key];
          const canAfford = heroGold >= cost;
          
          return (
            <div
              key={attr.key}
              className="bg-[#0f0f1a] border border-[#2d2d5e] border-b-2 border-b-purple-900/50 rounded-md p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2 hover:border-purple-500 hover:bg-[#16213e]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{attr.icon}</span>
                <span className="text-xs text-gray-400">{Math.round(attr.value)}</span>
              </div>
              <span className="text-sm text-gray-200">{attr.name}</span>
              <span className="text-xs text-gray-500">{attr.description}</span>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                  🪙 {Math.round(cost)}
                </span>
                <button
                  onClick={() => onUpgradeAttribute(attr.key)}
                  disabled={!canAfford}
                  className={`pixel-btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm ${
                    canAfford 
                      ? 'text-green-300 hover:border-green-400' 
                      : 'text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  {attr.upgrade}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttributesTab;
