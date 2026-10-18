import React from 'react';

const SkillsTab: React.FC = () => {
  const skills = [
    {
      name: 'Golpe Poderoso',
      icon: '💥',
      level: 3,
      maxLevel: 10,
      description: 'Causa 150% de dano',
      cooldown: '5s',
      unlocked: true,
    },
    {
      name: 'Escudo Mágico',
      icon: '🔮',
      level: 1,
      maxLevel: 8,
      description: 'Absorve 30 de dano',
      cooldown: '10s',
      unlocked: true,
    },
    {
      name: 'Cura Menor',
      icon: '✨',
      level: 2,
      maxLevel: 12,
      description: 'Recupera 25 HP',
      cooldown: '8s',
      unlocked: true,
    },
    {
      name: 'Fúria Berserker',
      icon: '🔥',
      level: 0,
      maxLevel: 5,
      description: 'Dobra o dano por 10s',
      cooldown: '30s',
      unlocked: false,
      requirement: 'Nível 15',
    },
    {
      name: 'Teleporte',
      icon: '🌀',
      level: 0,
      maxLevel: 6,
      description: 'Esquiva automática',
      cooldown: '15s',
      unlocked: false,
      requirement: 'Nível 20',
    },
    {
      name: 'Invocação',
      icon: '👻',
      level: 0,
      maxLevel: 4,
      description: 'Invoca aliado temporário',
      cooldown: '45s',
      unlocked: false,
      requirement: 'Nível 30',
    },
  ];

  return (
    <div className="p-3">
      <h3 className="text-[10px] text-purple-300 mb-3 flex items-center gap-2">
        <span>⚡</span> Habilidades
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className={`card-hover border rounded-md p-2.5 flex flex-col gap-1.5 ${
              skill.unlocked
                ? 'bg-[#0f0f1a] border-[#2d2d5e]'
                : 'bg-[#0a0a12] border-[#1a1a2e] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{skill.icon}</span>
              {skill.unlocked ? (
                <span className="text-[7px] text-blue-300">
                  {skill.level}/{skill.maxLevel}
                </span>
              ) : (
                <span className="text-[7px] text-gray-500">🔒</span>
              )}
            </div>
            <span className="text-[8px] text-gray-200">{skill.name}</span>
            <span className="text-[7px] text-gray-500">{skill.description}</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[7px] text-gray-500">CD: {skill.cooldown}</span>
              {skill.unlocked ? (
                <button className="pixel-btn text-[7px] text-blue-300 px-2 py-1 rounded-sm">
                  Melhorar
                </button>
              ) : (
                <span className="text-[7px] text-gray-600">{skill.requirement}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsTab;
