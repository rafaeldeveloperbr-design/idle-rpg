import React from 'react';

const InventoryTab: React.FC = () => {
  const equipment = [
    { slot: 'Arma', name: 'Espada de Ferro', icon: '🗡️', rarity: 'Comum', stat: '+10 ATK', color: 'text-gray-300' },
    { slot: 'Armadura', name: 'Peitoral de Couro', icon: '🦺', rarity: 'Comum', stat: '+8 DEF', color: 'text-gray-300' },
    { slot: 'Elmo', name: 'Capacete de Bronze', icon: '⛑️', rarity: 'Incomum', stat: '+5 DEF', color: 'text-green-400' },
    { slot: 'Botas', name: 'Botas Ágeis', icon: '👢', rarity: 'Raro', stat: '+3 SPD', color: 'text-blue-400' },
    { slot: 'Anel', name: 'Anel de Fogo', icon: '💍', rarity: 'Épico', stat: '+15% CRIT', color: 'text-purple-400' },
    { slot: 'Amuleto', name: '— Vazio —', icon: '📿', rarity: '', stat: '', color: 'text-gray-600' },
  ];

  const items = [
    { name: 'Poção de Vida', icon: '🧪', qty: 5, color: 'text-red-400' },
    { name: 'Poção de Mana', icon: '🫧', qty: 3, color: 'text-blue-400' },
    { name: 'Chave Antiga', icon: '🗝️', qty: 1, color: 'text-yellow-400' },
    { name: 'Gema Bruta', icon: '💎', qty: 12, color: 'text-cyan-400' },
    { name: 'Pergaminho', icon: '📜', qty: 2, color: 'text-amber-300' },
    { name: 'Osso de Monstro', icon: '🦴', qty: 28, color: 'text-gray-400' },
    { name: 'Erva Rara', icon: '🌿', qty: 7, color: 'text-green-400' },
    { name: 'Cristal Sombrio', icon: '🔮', qty: 4, color: 'text-purple-400' },
  ];

  return (
    <div className="p-3">
      <h3 className="text-[10px] text-purple-300 mb-3 flex items-center gap-2">
        <span>🎒</span> Inventário & Equipamentos
      </h3>

      {/* Equipment Slots */}
      <div className="mb-4">
        <span className="text-[8px] text-gray-400 mb-2 block">Equipamentos:</span>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {equipment.map((eq) => (
            <div
              key={eq.slot}
              className="card-hover bg-[#0f0f1a] border border-[#2d2d5e] rounded-md p-2 flex flex-col items-center gap-1"
            >
              <span className="text-lg">{eq.icon}</span>
              <span className="text-[7px] text-gray-500">{eq.slot}</span>
              <span className={`text-[7px] ${eq.color}`}>{eq.name}</span>
              {eq.stat && <span className="text-[6px] text-gray-400">{eq.stat}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <span className="text-[8px] text-gray-400 mb-2 block">Itens:</span>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
          {items.map((item) => (
            <div
              key={item.name}
              className="card-hover bg-[#0f0f1a] border border-[#2d2d5e] rounded-md p-1.5 flex flex-col items-center gap-0.5 relative"
            >
              <span className="text-base">{item.icon}</span>
              <span className={`text-[6px] ${item.color} text-center leading-tight`}>
                {item.name}
              </span>
              <span className="absolute top-0.5 right-0.5 text-[7px] text-yellow-400 bg-black/60 px-0.5 rounded">
                {item.qty}
              </span>
            </div>
          ))}
          {/* Empty slots */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-[#0a0a12] border border-[#1a1a2e] rounded-md p-1.5 flex items-center justify-center min-h-[50px]"
            >
              <span className="text-[8px] text-gray-700">—</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
