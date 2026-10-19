import React, { useState } from 'react';
import type { Item, Equipment, HeroAttributes } from '../../App';
import { GoldIcon } from '../../App';

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

const upgradeLevelColors: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-green-400',
  2: 'text-blue-400',
  3: 'text-purple-400',
  4: 'text-orange-400',
  5: 'text-red-400', // Legendary
};

const upgradeLevelGlow: Record<number, string> = {
  0: '',
  1: 'shadow-[0_0_5px_rgba(34,197,94,0.3)]',
  2: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
  3: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  4: 'shadow-[0_0_12px_rgba(251,146,60,0.6)]',
  5: 'shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse', // Legendary glow
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

const slotIcons: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
};

// === Utility Functions ===
const calculateTotalBonus = (item: Item | null): number => {
  if (!item) return 0;
  return Object.values(item.bonuses).reduce((sum, value) => sum + (value as number), 0);
};

const isUpgrade = (item: Item, equipment: Equipment): boolean => {
  const equippedItem = equipment[item.slot];
  
  // If slot is empty, any item is an upgrade
  if (!equippedItem) return true;
  
  // Compare total bonuses
  const itemTotal = calculateTotalBonus(item);
  const equippedTotal = calculateTotalBonus(equippedItem);
  
  return itemTotal > equippedTotal;
};

