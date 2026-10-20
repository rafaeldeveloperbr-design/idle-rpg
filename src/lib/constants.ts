// Constantes de balanceamento e config — extraídas de App.tsx (valores idênticos)

export const SAVE_KEY = 'idle_rpg_save_v1';

// === Posições e timing do combate ===
export const HERO_X = 150;
export const ATTACK_RANGE = 45;
export const ENEMY_SPEED = 2;
export const ENEMY_SPAWN_X = 900; // Spawn off-screen to the right
export const ENEMY_ATTACK_SPEED = 2000;
export const GAME_TICK_MS = 30;

// === Stats base dos inimigos por wave ===
export const BASE_ENEMY_HP = 30;
export const BASE_ENEMY_GOLD = 10;
export const BASE_ENEMY_XP = 15;
export const BASE_ENEMY_ATTACK = 3;

// === Progressão ===
export const INVENTORY_BASE_CAPACITY = 20;
export const MIN_WAVES_BETWEEN_EVENTS = 10; // Minimum waves between events
export const QUESTS_UNTIL_PATH = 2; // Number of quests to complete before forcing a path choice

// === New Game defaults (herói guerreiro) ===
export const DEFAULT_HERO_ATTRIBUTES = {
  attack: 5,
  defense: 2,
  maxHp: 100,
  speed: 5,
  critChance: 2,
  regen: 1,
};

export const DEFAULT_ATTRIBUTE_COSTS = {
  attack: 20,
  defense: 15,
  maxHp: 25,
  speed: 30,
  critChance: 35,
  regen: 40,
};
