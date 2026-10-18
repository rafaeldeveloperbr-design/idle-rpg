import React from 'react';

const AttributesTab: React.FC = () => {
  const attributes = [
    { name: 'Ataque', icon: '⚔️', value: 15, cost: 50, upgrade: '+5' },
    { name: 'Defesa', icon: '🛡️', value: 10, cost: 40, upgrade: '+3' },
    { name: 'Vida Max', icon: '❤️', value: 100, cost: 60, upgrade: '+20' },
    { name: 'Velocidade', icon: '💨', value: 8, cost: 70, upgrade: '+2' },
    { name: 'Crítico', icon: '🎯', value: 5, cost: 80, upgrade: '+1%' },
    { name: 'Regeneração', icon: '💚', value: 2, cost: 90, upgrade: '+1/s' },
  ];

  return (
    <div className="p-3">
      <h3 className="text-[10px] text-purple-300 mb-3 flex items-center gap-2">
        <span>📊</span> Atributos do Personagem
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {attributes.map((attr) => (
          <div
            key={attr.name}
            className="card-hover bg-[#0f0f1a] border border-[#2d2d5e] rounded-md p-2.5 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{attr.icon}</span>
              <span className="text-[8px] text-gray-400">Nv.{attr.value}</span>
            </div>
            <span className="text-[9px] text-gray-200">{attr.name}</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[7px] text-yellow-400">🪙 {attr.cost}</span>
              <button className="pixel-btn text-[7px] text-green-300 px-2 py-1 rounded-sm">
                {attr.upgrade}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributesTab;