// === Item Modal Component ===
interface ItemModalProps {
  item: Item;
  equippedItem: Item | null;
  isFromInventory: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  onSell: () => void;
  onClose: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({
  item,
  equippedItem,
  isFromInventory,
  onEquip,
  onUnequip,
  onSell,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0f0f1a] border-2 border-purple-500/70 rounded-lg max-w-sm w-full shadow-[0_0_30px_rgba(139,92,246,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className={`text-base font-bold ${item.upgradeLevel && item.upgradeLevel > 0 ? upgradeLevelColors[item.upgradeLevel] : rarityTextColors[item.rarity]}`}>
                {item.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${rarityTextColors[item.rarity]}`}>
                  {rarityLabels[item.rarity]} • {slotLabels[item.slot]}
                </span>
                {item.upgradeLevel && item.upgradeLevel > 0 && (
                  <span className={`text-xs font-bold ${upgradeLevelColors[item.upgradeLevel]}`}>
                    {item.upgradeLevel === 5 ? '🌟 LENDÁRIO' : `+${item.upgradeLevel}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Item Attributes */}
          <div className="mb-4">
            <h4 className="text-sm text-gray-400 mb-2">Atributos:</h4>
            <div className="flex flex-col gap-2">
              {Object.entries(item.bonuses).map(([key, value]) => {
                const attrKey = key as keyof HeroAttributes;
                const equippedValue = equippedItem?.bonuses[attrKey] || 0;
                const diff = (value as number) - equippedValue;
                
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 flex items-center gap-2">
                      <span>{attributeIcons[attrKey]}</span>
                      <span>{attributeLabels[attrKey]}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-300">+{Math.round(value as number)}</span>
                      {equippedItem && diff !== 0 && (
                        <span className={`text-xs ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ({diff > 0 ? '+' : ''}{Math.round(diff)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison with equipped item */}
          {equippedItem && (
            <div className="mb-4 p-3 bg-[#1a1a2e] rounded-md border border-[#2d2d5e]">
              <h4 className="text-xs text-gray-400 mb-2">Comparação com item equipado:</h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">{equippedItem.icon}</span>
                <span className={rarityTextColors[equippedItem.rarity]}>
                  {equippedItem.name}
                </span>
              </div>
            </div>
          )}

          {/* Sell Value */}
          <div className="flex items-center justify-between text-sm mb-4 p-3 bg-[#1a1a2e] rounded-md border border-[#2d2d5e]">
            <span className="text-gray-400">Valor de venda:</span>
            <span className="text-yellow-300 font-bold flex items-center gap-1">
              <GoldIcon size="sm" /> {Math.round(item.sellValue)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {isFromInventory ? (
              <>
                <button
                  onClick={onEquip}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md transition-colors text-sm"
                >
                  Equipar
                </button>
                <button
                  onClick={onSell}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md transition-colors text-sm flex items-center justify-center gap-1"
                >
                  Vender (<GoldIcon size="sm" /> {Math.round(item.sellValue)})
                </button>
              </>
            ) : (
              <button
                onClick={onUnequip}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition-colors text-sm"
              >
                Desequipar
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md transition-colors text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onSellItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<{ item: Item; fromSlot: keyof Equipment | null } | null>(null);

  const slots: (keyof Equipment)[] = ['weapon', 'armor', 'accessory'];

  const handleItemClick = (item: Item, fromSlot: keyof Equipment | null) => {
    setSelectedItem({ item, fromSlot });
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleEquip = () => {
    if (selectedItem) {
      onEquipItem(selectedItem.item.id);
      setSelectedItem(null);
    }
  };

  const handleUnequip = () => {
    if (selectedItem && selectedItem.fromSlot) {
      onUnequipItem(selectedItem.fromSlot);
      setSelectedItem(null);
    }
  };

  const handleSell = () => {
    if (selectedItem) {
      onSellItem(selectedItem.item.id);
      setSelectedItem(null);
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-sm text-purple-300 mb-3 sm:mb-4 flex items-center gap-2">
        <span>🎒</span> Inventário & Equipamentos
      </h3>

      {/* Equipment Slots (Paperdoll) */}
      <div className="mb-4">
        <span className="text-xs text-gray-400 mb-2 block">Equipamentos:</span>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {slots.map((slot) => {
            const item = equipment[slot];

            return (
              <button
                key={slot}
                onClick={() => item && handleItemClick(item, slot)}
                className={`w-full border-2 rounded-md p-2 sm:p-3 flex flex-col items-center gap-1.5 transition-colors min-h-[80px] ${
                  item
                    ? `${rarityColors[item.rarity]} cursor-pointer hover:border-purple-500`
                    : 'border-[#2d2d5e] bg-[#0a0a12] cursor-default'
                }`}
              >
                <span className="text-xs text-gray-500">{slotLabels[slot]}</span>
                {item ? (
                  <>
                    <span className="text-xl">{item.icon}</span>
                    <span className={`text-xs ${rarityTextColors[item.rarity]} text-center`}>
                      {item.name}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-700 mt-2">— Vazio —</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Grid */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-xs text-gray-400">Itens ({inventory.length}/20):</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {inventory.map((item) => {
            const isItemUpgrade = isUpgrade(item, equipment);
            const upgradeLevel = item.upgradeLevel || 0;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item, null)}
                className={`w-full aspect-square border-2 rounded-md flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors hover:border-purple-500 relative ${rarityColors[item.rarity]} ${upgradeLevelGlow[upgradeLevel]}`}
              >
                {/* Slot Badge - Bottom Left */}
                <div className="absolute bottom-0.5 left-0.5 text-[8px] sm:text-[9px] bg-black/60 rounded px-0.5">
                  {slotIcons[item.slot]}
                </div>
                
                {/* Upgrade Indicator - Top Right */}
                {isItemUpgrade && (
                  <div className="absolute top-0.5 right-0.5 text-[10px] sm:text-xs animate-bounce-subtle">
                    ⬆️
                  </div>
                )}
                
                {/* Upgrade Level Badge - Top Left */}
                {upgradeLevel > 0 && (
                  <div className={`absolute top-0.5 left-0.5 text-[8px] sm:text-[9px] font-bold ${upgradeLevelColors[upgradeLevel]}`}>
                    +{upgradeLevel}
                  </div>
                )}
                
                <span className="text-lg sm:text-xl">{item.icon}</span>
                <span className={`text-[9px] sm:text-xs ${upgradeLevel > 0 ? upgradeLevelColors[upgradeLevel] : rarityTextColors[item.rarity]} text-center leading-tight px-0.5 sm:px-1 font-bold`}>
                  {item.name}
                </span>
              </button>
            );
          })}
          {/* Empty slots */}
          {[...Array(Math.max(0, 20 - inventory.length))].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square bg-[#0a0a12] border border-[#1a1a2e] rounded-md flex items-center justify-center"
            >
              <span className="text-xs text-gray-800">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem.item}
          equippedItem={selectedItem.fromSlot ? equipment[selectedItem.fromSlot] : null}
          isFromInventory={selectedItem.fromSlot === null}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
          onSell={handleSell}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default InventoryTab;
