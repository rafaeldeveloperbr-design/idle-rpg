import type { Item } from '../types/game';

// === Item Database (templates de drop) — extraído de App.tsx (valores idênticos) ===
export const itemDatabaseTemplates: Omit<Item, 'id'>[] = [
  // Weapons
  { name: 'Adaga Enferrujada', icon: '🔪', slot: 'weapon', rarity: 'common', bonuses: { attack: 3 }, sellValue: 10 },
  { name: 'Espada de Ferro', icon: '🗡️', slot: 'weapon', rarity: 'common', bonuses: { attack: 5 }, sellValue: 20 },
  { name: 'Machado de Batalha', icon: '🪓', slot: 'weapon', rarity: 'common', bonuses: { attack: 6, critChance: 1 }, sellValue: 25 },
  { name: 'Machado de Guerra', icon: '🪓', slot: 'weapon', rarity: 'rare', bonuses: { attack: 12, critChance: 2 }, sellValue: 50 },
  { name: 'Espada Longa', icon: '⚔️', slot: 'weapon', rarity: 'rare', bonuses: { attack: 14, speed: 2 }, sellValue: 65 },
  { name: 'Lâmina Élfica', icon: '⚔️', slot: 'weapon', rarity: 'epic', bonuses: { attack: 25, critChance: 5, speed: 3 }, sellValue: 150 },
  { name: 'Espada do Caos', icon: '🗡️', slot: 'weapon', rarity: 'epic', bonuses: { attack: 28, critChance: 8 }, sellValue: 180 },
  // Armor
  { name: 'Escudo de Madeira', icon: '🛡️', slot: 'armor', rarity: 'common', bonuses: { defense: 4, maxHp: 10 }, sellValue: 15 },
  { name: 'Armadura de Couro', icon: '🦺', slot: 'armor', rarity: 'common', bonuses: { defense: 5, maxHp: 15 }, sellValue: 20 },
  { name: 'Cota de Malha', icon: '⛓️', slot: 'armor', rarity: 'rare', bonuses: { defense: 10, maxHp: 25 }, sellValue: 60 },
  { name: 'Armadura de Placas', icon: '🛡️', slot: 'armor', rarity: 'rare', bonuses: { defense: 12, maxHp: 30, regen: 1 }, sellValue: 75 },
  { name: 'Peitoral de Aço', icon: '⛓️', slot: 'armor', rarity: 'epic', bonuses: { defense: 20, maxHp: 50, regen: 2 }, sellValue: 180 },
  { name: 'Armadura Dracônica', icon: '🛡️', slot: 'armor', rarity: 'epic', bonuses: { defense: 25, maxHp: 60, regen: 3 }, sellValue: 220 },
  // Accessories
  { name: 'Anel de Vida', icon: '💍', slot: 'accessory', rarity: 'common', bonuses: { maxHp: 15, regen: 1 }, sellValue: 25 },
  { name: 'Anel de Rubi', icon: '💍', slot: 'accessory', rarity: 'common', bonuses: { attack: 3, critChance: 2 }, sellValue: 30 },
  { name: 'Amuleto de Velocidade', icon: '📿', slot: 'accessory', rarity: 'rare', bonuses: { speed: 5, critChance: 3 }, sellValue: 70 },
  { name: 'Colar de Esmeralda', icon: '📿', slot: 'accessory', rarity: 'rare', bonuses: { maxHp: 25, regen: 2, defense: 3 }, sellValue: 85 },
  { name: 'Coroa do Rei', icon: '👑', slot: 'accessory', rarity: 'epic', bonuses: { attack: 10, defense: 10, maxHp: 30, speed: 5 }, sellValue: 200 },
  { name: 'Coroa do Dragão', icon: '👑', slot: 'accessory', rarity: 'epic', bonuses: { attack: 15, defense: 12, maxHp: 40, speed: 6, critChance: 5 }, sellValue: 250 },
];
