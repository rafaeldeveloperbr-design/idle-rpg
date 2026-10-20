import type { Consumable } from '../types/game';

// === Consumables System — catálogo fixo — extraído de App.tsx (valores idênticos) ===
export const consumablesCatalog: Consumable[] = [
  {
    id: 'potion_strength',
    name: 'Poção de Força',
    icon: '💪',
    description: '+50% Ataque por 10s',
    cost: 25,
    requiredLevel: 3,
    effect: 'buff_attack',
    value: 1.5,
    duration: 10,
  },
  {
    id: 'potion_defense',
    name: 'Poção de Proteção',
    icon: '🛡️',
    description: '+50% Defesa por 10s',
    cost: 25,
    requiredLevel: 5,
    effect: 'buff_defense',
    value: 1.5,
    duration: 10,
  },
  {
    id: 'potion_speed',
    name: 'Poção de Velocidade',
    icon: '⚡',
    description: '+50% Velocidade por 10s',
    cost: 30,
    requiredLevel: 7,
    effect: 'buff_speed',
    value: 1.5,
    duration: 10,
  },
  {
    id: 'potion_heal',
    name: 'Poção de Cura',
    icon: '❤️',
    description: 'Restaura 50% HP',
    cost: 20,
    requiredLevel: 2,
    effect: 'heal',
    value: 0.5,
    duration: 0,
  },
];
