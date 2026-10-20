// Tipos globais do jogo — extraídos de App.tsx (refatoração, sem mudança de comportamento)

export type GamePhase = 'approaching' | 'fighting' | 'respawning';

export interface HeroAttributes {
  attack: number;
  defense: number;
  maxHp: number;
  speed: number;
  critChance: number;
  regen: number;
}

export interface AttributeCosts {
  attack: number;
  defense: number;
  maxHp: number;
  speed: number;
  critChance: number;
  regen: number;
}

export interface DamagePopup {
  id: number;
  value: number;
  x: number;
  y: number;
  isCrit: boolean;
  isHeal?: boolean;
  isSkill?: boolean;
  timestamp: number;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  maxLevel: number;
  cooldown: number; // seconds
  cost: number; // gold to unlock/upgrade
  unlocked: boolean;
  autoCast: boolean;
  lastUsed: number; // timestamp
  effect: 'damage' | 'heal' | 'buff';
  effectValue: number;
  buffDuration?: number; // seconds (for buffs)
  requiredLevel?: number; // minimum level to unlock
}

export interface Consumable {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  requiredLevel: number;
  effect: 'heal' | 'buff_attack' | 'buff_defense' | 'buff_speed';
  value: number;
  duration: number; // seconds
}

export interface ActiveConsumable {
  id: string;
  consumableId: string;
  expiresAt: number;
  value: number;
}

export interface ActiveBuff {
  id: string;
  skillId: string;
  expiresAt: number;
  multiplier: number;
}

export interface PremiumItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number; // diamonds
  type: 'speed_boost' | 'no_ads' | 'revive' | 'xp_boost' | 'inventory_expansion' | 'diamond_pack';
  duration?: number; // seconds (for temporary effects)
  value?: number; // for inventory expansion or diamond packs
  realPrice?: string; // for diamond packs (e.g., "R$ 4,90")
}

export interface ActivePremiumEffect {
  id: string;
  itemId: string;
  expiresAt?: number; // undefined for permanent effects
  value: number;
}

export type ItemRarity = 'common' | 'rare' | 'epic';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface Item {
  id: string;
  name: string;
  icon: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  bonuses: Partial<HeroAttributes>;
  sellValue: number;
  requiredLevel?: number;
  upgradeLevel?: number; // 0-5, onde 5 é Lendário
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface Biome {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockRequirement: {
    type: 'kills' | 'level';
    value: number;
  };
  enemyMultiplier: {
    hp: number;
    attack: number;
    gold: number;
    xp: number;
  };
  theme: {
    skyGradient: string;
    groundColor: string;
    mountainColor: string;
  };
  enemies: {
    normal: Enemy[];
    boss: Enemy;
  };
}

export interface Enemy {
  id: string;
  name: string;
  type: 'normal' | 'boss';
  sprite: {
    bodyColor: string;
    headColor: string;
    eyeColor: string;
    accentColor?: string;
  };
  scale: number; // 1.0 = normal, 1.3-1.5 = boss
  glowColor?: string; // para bosses
}

export interface Toast {
  id: string;
  message: string;
  type: 'levelup' | 'drop' | 'boss' | 'info';
  duration?: number;
  timestamp: number;
}
