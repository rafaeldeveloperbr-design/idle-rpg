import type { Biome } from '../types/game';

// === Biome System — catálogo fixo — extraído de App.tsx (valores idênticos) ===
export const biomesCatalog: Biome[] = [
  {
    id: 'forest',
    name: 'Floresta Sombria',
    icon: '🌲',
    description: 'Uma floresta misteriosa cheia de goblins',
    unlockRequirement: { type: 'kills', value: 0 },
    enemyMultiplier: { hp: 1.0, attack: 1.0, gold: 1.0, xp: 1.0 },
    theme: {
      skyGradient: 'from-indigo-900 via-purple-900 to-slate-900',
      groundColor: 'from-green-700 to-green-900',
      mountainColor: '#2a1a4e',
    },
    enemies: {
      normal: [
        {
          id: 'goblin',
          name: 'Goblin Selvagem',
          type: 'normal',
          sprite: {
            bodyColor: 'from-green-600 to-green-800',
            headColor: 'from-green-400 to-green-600',
            eyeColor: 'bg-red-500',
            accentColor: 'border-green-400',
          },
          scale: 1.0,
        },
        {
          id: 'wolf',
          name: 'Lobo das Sombras',
          type: 'normal',
          sprite: {
            bodyColor: 'from-slate-600 to-slate-800',
            headColor: 'from-slate-400 to-slate-600',
            eyeColor: 'bg-blue-400',
            accentColor: 'border-slate-400',
          },
          scale: 1.0,
        },
      ],
      boss: {
        id: 'ent',
        name: 'Ent Ancestral',
        type: 'boss',
        sprite: {
          bodyColor: 'from-amber-800 to-amber-950',
          headColor: 'from-green-800 to-green-950',
          eyeColor: 'bg-yellow-400',
          accentColor: 'border-amber-700',
        },
        scale: 1.4,
        glowColor: 'rgba(34, 197, 94, 0.6)',
      },
    },
  },
  {
    id: 'cave',
    name: 'Caverna Subterrânea',
    icon: '🕳️',
    description: 'Cavernas escuras habitadas por criaturas perigosas',
    unlockRequirement: { type: 'kills', value: 50 },
    enemyMultiplier: { hp: 1.8, attack: 1.5, gold: 1.8, xp: 1.8 },
    theme: {
      skyGradient: 'from-stone-900 via-gray-900 to-zinc-900',
      groundColor: 'from-stone-600 to-stone-800',
      mountainColor: '#3d3d3d',
    },
    enemies: {
      normal: [
        {
          id: 'skeleton',
          name: 'Esqueleto Guerreiro',
          type: 'normal',
          sprite: {
            bodyColor: 'from-gray-300 to-gray-500',
            headColor: 'from-gray-100 to-gray-300',
            eyeColor: 'bg-red-600',
            accentColor: 'border-gray-400',
          },
          scale: 1.0,
        },
        {
          id: 'golem',
          name: 'Golem de Pedra',
          type: 'normal',
          sprite: {
            bodyColor: 'from-stone-500 to-stone-700',
            headColor: 'from-stone-400 to-stone-600',
            eyeColor: 'bg-purple-500',
            accentColor: 'border-stone-500',
          },
          scale: 1.0,
        },
      ],
      boss: {
        id: 'rock_dragon',
        name: 'Dragão de Rocha',
        type: 'boss',
        sprite: {
          bodyColor: 'from-orange-700 to-red-900',
          headColor: 'from-red-600 to-orange-800',
          eyeColor: 'bg-yellow-300',
          accentColor: 'border-orange-600',
        },
        scale: 1.5,
        glowColor: 'rgba(249, 115, 22, 0.6)',
      },
    },
  },
  {
    id: 'castle',
    name: 'Castelo do Dragão',
    icon: '🏰',
    description: 'O covil do dragão ancestral',
    unlockRequirement: { type: 'level', value: 10 },
    enemyMultiplier: { hp: 3.0, attack: 2.5, gold: 3.0, xp: 3.0 },
    theme: {
      skyGradient: 'from-red-900 via-orange-900 to-amber-900',
      groundColor: 'from-red-800 to-red-950',
      mountainColor: '#4a1a1a',
    },
    enemies: {
      normal: [
        {
          id: 'knight',
          name: 'Cavaleiro Amaldiçoado',
          type: 'normal',
          sprite: {
            bodyColor: 'from-purple-900 to-gray-900',
            headColor: 'from-purple-700 to-purple-900',
            eyeColor: 'bg-red-500',
            accentColor: 'border-purple-600',
          },
          scale: 1.0,
        },
        {
          id: 'mage',
          name: 'Mago Negro',
          type: 'normal',
          sprite: {
            bodyColor: 'from-fuchsia-800 to-purple-950',
            headColor: 'from-fuchsia-600 to-fuchsia-800',
            eyeColor: 'bg-cyan-400',
            accentColor: 'border-fuchsia-500',
          },
          scale: 1.0,
        },
      ],
      boss: {
        id: 'demon_king',
        name: 'Rei Demônio',
        type: 'boss',
        sprite: {
          bodyColor: 'from-yellow-600 to-red-800',
          headColor: 'from-yellow-500 to-red-700',
          eyeColor: 'bg-red-600',
          accentColor: 'border-yellow-500',
        },
        scale: 1.5,
        glowColor: 'rgba(234, 179, 8, 0.7)',
      },
    },
  },
];
