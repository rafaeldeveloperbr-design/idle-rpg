import React, { useState } from 'react';
import type { Item, Equipment, HeroAttributes } from '../../App';

interface InventoryTabProps {
  inventory: Item[];
  equipment: Equipment;
  onEquipItem: (itemId: string) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
  onSellItem: (itemId: string) => void;
}

const rarityColors: Record<string, string> = {
  common: 'border-gray-500 bg-gray-900/30',
  rare: 'border-blue-500 bg-blue-900/20',
  epic: 'border-purple-500 bg-purple-900/20',
};

const rarityTextColors: Record<string, string> = {
  common: 'text-gray-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
};

const rarityLabels: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
};

const slotLabels: Record<string, string> = {
  weapon: '⚔️ Arma',
  armor: '🛡️ Armadura',
  accessory: '💍 Acessório',
};

const attributeLabels: Record<keyof HeroAttributes, string> = {
  attack: 'Ataque',
  defense: 'Defesa',
  maxHp: 'Vida Max',
  speed: 'Velocidade',
  critChance: 'Crítico',
  regen: 'Regen',
};

const attributeIcons: Record<keyof HeroAttributes, string> = {
  attack: '⚔️',
  defense: '🛡️',
  maxHp: '❤️',
  speed: '💨',
  critChance: '🎯',
  regen: '💚',
};

// === Tooltip Component ===
const ItemTooltip: React.FC<{ item: Item; action?: string }> = ({ item, action }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 bg-[#0f0f1a] border-2 border-purple-500/70 rounded-md p-3 shadow-[0_0_15px_rgba(139,92,246,0.3)] pointer-events-none z-50">
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
      <div className="w-2 h-2 bg-[#0f0f1a] border-r-2 border-b-2 border-purple-500/70 rotate-45 -translate-y-1" />
    </div>
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-base">{item.icon}</span>
        <span className={`text-[11px] font-bold ${rarityTextColors[item.rarity]}`}>
          {item.name}
        </span>
      </div>
      <div className="h-[1px] bg-purple-500/30 w-full" />
      <span className={`text-[9px] ${rarityTextColors[item.rarity]}`}>
        {rarityLabels[item.rarity]} • {slotLabels[item.slot]}
      </span>
      <div className="flex flex-col gap-1 mt-1">
        {Object.entries(item.bonuses).map(([key, value]) => (
          <div key={key} className="flex justify-between text-[9px]">
            <span className="text-gray-400">
              {attributeIcons[key as keyof HeroAttributes]} {attributeLabels[key as keyof HeroAttributes]}:
            </span>
            <span className="text-green-300">+{value}</span>
          </div>
        ))}
      </div>
      <div className="h-[1px] bg-purple-500/30 w-full mt-1" />
      <div className="flex justify-between text-[9px]">
        <span className="text-gray-400">Valor de venda:</span>
        <span className="text-yellow-300">🪙 {item.sellValue}</span>
      </div>
      {action && (
        <span className="text-[8px] text-center text-purple-300 mt-1 italic">
          {action}
        </span>
      )}
    </div>
  </div>
);

const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onSellItem,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const slots: (keyof Equipment)[] = ['weapon', 'armor', 'accessory'];

  return (
    <div className="p-4">
      <h3 className="text-[12px] text-purple-300 mb-4 flex items-center gap-2">
        <span>🎒</span> Inventário & Equipamentos
      </h3>

      {/* Equipment Slots (Paperdoll) */}
      <div className="mb-4">
        <span className="text-[10px] text-gray-400 mb-2 block">Equipamentos:</span>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot) => {
            const item = equipment[slot];
            const isHovered = hoveredSlot === slot;

            return (
              <div key={slot} className="relative">
                {isHovered && item && (
                  <ItemTooltip item={item} action="Clique para desequipar" />
                )}
                <button
                  onClick={() => item && onUnequipItem(slot)}
                  onMouseEnter={() => setHoveredSlot(slot)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  className={`w-full border-2 rounded-md p-3 flex flex-col items-center gap-1.5 transition-all min-h-[80px] ${
                    item
                      ? `${rarityColors[item.rarity]} cursor-pointer hover:brightness-125`
                      : 'border-[#2d2d5e] bg-[#0a0a12] cursor-default'
                  }`}
                >
                  <span className="text-[9px] text-gray-500">{slotLabels[slot]}</span>
                  {item ? (
                    <>
                      <span className="text-xl">{item.icon}</span>
                      <span className={`text-[9px] ${rarityTextColors[item.rarity]} text-center`}>
                        {item.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-gray-700 mt-2">— Vazio —</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-gray-400">Itens ({inventory.length}/20):</span>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {inventory.map((item) => {
            const isHovered = hoveredItem === item.id;
            return (
              <div key={item.id} className="relative">
                {isHovered && (
                  <ItemTooltip item={item} action="Clique para equipar" />
                )}
                <div className="relative group">
                  <button
                    onClick={() => onEquipItem(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full aspect-square border-2 rounded-md flex flex-col items-center justify-center gap-1 transition-all hover:brightness-125 ${rarityColors[item.rarity]}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`text-[7px] ${rarityTextColors[item.rarity]} text-center leading-tight px-1`}>
                      {item.name}
                    </span>
                  </button>
                  {/* Sell button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSellItem(item.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border border-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Vender por 🪙 ${item.sellValue}`}
                  >
                    <span className="text-[8px] text-white">💰</span>
                  </button>
                </div>
              </div>
            );
          })}
          {/* Empty slots */}
          {[...Array(Math.max(0, 20 - inventory.length))].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square bg-[#0a0a12] border border-[#1a1a2e] rounded-md flex items-center justify-center"
            >
              <span className="text-[10px] text-gray-800">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
