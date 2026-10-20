import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';
import CharacterCreationModal from './components/modals/CharacterCreationModal';
import SettingsModal from './components/modals/SettingsModal';
import MerchantShop from './components/modals/MerchantShop';
import DiamondShopModal from './components/modals/DiamondShopModal';
import PathChoiceModal from './components/modals/PathChoiceModal';
import NPCDialogueModal from './components/modals/NPCDialogueModal';
import ToastContainer from './components/ToastContainer';
import Drawer from './components/Drawer';
import { questsData, type Quest } from './data/questsData';
import { saveGameData, loadGameData, clearSaveData, hasSaveData } from './utils/gameSave';

// Universal Gold Icon Component (replaces emoji 🪙)
export const GoldIcon = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-3 h-3 text-[8px]',
    md: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-bold border border-yellow-700 ${sizeClasses[size]} ${className}`}
      style={{ lineHeight: 1 }}
    >
      G
    </span>
  );
};

type GamePhase = 'approaching' | 'fighting' | 'respawning';

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

export default function App() {
  // === Hero State (fixed position) ===
  const heroX = 150;
  const [heroName, setHeroName] = useState('Herói');
  const [heroHp, setHeroHp] = useState(100);
  const [heroLevel, setHeroLevel] = useState(1);
  const [heroXp, setHeroXp] = useState(0);
  const [heroGold, setHeroGold] = useState(10);
  const [heroDiamonds, setHeroDiamonds] = useState(0); // Premium currency

  // === Premium Effects ===
  const [isSpeedBoosted, setIsSpeedBoosted] = useState(false);
  const [hasNoAds, setHasNoAds] = useState(false);
  const [activePremiumEffects, setActivePremiumEffects] = useState<ActivePremiumEffect[]>([]);
  const [inventoryCapacity, setInventoryCapacity] = useState(20); // Can be expanded with premium items

  // === Modal States ===
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMerchantShop, setShowMerchantShop] = useState(false);
  const [showDiamondShop, setShowDiamondShop] = useState(false);
  const [showPathChoice, setShowPathChoice] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Pause state for modals
  const [activeDrawer, setActiveDrawer] = useState<'attributes' | 'skills' | 'inventory' | 'quests' | null>(null);

  // === Reset Control Flag ===
  const isResetting = useRef(false);

  // === Toast Notifications ===
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [combatHistory, setCombatHistory] = useState<Toast[]>([]);

  // Hero attributes (upgradable) - New Game defaults
  const [heroAttributes, setHeroAttributes] = useState<HeroAttributes>({
    attack: 5,
    defense: 2,
    maxHp: 100,
    speed: 5,
    critChance: 2,
    regen: 1,
  });

  // Attribute upgrade costs - New Game defaults
  const [attributeCosts, setAttributeCosts] = useState<AttributeCosts>({
    attack: 20,
    defense: 15,
    maxHp: 25,
    speed: 30,
    critChance: 35,
    regen: 40,
  });

  // Combat timing (based on speed attribute)
  const heroAttackSpeed = Math.max(300, 1500 - heroAttributes.speed * 50);

  // === Skills System === - New Game defaults (3 initial skills)
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 'power_strike',
      name: 'Golpe Potente',
      icon: '💥',
      description: 'Causa 250% de dano em um único golpe',
      level: 1,
      maxLevel: 10,
      cooldown: 5,
      cost: 30,
      unlocked: true,
      autoCast: true,
      lastUsed: 0,
      effect: 'damage',
      effectValue: 2.5,
      requiredLevel: 1,
    },
    {
      id: 'quick_heal',
      name: 'Cura Rápida',
      icon: '✨',
      description: 'Restaura 30% da Vida Máxima',
      level: 1,
      maxLevel: 10,
      cooldown: 10,
      cost: 50,
      unlocked: true,
      autoCast: true,
      lastUsed: 0,
      effect: 'heal',
      effectValue: 0.3,
      requiredLevel: 1,
    },
    {
      id: 'fury',
      name: 'Fúria',
      icon: '🔥',
      description: 'Aumenta Ataque em 100% por 5s',
      level: 1,
      maxLevel: 8,
      cooldown: 12,
      cost: 80,
      unlocked: true,
      autoCast: true,
      lastUsed: 0,
      effect: 'buff',
      effectValue: 2.0,
      buffDuration: 5,
      requiredLevel: 1,
    },
    {
      id: 'shield_bash',
      name: 'Golpe de Escudo',
      icon: '🛡️',
      description: 'Causa 200% de dano e atordoa',
      level: 1,
      maxLevel: 8,
      cooldown: 8,
      cost: 150,
      unlocked: false,
      autoCast: true,
      lastUsed: 0,
      effect: 'damage',
      effectValue: 2.0,
      requiredLevel: 5,
    },
    {
      id: 'life_drain',
      name: 'Drenar Vida',
      icon: '🩸',
      description: 'Causa 180% de dano e cura 50%',
      level: 1,
      maxLevel: 8,
      cooldown: 15,
      cost: 200,
      unlocked: false,
      autoCast: true,
      lastUsed: 0,
      effect: 'damage',
      effectValue: 1.8,
      requiredLevel: 8,
    },
    {
      id: 'berserker',
      name: 'Berserker',
      icon: '😡',
      description: 'Aumenta Ataque em 150% por 8s',
      level: 1,
      maxLevel: 6,
      cooldown: 20,
      cost: 300,
      unlocked: false,
      autoCast: true,
      lastUsed: 0,
      effect: 'buff',
      effectValue: 2.5,
      buffDuration: 8,
      requiredLevel: 10,
    },
    {
      id: 'healing_aura',
      name: 'Aura de Cura',
      icon: '💚',
      description: 'Restaura 50% da Vida Máxima',
      level: 1,
      maxLevel: 8,
      cooldown: 20,
      cost: 250,
      unlocked: false,
      autoCast: true,
      lastUsed: 0,
      effect: 'heal',
      effectValue: 0.5,
      requiredLevel: 12,
    },
    {
      id: 'thunder_strike',
      name: 'Golpe Trovejante',
      icon: '⚡',
      description: 'Causa 350% de dano em um único golpe',
      level: 1,
      maxLevel: 6,
      cooldown: 12,
      cost: 500,
      unlocked: false,
      autoCast: true,
      lastUsed: 0,
      effect: 'damage',
      effectValue: 3.5,
      requiredLevel: 15,
    },
  ]);

  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);

  // === Skill Deck System ===
  const [equippedSkillIds, setEquippedSkillIds] = useState<string[]>(['power_strike', 'quick_heal', 'fury']);

  // === Consumables System ===
  const [consumables, setConsumables] = useState<Consumable[]>([
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
  ]);

  const [activeConsumables, setActiveConsumables] = useState<ActiveConsumable[]>([]);

  // === Quest System ===
  const [quests, setQuests] = useState<Quest[]>(
    questsData.map(q => ({ ...q, completed: false, active: false, progress: 0 }))
  );
  const [currentNPCQuest, setCurrentNPCQuest] = useState<Quest | null>(null);
  const lastNPCSpawnWave = useRef(0);
  const [wavesSinceLastEvent, setWavesSinceLastEvent] = useState(0);
  const [completedQuestsSinceLastPath, setCompletedQuestsSinceLastPath] = useState(0);
  const MIN_WAVES_BETWEEN_EVENTS = 10; // Minimum waves between events
  const QUESTS_UNTIL_PATH = 2; // Number of quests to complete before forcing a path choice

  // === Path Difficulty System ===
  const [pathDifficultyMultiplier, setPathDifficultyMultiplier] = useState<{
    hpMultiplier: number;
    attackMultiplier: number;
    rewardMultiplier: number;
    dropChanceBonus: number;
    remainingEnemies: number;
  }>({
    hpMultiplier: 1.0,
    attackMultiplier: 1.0,
    rewardMultiplier: 1.0,
    dropChanceBonus: 0,
    remainingEnemies: 0,
  });

  // === Shop Items (Equipment Catalog) ===
  const shopItems: Item[] = [
    // Armas
    {
      id: 'shop_iron_sword',
      name: 'Espada de Ferro',
      icon: '🗡️',
      slot: 'weapon',
      rarity: 'common',
      bonuses: { attack: 8 },
      sellValue: 50,
      requiredLevel: 1,
    },
    {
      id: 'shop_steel_sword',
      name: 'Espada de Aço',
      icon: '⚔️',
      slot: 'weapon',
      rarity: 'rare',
      bonuses: { attack: 15, critChance: 3 },
      sellValue: 150,
      requiredLevel: 5,
    },
    {
      id: 'shop_dragon_blade',
      name: 'Lâmina do Dragão',
      icon: '🔥',
      slot: 'weapon',
      rarity: 'epic',
      bonuses: { attack: 30, critChance: 8, speed: 5 },
      sellValue: 500,
      requiredLevel: 12,
    },
    // Armaduras
    {
      id: 'shop_leather_armor',
      name: 'Armadura de Couro',
      icon: '🦺',
      slot: 'armor',
      rarity: 'common',
      bonuses: { defense: 5, maxHp: 20 },
      sellValue: 60,
      requiredLevel: 2,
    },
    {
      id: 'shop_chain_mail',
      name: 'Cota de Malha',
      icon: '⛓️',
      slot: 'armor',
      rarity: 'rare',
      bonuses: { defense: 12, maxHp: 40 },
      sellValue: 180,
      requiredLevel: 7,
    },
    {
      id: 'shop_dragon_armor',
      name: 'Armadura Dracônica',
      icon: '🛡️',
      slot: 'armor',
      rarity: 'epic',
      bonuses: { defense: 25, maxHp: 80, regen: 3 },
      sellValue: 600,
      requiredLevel: 15,
    },
    // Acessórios
    {
      id: 'shop_speed_ring',
      name: 'Anel de Velocidade',
      icon: '💍',
      slot: 'accessory',
      rarity: 'common',
      bonuses: { speed: 5, critChance: 2 },
      sellValue: 70,
      requiredLevel: 3,
    },
    {
      id: 'shop_life_amulet',
      name: 'Amuleto da Vida',
      icon: '📿',
      slot: 'accessory',
      rarity: 'rare',
      bonuses: { maxHp: 50, regen: 2, defense: 5 },
      sellValue: 200,
      requiredLevel: 8,
    },
    {
      id: 'shop_dragon_crown',
      name: 'Coroa do Dragão',
      icon: '👑',
      slot: 'accessory',
      rarity: 'epic',
      bonuses: { attack: 15, defense: 15, maxHp: 60, speed: 8, critChance: 10 },
      sellValue: 800,
      requiredLevel: 18,
    },
  ];

  // === Premium Items Catalog ===
  const premiumItems: PremiumItem[] = [
    {
      id: 'speed_boost',
      name: 'Acelerador de Velocidade',
      icon: '⚡',
      description: 'Ativa modo 2x velocidade no jogo por 1 hora',
      price: 50,
      type: 'speed_boost',
      duration: 3600, // 1 hour
    },
    {
      id: 'no_ads',
      name: 'Pacote Sem Anúncios',
      icon: '🚫',
      description: 'Remove todos os anúncios permanentemente',
      price: 200,
      type: 'no_ads',
    },
    {
      id: 'revive',
      name: 'Ressuscitar / Vida Extra',
      icon: '❤️',
      description: 'Item consumível para reviver ao morrer (1 uso)',
      price: 30,
      type: 'revive',
    },
    {
      id: 'xp_boost',
      name: 'Bônus 2x XP/Ouro',
      icon: '🍀',
      description: 'Dobra ganhos de XP e Ouro por 1 hora',
      price: 75,
      type: 'xp_boost',
      duration: 3600, // 1 hour
    },
    {
      id: 'inventory_expansion',
      name: 'Expansão de Inventário',
      icon: '🎒',
      description: 'Aumenta capacidade do inventário em +10 slots',
      price: 100,
      type: 'inventory_expansion',
      value: 10,
    },
    // Diamond Packs
    {
      id: 'diamond_pack_100',
      name: 'Pacote de 100 Diamantes',
      icon: '💎',
      description: 'Pacote inicial de diamantes',
      price: 0,
      type: 'diamond_pack',
      value: 100,
      realPrice: 'R$ 4,90',
    },
    {
      id: 'diamond_pack_500',
      name: 'Pacote de 500 Diamantes',
      icon: '💎',
      description: 'Pacote médio com bônus',
      price: 0,
      type: 'diamond_pack',
      value: 500,
      realPrice: 'R$ 19,90',
    },
    {
      id: 'diamond_pack_1200',
      name: 'Pacote de 1200 Diamantes',
      icon: '💎',
      description: 'Pacote grande - Melhor valor!',
      price: 0,
      type: 'diamond_pack',
      value: 1200,
      realPrice: 'R$ 39,90',
    },
  ];

  // === Inventory System ===
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equipment, setEquipment] = useState<Equipment>({
    weapon: null,
    armor: null,
    accessory: null,
  });

  // === Biome System ===
  const [currentBiomeId, setCurrentBiomeId] = useState<string>('forest');
  const [biomeKills, setBiomeKills] = useState<number>(0);
  const [totalKills, setTotalKills] = useState<number>(0);
  const [isBossWave, setIsBossWave] = useState<boolean>(false);

  const biomes: Biome[] = [
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

  const currentBiome = biomes.find(b => b.id === currentBiomeId) || biomes[0];

  const isBiomeUnlocked = (biome: Biome): boolean => {
    if (biome.unlockRequirement.type === 'kills') {
      return totalKills >= biome.unlockRequirement.value;
    } else if (biome.unlockRequirement.type === 'level') {
      return heroLevel >= biome.unlockRequirement.value;
    }
    return false;
  };

  const changeBiome = (biomeId: string) => {
    const biome = biomes.find(b => b.id === biomeId);
    if (biome && isBiomeUnlocked(biome)) {
      setCurrentBiomeId(biomeId);
      setBiomeKills(0);
      setIsBossWave(false);
      // Reset enemy to spawn in new biome
      setEnemyHp(baseEnemyHp * biome.enemyMultiplier.hp);
      setEnemyX(enemySpawnX);
      setGamePhase('approaching');
    }
  };

  // === Item Database ===
  const itemDatabase: Omit<Item, 'id'>[] = [
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

  // === Wave System === - Balanced progression
  const [wave, setWave] = useState(1);
  const baseEnemyHp = 30;
  const baseEnemyGold = 10;
  const baseEnemyXp = 15;
  const baseEnemyAttack = 3;

  // Scaled enemy stats per wave + biome multiplier + hero level scaling
  const biomeMultiplier = currentBiome.enemyMultiplier;
  const isBoss = isBossWave;
  const bossMultiplier = isBoss ? 5 : 1; // Boss has 5x HP

  // Hero level scaling factor (enemies scale with player level)
  const heroLevelScale = 1 + (heroLevel - 1) * 0.15; // +15% per hero level

  // Enemy HP: scales with wave, biome, boss, hero level, AND path difficulty
  const enemyMaxHp = Math.floor(
    (baseEnemyHp + (wave - 1) * 15) *
    biomeMultiplier.hp *
    bossMultiplier *
    heroLevelScale *
    pathDifficultyMultiplier.hpMultiplier
  );

  // Enemy Attack: smooth logarithmic scaling + path difficulty
  // Formula: base * (1 + log(wave) * 0.5) * biome * level * path difficulty
  // This ensures damage stays between 5-15% of hero max HP per hit
  const waveAttackScale = 1 + Math.log(wave) * 0.5; // Logarithmic growth (much smoother)
  const enemyAttackPower = Math.floor(
    baseEnemyAttack *
    waveAttackScale *
    biomeMultiplier.attack *
    heroLevelScale *
    pathDifficultyMultiplier.attackMultiplier
  );

  // Rewards: logarithmic scaling to prevent exponential growth
  // Using sqrt for smoother progression
  const waveRewardMultiplier = 1 + Math.sqrt(wave - 1) * 0.3; // Smoother growth
  const levelRewardMultiplier = 1 + (heroLevel - 1) * 0.1; // Small bonus per level

  const enemyGoldReward = Math.floor(
    baseEnemyGold *
    waveRewardMultiplier *
    biomeMultiplier.gold *
    (isBoss ? 3 : 1) *
    levelRewardMultiplier *
    pathDifficultyMultiplier.rewardMultiplier
  );

  const enemyXpReward = Math.floor(
    baseEnemyXp *
    waveRewardMultiplier *
    biomeMultiplier.xp *
    (isBoss ? 3 : 1) *
    levelRewardMultiplier *
    pathDifficultyMultiplier.rewardMultiplier
  );

  // === Enemy State (moves toward hero) ===
  const [enemyX, setEnemyX] = useState(700);
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy>(biomes[0].enemies.normal[0]);
  const enemyAttackSpeed = 2000;

  // Reset enemy HP when wave changes or biome changes
  useEffect(() => {
    setEnemyHp(enemyMaxHp);
  }, [wave, currentBiomeId, isBossWave]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Game Phase ===
  const [gamePhase, setGamePhase] = useState<GamePhase>('approaching');
  const [scrollOffset, setScrollOffset] = useState(0);

  // === Damage Popups ===
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const popupIdRef = useRef(0);

  // === Hit Flash State ===
  const [heroHitFlash, setHeroHitFlash] = useState(false);
  const [enemyHitFlash, setEnemyHitFlash] = useState(false);

  // Constants
  const attackRange = 80;
  const enemySpeed = 2;
  const enemySpawnX = 900; // Spawn off-screen to the right

  // XP formula: level * 100
  const xpToNextLevel = heroLevel * 100;

  // === Load Game on Mount ===
  useEffect(() => {
    const savedData = loadGameData();

    if (savedData) {
      console.log('[Load] Restoring saved game...');
      console.log('[Load] Hero Level:', savedData.heroLevel);
      console.log('[Load] Hero XP:', savedData.heroXp);
      console.log('[Load] Hero Gold:', savedData.heroGold);
      console.log('[Load] Current Biome:', savedData.currentBiomeId);
      console.log('[Load] Wave:', savedData.wave);

      // Restore hero state
      setHeroName(savedData.heroName || 'Herói');
      setHeroHp(savedData.heroHp);
      setHeroLevel(savedData.heroLevel);
      setHeroXp(savedData.heroXp);
      setHeroGold(savedData.heroGold);
      setHeroDiamonds(savedData.heroDiamonds || 0);

      // Restore attributes
      setHeroAttributes(savedData.heroAttributes);
      setAttributeCosts(savedData.attributeCosts);

      // Restore skills
      setSkills(savedData.skills);

      // Restore inventory & equipment
      setInventory(savedData.inventory);
      setEquipment(savedData.equipment);

      // Restore biome & progress
      setCurrentBiomeId(savedData.currentBiomeId);
      setBiomeKills(savedData.biomeKills);
      setTotalKills(savedData.totalKills);
      setWave(savedData.wave);

      setCombatHistory(
        Array.isArray(savedData.combatHistory)
          ? savedData.combatHistory.slice(0, 5)
          : []
      );

      // Restore event management
      setWavesSinceLastEvent(savedData.wavesSinceLastEvent || 0);
      setCompletedQuestsSinceLastPath(savedData.completedQuestsSinceLastPath || 0);

      if (Array.isArray(savedData.quests)) {
        setQuests(
          questsData.map(defaultQuest => {
            const savedQuest = savedData.quests!.find(
              quest => quest.id === defaultQuest.id
            );

            return savedQuest
              ? {
                ...defaultQuest,
                active: Boolean(savedQuest.active) && !savedQuest.completed,
                completed: Boolean(savedQuest.completed),
                progress: Math.max(0, Number(savedQuest.progress) || 0),
                currentGoldAtAccept: savedQuest.currentGoldAtAccept,
                currentWaveAtAccept: savedQuest.currentWaveAtAccept,
                currentKillsAtAccept: savedQuest.currentKillsAtAccept,
                currentBossKillsAtAccept: savedQuest.currentBossKillsAtAccept,
                completedAt: savedQuest.completedAt,
              }
              : { ...defaultQuest, active: false, completed: false, progress: 0 };
          })
        );
      }

      // Restore premium effects
      setInventoryCapacity(savedData.inventoryCapacity || 20);
      setIsSpeedBoosted(savedData.isSpeedBoosted || false);
      setHasNoAds(savedData.hasNoAds || false);
      setActivePremiumEffects(savedData.activePremiumEffects || []);

      // Restore current enemy (spawn random enemy for the biome)
      const restoredBiome = biomes.find(b => b.id === savedData.currentBiomeId) || biomes[0];
      const randomEnemy = restoredBiome.enemies.normal[Math.floor(Math.random() * restoredBiome.enemies.normal.length)];
      setCurrentEnemy(randomEnemy);

      setIsFirstTime(false);
      setIsGameStarted(true); // Start the game loop when loading save
      console.log('[Load] Game restored successfully!');
    } else {
      console.log('[New Game] Starting fresh game...');
      console.log('[New Game] Hero Level: 1');
      console.log('[New Game] Hero XP: 0/100');
      console.log('[New Game] Hero Gold: 10');
      setIsFirstTime(true);
      setShowCharacterCreation(true);
      console.log('[New Game] Current Biome: forest');
      console.log('[New Game] Wave: 1');
      console.log('[New Game] Game initialized successfully!');
    }
  }, []);

  // === Auto-Save System ===
  useEffect(() => {
    const saveInterval = setInterval(() => {
      // Prevent save during reset
      if (isResetting.current) return;

      saveGameData({
        heroName,
        heroHp,
        heroLevel,
        heroXp,
        heroGold,
        heroDiamonds,
        heroAttributes,
        attributeCosts,
        skills,
        inventory,
        equipment,
        inventoryCapacity,
        currentBiomeId,
        biomeKills,
        totalKills,
        wave,
        wavesSinceLastEvent,
        completedQuestsSinceLastPath,
        quests,
        isSpeedBoosted,
        hasNoAds,
        combatHistory: combatHistory.slice(0, 5),
        activePremiumEffects,
      });
    }, 5000); // Save every 5 seconds

    // Save on page close/refresh
    const handleBeforeUnload = () => {
      // Prevent save during reset
      if (isResetting.current) return;

      saveGameData({
        heroName,
        heroHp,
        heroLevel,
        heroXp,
        heroGold,
        heroDiamonds,
        heroAttributes,
        attributeCosts,
        skills,
        inventory,
        equipment,
        inventoryCapacity,
        currentBiomeId,
        biomeKills,
        totalKills,
        wave,
        wavesSinceLastEvent,
        completedQuestsSinceLastPath,
        isSpeedBoosted,
        hasNoAds,
        activePremiumEffects,
        combatHistory: combatHistory.slice(0, 5),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [heroName, heroHp, heroLevel, heroXp, heroGold, heroDiamonds, heroAttributes, attributeCosts, skills, inventory, equipment, inventoryCapacity, currentBiomeId, biomeKills, totalKills,
    wave, wavesSinceLastEvent, completedQuestsSinceLastPath, isSpeedBoosted, hasNoAds, activePremiumEffects, combatHistory, quests]);

  // === Reset Game ===
  const resetGame = useCallback(() => {
    // Set reset flag to prevent auto-save during reset
    isResetting.current = true;

    // Clear localStorage immediately
    localStorage.removeItem('idle_rpg_save_v1');

    // Force reload to reset all state
    window.location.reload();
  }, []);

  // === Handle Start Adventure (First Time) ===
  const handleStartAdventure = useCallback((name: string) => {
    setHeroName(name);
    setShowCharacterCreation(false);
    setIsFirstTime(false);
    setIsGameStarted(true); // Start the game loop
    console.log('[Character Creation] Adventure started with hero:', name);
  }, []);

  // === Handle Change Name ===
  const handleChangeName = useCallback((name: string) => {
    setHeroName(name);
    console.log('[Settings] Hero name changed to:', name);
  }, []);

  // === Handle Drawer Toggle ===
  const handleDrawerToggle = useCallback((drawer: 'attributes' | 'skills' | 'inventory' | 'quests') => {
    setActiveDrawer(prev => prev === drawer ? null : drawer);
  }, []);

  // === Refs for game loop ===
  const enemyXRef = useRef(enemyX);
  const enemyHpRef = useRef(enemyHp);
  const heroHpRef = useRef(heroHp);
  const gamePhaseRef = useRef(gamePhase);
  const heroAttributesRef = useRef(heroAttributes);
  const waveRef = useRef(wave);
  const lastHeroAttackRef = useRef(Date.now());
  const lastEnemyAttackRef = useRef(Date.now());
  const lastRegenRef = useRef(Date.now());

  // Sync refs
  useEffect(() => { enemyXRef.current = enemyX; }, [enemyX]);
  useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
  useEffect(() => { heroHpRef.current = heroHp; }, [heroHp]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);
  useEffect(() => { heroAttributesRef.current = heroAttributes; }, [heroAttributes]);
  useEffect(() => { waveRef.current = wave; }, [wave]);

  // === Spawn Damage Popup ===
  const spawnDamagePopup = useCallback((value: number, targetX: number, isCrit: boolean, isHeal = false, isSkill = false) => {
    const id = popupIdRef.current++;
    const popup: DamagePopup = {
      id,
      value,
      x: targetX + (Math.random() * 20 - 10),
      y: 0,
      isCrit,
      isHeal,
      isSkill,
      timestamp: Date.now(),
    };
    setDamagePopups((prev) => [...prev, popup]);

    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

  // === Toast Notification System ===
  const addToast = useCallback((message: string, type: Toast['type'], duration: number = 3000) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, newToast]);

    setCombatHistory((prev) => [newToast, ...prev].slice(0, 5));

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // === Level Up Logic ===
  useEffect(() => {
    let currentXp = heroXp;
    let currentLevel = heroLevel;
    let leveled = false;

    // Loop to handle multiple level ups at once (prevents skipping levels)
    while (currentXp >= currentLevel * 100) {
      currentXp -= currentLevel * 100;
      currentLevel += 1;
      leveled = true;
    }

    if (leveled) {
      console.log('[Level Up] Hero leveled up to', currentLevel);
      setHeroLevel(currentLevel);
      setHeroXp(currentXp);
      setHeroHp(heroAttributes.maxHp); // Full heal on level up

      // Show level up toast
      addToast(`🌟 LEVEL UP! Você alcançou o Nível ${currentLevel}!`, 'levelup');
    }
  }, [heroXp, heroLevel, heroAttributes.maxHp, addToast]);

  // === Spawn new enemy after delay ===
  // === Spawn Random Enemy ===
  const spawnRandomEnemy = useCallback((isBoss: boolean) => {
    const currentBiomeData = biomes.find(b => b.id === currentBiomeId) || biomes[0];

    if (isBoss) {
      // Spawn boss
      setCurrentEnemy(currentBiomeData.enemies.boss);
    } else {
      // Spawn random normal enemy
      const normalEnemies = currentBiomeData.enemies.normal;
      const randomIndex = Math.floor(Math.random() * normalEnemies.length);
      setCurrentEnemy(normalEnemies[randomIndex]);
    }
  }, [currentBiomeId, biomes]);

  // === Handle Path Choice ===
  const handlePathChoice = useCallback((choice: 'safe' | 'challenging' | 'deadly') => {
    setShowPathChoice(false);
    setWavesSinceLastEvent(0); // Reset event counter after path choice
    setCompletedQuestsSinceLastPath(0); // Reset quest completion counter

    // Apply difficulty multiplier based on choice
    switch (choice) {
      case 'safe':
        setPathDifficultyMultiplier({
          hpMultiplier: 1.0,
          attackMultiplier: 1.0,
          rewardMultiplier: 1.0,
          dropChanceBonus: 0,
          remainingEnemies: 5,
        });
        addToast('🟢 Caminho Seguro escolhido! Dificuldade normal.', 'info');
        break;

      case 'challenging':
        setPathDifficultyMultiplier({
          hpMultiplier: 1.3,
          attackMultiplier: 1.3,
          rewardMultiplier: 1.5,
          dropChanceBonus: 0.2, // +20% rare drop chance
          remainingEnemies: 5,
        });
        addToast('🟡 Caminho Desafiador escolhido! +30% dificuldade, +50% recompensas!', 'info');
        break;

      case 'deadly':
        setPathDifficultyMultiplier({
          hpMultiplier: 1.8,
          attackMultiplier: 1.8,
          rewardMultiplier: 2.0,
          dropChanceBonus: 0.5, // +50% epic/legendary drop chance
          remainingEnemies: 5,
        });
        addToast('🔴 Caminho Mortal escolhido! +80% dificuldade, x2 recompensas, drops épicos!', 'info');
        break;
    }

    // Continue with next enemy
    const nextIsBoss = biomeKills > 0 && biomeKills % 10 === 0;
    spawnRandomEnemy(nextIsBoss);
    setEnemyX(enemySpawnX);
    setGamePhase('approaching');
    lastHeroAttackRef.current = Date.now();
    lastEnemyAttackRef.current = Date.now();
  }, [biomeKills, enemySpawnX, spawnRandomEnemy, addToast]);

  // === Open Shop from Path Choice ===
  const handleOpenShopFromPath = useCallback(() => {
    setIsPaused(true); // Pause game when opening shop from path choice
    setShowMerchantShop(true);
  }, []);

  // === Close Merchant Shop ===
  const handleCloseMerchantShop = useCallback(() => {
    setShowMerchantShop(false);
    // Only unpause if we're not in a path choice (which should keep game paused)
    if (!showPathChoice) {
      setIsPaused(false);
    }
  }, [showPathChoice]);

  // === Pause Game When Modals Are Open ===
  useEffect(() => {
    // Pause game when important modals are open
    const shouldPause = showSettings || showDiamondShop || showMerchantShop || showPathChoice || currentNPCQuest !== null;
    setIsPaused(shouldPause);
  }, [showSettings, showDiamondShop, showMerchantShop, showPathChoice, currentNPCQuest]);

  // === Quest System Functions ===
  const checkAndSpawnNPC = useCallback(() => {
    // EXCLUSIVITY CHECK: Don't spawn NPC if path choice is active
    if (showPathChoice) return;

    // EXCLUSIVITY CHECK: Don't spawn NPC if another NPC dialogue is already open
    if (currentNPCQuest !== null) return;

    // EXCLUSIVITY CHECK: Don't spawn NPC if there's an active quest being processed
    // (allow active quests to exist, but don't spawn new NPCs while one is being shown)

    // SPACING CHECK: Ensure minimum waves between events
    if (wavesSinceLastEvent < MIN_WAVES_BETWEEN_EVENTS) return;

    // 20% chance to encounter NPC (reduced from 30% for better pacing)
    if (Math.random() > 0.2) return;

    // Find available quests (not completed, not active, level requirement met)
    const availableQuests = quests.filter(q =>
      !q.completed &&
      !q.active &&
      heroLevel >= q.unlockedAtLevel
    );

    if (availableQuests.length === 0) return;

    // Pick random quest
    const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];

    // Show NPC dialogue
    setCurrentNPCQuest(randomQuest);
    setWavesSinceLastEvent(0); // Reset event counter
  }, [wave, quests, heroLevel, showPathChoice, currentNPCQuest, wavesSinceLastEvent]);

  const acceptQuest = useCallback((quest: Quest) => {
    // Store reference values when quest is accepted
    const questWithReference = {
      ...quest,
      active: true,
      progress: 0, // Reset progress to 0
      // Store current values as reference points
      currentGoldAtAccept: quest.objectiveType === 'collect_gold' ? heroGold : undefined,
      currentWaveAtAccept: quest.objectiveType === 'reach_wave' ? wave : undefined,
      currentKillsAtAccept: quest.objectiveType === 'kill_monsters' ? totalKills : undefined,
      currentBossKillsAtAccept: quest.objectiveType === 'defeat_boss' ? Math.floor(totalKills / 10) : undefined,
    };

    setQuests(prev => prev.map(q =>
      q.id === quest.id ? questWithReference : q
    ));
    setCurrentNPCQuest(null);
    setWavesSinceLastEvent(0); // Reset event counter after quest event
    addToast(`📜 Quest aceita: ${quest.title}`, 'info');
  }, [addToast, heroGold, wave, totalKills]);

  const declineQuest = useCallback(() => {
    setCurrentNPCQuest(null);
    setWavesSinceLastEvent(0); // Reset event counter after quest event
  }, []);

  const completeQuest = useCallback((questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.active || quest.progress < quest.objectiveTarget) return;

    // Mark as completed
    setQuests(prev => prev.map(q =>
      q.id === questId
        ? { ...q, completed: true, active: false, completedAt: Date.now() }
        : q
    ));

    // Give rewards
    setHeroGold(prev => prev + quest.reward.gold);
    setHeroXp(prev => prev + quest.reward.xp);

    // Add item reward if exists
    if (quest.reward.item) {
      const newItem: Item = {
        ...quest.reward.item,
        id: `quest_item_${Date.now()}_${Math.random()}`,
      };
      setInventory(prev => [...prev, newItem]);
    }

    // Increment quest completion counter
    const newQuestCount = completedQuestsSinceLastPath + 1;
    setCompletedQuestsSinceLastPath(newQuestCount);

    addToast(`✅ Quest concluída: ${quest.title}!`, 'info');
    addToast(`💰 +${quest.reward.gold} ouro, +${quest.reward.xp} XP`, 'info');

    // Check if we should force a path choice (after completing QUESTS_UNTIL_PATH quests)
    if (newQuestCount >= QUESTS_UNTIL_PATH) {
      // Heal hero to 100% when showing path choice
      setHeroHp(heroAttributes.maxHp);
      setShowPathChoice(true);
      addToast(`🛤️ Bifurcação disponível! Escolha seu caminho.`, 'info');
    }
  }, [quests, addToast, completedQuestsSinceLastPath, heroAttributes.maxHp]);

  // Complete quests automatically when their objectives are reached
  useEffect(() => {
    if (!isGameStarted) return;

    const readyQuest = quests.find(
      quest =>
        quest.active &&
        !quest.completed &&
        quest.progress >= quest.objectiveTarget
    );

    if (readyQuest) {
      completeQuest(readyQuest.id);
    }
  }, [quests, isGameStarted, completeQuest]);

  // Update quest progress based on game events
  const updateQuestProgress = useCallback(() => {
    setQuests(prev => prev.map(quest => {
      if (!quest.active || quest.completed) return quest;

      let newProgress = 0;

      switch (quest.objectiveType) {
        case 'kill_monsters':
          // Calculate kills since quest was accepted
          newProgress = Math.max(0, totalKills - (quest.currentKillsAtAccept || 0));
          break;
        case 'reach_wave':
          // Calculate waves since quest was accepted
          newProgress = Math.max(0, wave - (quest.currentWaveAtAccept || 0));
          break;
        case 'collect_gold':
          // Calculate gold earned since quest was accepted
          newProgress = Math.max(0, heroGold - (quest.currentGoldAtAccept || 0));
          break;
        case 'defeat_boss':
          // Calculate boss kills since quest was accepted (every 10 kills is a boss)
          const currentBossKills = Math.floor(totalKills / 10);
          newProgress = Math.max(0, currentBossKills - (quest.currentBossKillsAtAccept || 0));
          break;
      }

      return { ...quest, progress: newProgress };
    }));
  }, [totalKills, wave, heroGold]);

  const spawnNewEnemy = useCallback(() => {
    const newWave = wave + 1;
    setWave(newWave);

    // Increment waves since last event
    setWavesSinceLastEvent(prev => prev + 1);

    // Track kills for biome progression
    const newBiomeKills = biomeKills + 1;
    const newTotalKills = totalKills + 1;
    setBiomeKills(newBiomeKills);
    setTotalKills(newTotalKills);

    // Check if next enemy should be a boss (every 10 kills in biome)
    const nextIsBoss = newBiomeKills > 0 && newBiomeKills % 10 === 0;
    setIsBossWave(nextIsBoss);

    // EXCLUSIVITY CHECK: Don't show path choice if NPC dialogue is active
    if (currentNPCQuest !== null) {
      // Skip path choice, just spawn enemy
      spawnRandomEnemy(nextIsBoss);
      setEnemyX(enemySpawnX);
      setGamePhase('approaching');
      lastHeroAttackRef.current = Date.now();
      lastEnemyAttackRef.current = Date.now();
      return;
    }

    // EXCLUSIVITY CHECK: Don't show path choice if another path choice is already active
    if (showPathChoice) {
      return; // Already showing path choice, don't spawn enemy yet
    }

    // Path choice is now triggered by quest completion, not by wave count
    // The completeQuest function will handle showing the path choice modal

    // Spawn random enemy based on boss status
    spawnRandomEnemy(nextIsBoss);

    setEnemyX(enemySpawnX);
    setGamePhase('approaching');
    lastHeroAttackRef.current = Date.now();
    lastEnemyAttackRef.current = Date.now();
  }, [wave, biomeKills, totalKills, enemySpawnX, spawnRandomEnemy]);

  // === Attribute Upgrade Functions ===
  const upgradeAttribute = useCallback((attribute: keyof HeroAttributes) => {
    const cost = attributeCosts[attribute];
    if (heroGold < cost) return;

    setHeroGold((prev) => prev - cost);

    setHeroAttributes((prev) => {
      const newAttrs = { ...prev };
      switch (attribute) {
        case 'attack': newAttrs.attack += 5; break;
        case 'defense': newAttrs.defense += 3; break;
        case 'maxHp':
          newAttrs.maxHp += 20;
          setHeroHp((hp) => hp + 20);
          break;
        case 'speed': newAttrs.speed += 2; break;
        case 'critChance': newAttrs.critChance += 1; break;
        case 'regen': newAttrs.regen += 1; break;
      }
      return newAttrs;
    });

    setAttributeCosts((prev) => ({
      ...prev,
      [attribute]: Math.floor(prev[attribute] * 1.3), // Smoother cost growth
    }));
  }, [heroGold, attributeCosts]);

  // === Use Skill Function ===
  const useSkill = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || !skill.unlocked) return;

    const now = Date.now();
    const cooldownMs = skill.cooldown * 1000;

    // Check if on cooldown
    if (now - skill.lastUsed < cooldownMs) return;

    // Apply skill effect
    switch (skill.effect) {
      case 'damage': {
        // Power Strike - deal extra damage to enemy
        const baseDamage = heroAttributes.attack * skill.effectValue;
        const isCrit = Math.random() * 100 < heroAttributes.critChance;
        const damage = Math.round(isCrit ? baseDamage * 2 : baseDamage);

        spawnDamagePopup(damage, enemyXRef.current, isCrit, false, true);
        setEnemyHitFlash(true);
        setTimeout(() => setEnemyHitFlash(false), 300);

        setEnemyHp((prev) => {
          const newHp = prev - damage;
          if (newHp <= 0) {
            const currentWave = waveRef.current;
            const goldReward = baseEnemyGold + (currentWave - 1) * 5;
            const xpReward = baseEnemyXp + (currentWave - 1) * 8;
            setHeroGold((g) => g + goldReward);
            setHeroXp((x) => x + xpReward);

            // Generate item drop
            const droppedItem = generateItemDrop();
            if (droppedItem) {
              setInventory((prev) => [...prev, droppedItem]);

              // Show toast for rare/epic items
              if (droppedItem.rarity === 'rare' || droppedItem.rarity === 'epic') {
                const rarityEmoji = droppedItem.rarity === 'rare' ? '💎' : '👑';
                addToast(`${rarityEmoji} Item Encontrado: ${droppedItem.name}!`, 'drop');
              }
            }

            // Decrement path difficulty remaining enemies
            if (pathDifficultyMultiplier.remainingEnemies > 0) {
              setPathDifficultyMultiplier(prev => {
                const newRemaining = prev.remainingEnemies - 1;
                if (newRemaining <= 0) {
                  return {
                    hpMultiplier: 1.0,
                    attackMultiplier: 1.0,
                    rewardMultiplier: 1.0,
                    dropChanceBonus: 0,
                    remainingEnemies: 0,
                  };
                }
                return { ...prev, remainingEnemies: newRemaining };
              });
            }

            // Spawn next enemy immediately
            spawnNewEnemy();
            return 0;
          }
          return newHp;
        });
        break;
      }
      case 'heal': {
        // Quick Heal - restore HP
        const healAmount = Math.floor(heroAttributes.maxHp * skill.effectValue);
        setHeroHp((prev) => Math.min(heroAttributes.maxHp, prev + healAmount));
        spawnDamagePopup(healAmount, heroX, false, true, true);
        break;
      }
      case 'buff': {
        // Fury - temporary attack boost
        const buff: ActiveBuff = {
          id: `${skillId}_${now}`,
          skillId,
          expiresAt: now + (skill.buffDuration || 5) * 1000,
          multiplier: skill.effectValue,
        };
        setActiveBuffs((prev) => [...prev, buff]);
        break;
      }
    }

    // Update last used time
    setSkills((prev) => prev.map(s =>
      s.id === skillId ? { ...s, lastUsed: now } : s
    ));
  }, [skills, heroAttributes, spawnDamagePopup, spawnNewEnemy]);

  // === Upgrade Skill Function ===
  const upgradeSkill = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || !skill.unlocked || heroGold < skill.cost) return;

    setHeroGold((prev) => prev - skill.cost);
    setSkills((prev) => prev.map(s =>
      s.id === skillId
        ? {
          ...s,
          level: s.level + 1,
          cost: Math.floor(s.cost * 1.3), // Smoother cost growth
          effectValue: s.effect === 'damage'
            ? s.effectValue + 0.25
            : s.effect === 'heal'
              ? s.effectValue + 0.05
              : s.effectValue + 0.2,
        }
        : s
    ));
  }, [skills, heroGold]);

  // === Toggle Auto-Cast ===
  const toggleAutoCast = useCallback((skillId: string) => {
    setSkills((prev) => prev.map(s =>
      s.id === skillId ? { ...s, autoCast: !s.autoCast } : s
    ));
  }, []);

  // === Skill Deck Management ===
  const equipSkill = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || !skill.unlocked) return;

    // If already equipped, unequip it
    if (equippedSkillIds.includes(skillId)) {
      setEquippedSkillIds(prev => prev.filter(id => id !== skillId));
      return;
    }

    // If 3 skills already equipped, replace the first one
    if (equippedSkillIds.length >= 3) {
      setEquippedSkillIds(prev => [...prev.slice(1), skillId]);
    } else {
      setEquippedSkillIds(prev => [...prev, skillId]);
    }
  }, [skills, equippedSkillIds]);

  // === Buy Skill from Market ===
  const buySkill = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.unlocked) return;
    if (heroGold < skill.cost) return;
    if (skill.requiredLevel && heroLevel < skill.requiredLevel) return;

    setHeroGold(prev => prev - skill.cost);
    setSkills(prev => prev.map(s =>
      s.id === skillId ? { ...s, unlocked: true } : s
    ));

    // Auto-equip if less than 3 equipped
    if (equippedSkillIds.length < 3) {
      setEquippedSkillIds(prev => [...prev, skillId]);
    }

    addToast(`🎉 Habilidade desbloqueada: ${skill.name}!`, 'info');
  }, [skills, heroGold, heroLevel, equippedSkillIds, addToast]);

  // === Buy Consumable ===
  const buyConsumable = useCallback((consumableId: string) => {
    const consumable = consumables.find(c => c.id === consumableId);
    if (!consumable) return;
    if (heroGold < consumable.cost) return;
    if (heroLevel < consumable.requiredLevel) return;

    setHeroGold(prev => prev - consumable.cost);

    // Apply consumable effect immediately
    if (consumable.effect === 'heal') {
      const healAmount = Math.floor(heroAttributes.maxHp * consumable.value);
      setHeroHp(prev => Math.min(heroAttributes.maxHp, prev + healAmount));
      addToast(`❤️ +${healAmount} HP restaurado!`, 'info');
    } else {
      // Buff effect
      const activeConsumable: ActiveConsumable = {
        id: `${consumableId}_${Date.now()}`,
        consumableId,
        expiresAt: Date.now() + consumable.duration * 1000,
        value: consumable.value,
      };
      setActiveConsumables(prev => [...prev, activeConsumable]);
      addToast(`${consumable.icon} ${consumable.name} ativada!`, 'info');
    }
  }, [consumables, heroGold, heroLevel, heroAttributes.maxHp, addToast]);

  // === Buy Item from Shop ===
  const buyShopItem = useCallback((itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    if (heroGold < item.sellValue) return;
    if (heroLevel < (item.requiredLevel || 1)) return;
    if (inventory.length >= inventoryCapacity) {
      addToast('⚠️ Inventário cheio!', 'info');
      return;
    }

    setHeroGold(prev => prev - item.sellValue);

    // Create new item instance with unique ID
    const newItem: Item = {
      ...item,
      id: `${item.id}_${Date.now()}_${Math.random()}`,
    };

    setInventory(prev => [...prev, newItem]);
    addToast(`🛡️ ${item.name} comprado!`, 'info');
  }, [shopItems, heroGold, heroLevel, inventory.length, addToast]);

  // === Buy Premium Item ===
  const buyPremiumItem = useCallback((itemId: string) => {
    const item = premiumItems.find(i => i.id === itemId);
    if (!item) return;

    // Diamond packs are free (simulated purchase)
    if (item.type === 'diamond_pack') {
      setHeroDiamonds(prev => prev + (item.value || 0));
      addToast(`💎 +${item.value} diamantes adquiridos!`, 'info');
      return;
    }

    // Check if player has enough diamonds
    if (heroDiamonds < item.price) {
      addToast('❌ Diamantes insuficientes!', 'info');
      return;
    }

    // Deduct diamonds
    setHeroDiamonds(prev => prev - item.price);

    // Apply effect based on type
    switch (item.type) {
      case 'speed_boost':
        setIsSpeedBoosted(true);
        setActivePremiumEffects(prev => [...prev, {
          id: `speed_${Date.now()}`,
          itemId: item.id,
          expiresAt: Date.now() + (item.duration || 0) * 1000,
          value: 2,
        }]);
        addToast(`⚡ Velocidade 2x ativada por 1 hora!`, 'info');
        break;

      case 'no_ads':
        setHasNoAds(true);
        addToast(`🚫 Anúncios removidos permanentemente!`, 'info');
        break;

      case 'revive':
        // Revive is stored as consumable, not immediately applied
        addToast(`❤️ Vida Extra adquirida! Use ao morrer.`, 'info');
        break;

      case 'xp_boost':
        setActivePremiumEffects(prev => [...prev, {
          id: `xp_${Date.now()}`,
          itemId: item.id,
          expiresAt: Date.now() + (item.duration || 0) * 1000,
          value: 2,
        }]);
        addToast(`🍀 Bônus 2x XP/Ouro ativado por 1 hora!`, 'info');
        break;

      case 'inventory_expansion':
        setInventoryCapacity(prev => prev + (item.value || 10));
        addToast(`🎒 Inventário expandido em +${item.value} slots!`, 'info');
        break;
    }
  }, [premiumItems, heroDiamonds, addToast]);

  // === Use Revive (Premium Item) ===
  const useRevive = useCallback(() => {
    // Check if player has revive item
    const hasRevive = activePremiumEffects.some(e => e.itemId === 'revive');
    if (!hasRevive) {
      addToast('❌ Você não tem Vida Extra!', 'info');
      return false;
    }

    // Remove revive effect
    setActivePremiumEffects(prev => prev.filter(e => e.itemId !== 'revive'));

    // Restore HP
    setHeroHp(heroAttributes.maxHp);
    addToast(`❤️ Ressuscitado com vida cheia!`, 'info');
    return true;
  }, [activePremiumEffects, heroAttributes.maxHp, addToast]);

  // === Generate Random Item Drop ===
  const generateItemDrop = useCallback((): Item | null => {
    // 30% base chance to drop an item + path difficulty bonus
    const dropChance = 0.3 + pathDifficultyMultiplier.dropChanceBonus;
    if (Math.random() > dropChance) return null;

    // Rarity weights adjusted by path difficulty bonus
    // Base: common 60%, rare 30%, epic 10%
    // With bonus: shift towards higher rarities
    const rarityRoll = Math.random();
    let targetRarity: ItemRarity;
    const epicBonus = pathDifficultyMultiplier.dropChanceBonus * 0.5; // Half of bonus goes to epic
    const rareBonus = pathDifficultyMultiplier.dropChanceBonus * 0.3; // 30% goes to rare

    if (rarityRoll < 0.6 - rareBonus - epicBonus) targetRarity = 'common';
    else if (rarityRoll < 0.9 - epicBonus + rareBonus) targetRarity = 'rare';
    else targetRarity = 'epic';

    // Filter items by rarity
    const availableItems = itemDatabase.filter(item => item.rarity === targetRarity);
    if (availableItems.length === 0) return null;

    // Pick random item from filtered list
    const template = availableItems[Math.floor(Math.random() * availableItems.length)];

    // === Upgrade Level System ===
    // Base probabilities for upgrade levels
    let upgradeLevel = 0;
    const upgradeRoll = Math.random();

    // Boss drops have better upgrade chances
    const bossBonus = isBossWave ? 0.15 : 0;

    // Biome bonus: higher biomes have better upgrade chances
    const biomeIndex = biomes.findIndex(b => b.id === currentBiomeId);
    const biomeBonus = biomeIndex * 0.05; // +5% per biome tier

    // Progressive upgrade chances
    const upgradeChances = [
      0.65 - bossBonus - biomeBonus, // +0: ~65% (reduced by bonuses)
      0.20, // +1: 20%
      0.09, // +2: 9%
      0.04, // +3: 4%
      0.018, // +4: 1.8%
      0.002, // +5: 0.2% (Legendary)
    ];

    let cumulative = 0;
    for (let i = 0; i < upgradeChances.length; i++) {
      cumulative += upgradeChances[i];
      if (upgradeRoll < cumulative) {
        upgradeLevel = i;
        break;
      }
    }

    // Scale bonuses based on wave
    const waveBonus = Math.floor((wave - 1) * 0.1); // +10% per wave

    // Apply upgrade level multiplier (each +1 adds 25% to base stats)
    const upgradeMultiplier = 1 + (upgradeLevel * 0.25);

    const scaledBonuses: Partial<HeroAttributes> = {};
    Object.entries(template.bonuses).forEach(([key, value]) => {
      if (value !== undefined) {
        const waveScaled = value + Math.floor(value * waveBonus);
        scaledBonuses[key as keyof HeroAttributes] = Math.round(waveScaled * upgradeMultiplier);
      }
    });

    // Calculate final name with upgrade suffix
    let finalName = template.name;
    if (upgradeLevel > 0) {
      finalName = `${template.name} +${upgradeLevel}`;
    }

    // Calculate sell value with upgrade bonus
    const baseSellValue = template.sellValue * (1 + waveBonus);
    const upgradeSellBonus = 1 + (upgradeLevel * 0.5); // +50% per upgrade level
    const finalSellValue = Math.round(baseSellValue * upgradeSellBonus);

    return {
      ...template,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: finalName,
      bonuses: scaledBonuses,
      sellValue: finalSellValue,
      upgradeLevel: upgradeLevel,
    };
  }, [wave, isBossWave, currentBiomeId, biomes]);

  // === Equip Item ===
  const equipItem = useCallback((itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Remove from inventory
    setInventory((prev) => prev.filter(i => i.id !== itemId));

    // If there's already an item in that slot, unequip it first
    const currentEquipped = equipment[item.slot];
    if (currentEquipped) {
      setInventory((prev) => [...prev, currentEquipped]);
    }

    // Equip new item
    setEquipment((prev) => ({
      ...prev,
      [item.slot]: item,
    }));
  }, [inventory, equipment]);

  // === Unequip Item ===
  const unequipItem = useCallback((slot: EquipmentSlot) => {
    const item = equipment[slot];
    if (!item) return;

    // Move to inventory
    setInventory((prev) => [...prev, item]);

    // Clear slot
    setEquipment((prev) => ({
      ...prev,
      [slot]: null,
    }));
  }, [equipment]);

  // === Sell Item ===
  const sellItem = useCallback((itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    setHeroGold((prev) => prev + item.sellValue);
    setInventory((prev) => prev.filter(i => i.id !== itemId));
  }, [inventory]);

  // === Calculate Equipment Bonuses ===
  const getEquipmentBonuses = useCallback((): HeroAttributes => {
    const totalBonuses: Record<keyof HeroAttributes, number> = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      speed: 0,
      critChance: 0,
      regen: 0,
    };

    Object.values(equipment).forEach((item) => {
      if (item) {
        (Object.entries(item.bonuses) as [keyof HeroAttributes, number][]).forEach(([key, value]) => {
          if (typeof value === 'number') {
            totalBonuses[key] += value;
          }
        });
      }
    });

    return totalBonuses;
  }, [equipment]);

  // Get effective attributes (base + equipment bonuses)
  const equipmentBonuses = getEquipmentBonuses();
  const effectiveAttributes: HeroAttributes = {
    attack: heroAttributes.attack + equipmentBonuses.attack,
    defense: heroAttributes.defense + equipmentBonuses.defense,
    maxHp: heroAttributes.maxHp + equipmentBonuses.maxHp,
    speed: heroAttributes.speed + equipmentBonuses.speed,
    critChance: heroAttributes.critChance + equipmentBonuses.critChance,
    regen: heroAttributes.regen + equipmentBonuses.regen,
  };

  // === Hero Death Handler ===
  const handleHeroDeath = useCallback(() => {
    console.log('[Death] Hero has been defeated!');
    setGamePhase('respawning');

    // Apply penalty: if died to boss, reduce wave by 1
    if (isBossWave) {
      console.log('[Death] Died to boss - reducing wave by 1');
      setWave((prev) => Math.max(1, prev - 1));
      setIsBossWave(false);
    }

    // Reset enemy position after 2 seconds and restore HP
    setTimeout(() => {
      setHeroHp(effectiveAttributes.maxHp);
      setEnemyX(enemySpawnX);
      setGamePhase('approaching');
      console.log('[Respawn] Hero respawned with full HP');
    }, 2000);
  }, [isBossWave, effectiveAttributes.maxHp, enemySpawnX]);

  // === Main Game Loop ===
  useEffect(() => {
    // Don't run game loop if game hasn't started yet or is paused
    if (!isGameStarted || isPaused) return;

    const interval = setInterval(() => {
      const currentPhase = gamePhaseRef.current;
      const currentEnemyX = enemyXRef.current;
      const distance = currentEnemyX - heroX;
      const now = Date.now();
      const currentAttrs = heroAttributesRef.current;
      // Use effective attributes (base + equipment bonuses) for combat
      const combatAttrs = effectiveAttributes;

      if (currentPhase === 'approaching') {
        if (distance > attackRange) {
          setEnemyX((prev) => prev - enemySpeed);
          setScrollOffset((prev) => prev + enemySpeed * 0.5);
        } else {
          setGamePhase('fighting');
          lastHeroAttackRef.current = now;
          lastEnemyAttackRef.current = now;
          lastRegenRef.current = now;
        }
      } else if (currentPhase === 'fighting') {
        // Clean up expired buffs
        setActiveBuffs((prev) => prev.filter(buff => buff.expiresAt > now));

        // Calculate attack multiplier from active buffs
        const attackMultiplier = activeBuffs.reduce((mult, buff) => mult * buff.multiplier, 1);

        // Auto-cast skills
        skills.forEach(skill => {
          if (skill.unlocked && skill.autoCast) {
            const cooldownMs = skill.cooldown * 1000;
            if (now - skill.lastUsed >= cooldownMs) {
              useSkill(skill.id);
            }
          }
        });

        // Hero attacks enemy
        if (now - lastHeroAttackRef.current >= heroAttackSpeed) {
          lastHeroAttackRef.current = now;

          const isCrit = Math.random() * 100 < combatAttrs.critChance;
          const baseDamage = combatAttrs.attack * attackMultiplier;
          const damage = Math.round(isCrit ? baseDamage * 2 : baseDamage);

          // Spawn damage popup on enemy
          spawnDamagePopup(damage, currentEnemyX, isCrit);

          // Trigger enemy hit flash
          setEnemyHitFlash(true);
          setTimeout(() => setEnemyHitFlash(false), 200);

          setEnemyHp((prev) => {
            const newHp = prev - damage;

            if (newHp <= 0) {
              const currentWave = waveRef.current;
              const goldReward = baseEnemyGold + (currentWave - 1) * 5;
              const xpReward = baseEnemyXp + (currentWave - 1) * 8;

              setHeroGold((g) => g + goldReward);
              setHeroXp((x) => x + xpReward);

              // Show boss defeated toast
              if (isBossWave) {
                addToast('☠️ CHEFÃO DERROTADO! Recompensas Triplicadas!', 'boss');
              }

              // Generate item drop
              const droppedItem = generateItemDrop();
              if (droppedItem) {
                setInventory((prev) => [...prev, droppedItem]);

                // Show toast for rare/epic items
                if (droppedItem.rarity === 'rare' || droppedItem.rarity === 'epic') {
                  const rarityEmoji = droppedItem.rarity === 'rare' ? '💎' : '👑';
                  addToast(`${rarityEmoji} Item Encontrado: ${droppedItem.name}!`, 'drop');
                }
              }

              // Decrement path difficulty remaining enemies
              if (pathDifficultyMultiplier.remainingEnemies > 0) {
                setPathDifficultyMultiplier(prev => {
                  const newRemaining = prev.remainingEnemies - 1;
                  if (newRemaining <= 0) {
                    // Reset to default when path ends
                    return {
                      hpMultiplier: 1.0,
                      attackMultiplier: 1.0,
                      rewardMultiplier: 1.0,
                      dropChanceBonus: 0,
                      remainingEnemies: 0,
                    };
                  }
                  return { ...prev, remainingEnemies: newRemaining };
                });
              }

              // Spawn next enemy immediately
              spawnNewEnemy();

              return 0;
            }
            return newHp;
          });
        }

        // Enemy attacks hero
        if (enemyHpRef.current > 0 && now - lastEnemyAttackRef.current >= enemyAttackSpeed) {
          lastEnemyAttackRef.current = now;
          const currentWave = waveRef.current;

          // Recalculate enemy attack with same formula as enemyAttackPower
          const currentBiomeData = biomes.find(b => b.id === currentBiomeId) || biomes[0];
          const currentBiomeMultiplier = currentBiomeData.enemyMultiplier;
          const currentHeroLevelScale = 1 + (heroLevel - 1) * 0.15;
          const currentWaveAttackScale = 1 + Math.log(currentWave) * 0.5; // Logarithmic growth
          const currentEnemyAttack = Math.floor(
            baseEnemyAttack *
            currentWaveAttackScale *
            currentBiomeMultiplier.attack *
            currentHeroLevelScale
          );

          // Defense reduces damage by percentage, not flat subtraction
          // Formula: damage = attack * (1 - defense/(defense + 100))
          // This ensures damage is always at least 10% of attack
          const defenseReduction = combatAttrs.defense / (combatAttrs.defense + 100);
          const damage = Math.max(1, Math.round(currentEnemyAttack * (1 - defenseReduction)));

          // Spawn damage popup on hero
          spawnDamagePopup(damage, heroX, false);

          // Trigger hero hit flash
          setHeroHitFlash(true);
          setTimeout(() => setHeroHitFlash(false), 200);

          setHeroHp((prev) => {
            const newHp = Math.max(0, prev - damage);

            // Check if hero died
            if (newHp <= 0) {
              handleHeroDeath();
            }

            return newHp;
          });
        }

        // HP Regeneration (every 1 second)
        if (now - lastRegenRef.current >= 1000) {
          lastRegenRef.current = now;
          if (combatAttrs.regen > 0 && heroHpRef.current < combatAttrs.maxHp) {
            const healAmount = combatAttrs.regen;
            setHeroHp((prev) => Math.min(combatAttrs.maxHp, prev + healAmount));
            spawnDamagePopup(healAmount, heroX, false, true);
          }
        }
      } else if (currentPhase === 'respawning') {
        // Do nothing during respawn - hero is recovering
        // The setTimeout in handleHeroDeath will handle the respawn logic
      }

      // Update quest progress
      updateQuestProgress();

      // EXCLUSIVITY CHECK: Only check for NPC encounters if no modals are active
      if (!showPathChoice && currentNPCQuest === null) {
        checkAndSpawnNPC();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [heroX, attackRange, enemySpeed, heroAttackSpeed, enemyAttackSpeed, spawnNewEnemy, spawnDamagePopup, useSkill, activeBuffs, skills, generateItemDrop, effectiveAttributes, handleHeroDeath, updateQuestProgress, checkAndSpawnNPC, showPathChoice, currentNPCQuest, isGameStarted, isPaused]);

  // === Consistency Check ===
  useEffect(() => {
    console.log('[Consistency Check] Game State:');
    console.log('  - Hero Level:', heroLevel);
    console.log('  - Hero XP:', heroXp, '/', heroLevel * 100);
    console.log('  - Hero HP:', heroHp, '/', heroAttributes.maxHp);
    console.log('  - Hero Gold:', heroGold);
    console.log('  - Current Biome:', currentBiomeId);
    console.log('  - Wave:', wave);
    console.log('  - Enemy HP:', enemyHp, '/', enemyMaxHp);
    console.log('  - Inventory:', inventory.length, '/20');
    console.log('  - Equipment:', {
      weapon: equipment.weapon?.name || 'Empty',
      armor: equipment.armor?.name || 'Empty',
      accessory: equipment.accessory?.name || 'Empty',
    });
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950">
      {/* Game Paused Overlay */}
      {!isGameStarted && !showCharacterCreation && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">⚔️</div>
            <h2 className="text-2xl font-bold text-purple-300 mb-2">Jogo Pausado</h2>
            <p className="text-sm text-gray-400">Aguardando início da aventura...</p>
          </div>
        </div>
      )}

      {/* Top: HUD/Header */}
      <div className="relative h-12 w-full shrink-0 z-[60]">
        <PlayerStatus
          level={heroLevel}
          gold={heroGold}
          diamonds={heroDiamonds}
          currentBiome={currentBiome}
          biomes={biomes}
          biomeKills={biomeKills}
          totalKills={totalKills}
          isBiomeUnlocked={isBiomeUnlocked}
          onChangeBiome={changeBiome}
          onOpenSettings={() => setShowSettings(true)}
          onOpenMerchant={() => setShowMerchantShop(true)}
          onOpenDiamondShop={() => setShowDiamondShop(true)}
        />
      </div>

      {/* Center: Game Viewport + Skills + HP/XP Bars */}
      <div className={`${activeDrawer ? 'h-[34dvh]' : 'h-[55dvh] max-h-[550px]'} min-h-0 shrink-0 sm:flex-1 sm:h-auto sm:max-h-none w-full overflow-hidden relative z-[10] bg-slate-950`}>
        <div className="w-full h-full relative">
          <ToastContainer toasts={toasts} />
          <GameViewport
            heroX={heroX}
            heroName={heroName}
            heroHp={heroHp}
            heroMaxHp={heroAttributes.maxHp}
            heroXp={heroXp}
            heroMaxXp={xpToNextLevel}
            enemyX={enemyX}
            enemyHp={enemyHp}
            enemyMaxHp={enemyMaxHp}
            scrollOffset={scrollOffset}
            gamePhase={gamePhase}
            wave={wave}
            damagePopups={damagePopups}
            heroHitFlash={heroHitFlash}
            enemyHitFlash={enemyHitFlash}
            skills={skills}
            equippedSkillIds={equippedSkillIds}
            activeBuffs={activeBuffs}
            onUseSkill={useSkill}
            currentBiome={currentBiome}
            currentEnemy={currentEnemy}
            isBossWave={isBossWave}
            biomeKills={biomeKills}
          />
        </div>
      </div>

      {/* Combat Activity History */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto bg-slate-950 border-t border-purple-900/50 px-3 py-3 sm:hidden">
        <div className="rounded-lg border border-purple-800/60 bg-slate-900/80 px-3 py-3 shadow-md">
          <h3 className="text-sm font-bold text-purple-300 mb-2 leading-relaxed">
            📜 Atividades Recentes
          </h3>

          {combatHistory.length === 0 ? (
            <p className="text-xs text-gray-500">
              Nenhum evento registrado ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {combatHistory.map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-slate-700/80 bg-slate-950 px-3 py-2.5 text-xs leading-relaxed text-gray-200 break-words"
                >
                  {event.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Bottom: Bottom Bar Fixed */}
      <div className="relative h-16 w-full shrink-0 z-[60] bg-slate-900 border-t border-slate-700 flex items-center justify-around">
        <button
          onClick={() => handleDrawerToggle('attributes')}
          className={`flex-1 h-full flex flex-col items-center justify-center transition-all ${activeDrawer === 'attributes'
            ? 'text-purple-400 bg-purple-900/20 border-t-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
        >
          <span className="text-2xl">⚔️</span>
          <span className="text-[10px] font-medium">Atributos</span>
        </button>
        <button
          onClick={() => handleDrawerToggle('skills')}
          className={`flex-1 h-full flex flex-col items-center justify-center transition-all ${activeDrawer === 'skills'
            ? 'text-purple-400 bg-purple-900/20 border-t-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
        >
          <span className="text-2xl">✨</span>
          <span className="text-[10px] font-medium">Skills</span>
        </button>
        <button
          onClick={() => handleDrawerToggle('inventory')}
          className={`flex-1 h-full flex flex-col items-center justify-center transition-all ${activeDrawer === 'inventory'
            ? 'text-purple-400 bg-purple-900/20 border-t-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
        >
          <span className="text-2xl">🎒</span>
          <span className="text-[10px] font-medium">Bag</span>
        </button>
        <button
          onClick={() => handleDrawerToggle('quests')}
          className={`flex-1 h-full flex flex-col items-center justify-center transition-all ${activeDrawer === 'quests'
            ? 'text-purple-400 bg-purple-900/20 border-t-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
        >
          <span className="text-2xl">📜</span>
          <span className="text-[10px] font-medium">Quests</span>
        </button>
      </div>

      {/* Drawer Portal */}
      <Drawer
        activeDrawer={activeDrawer}
        onClose={() => setActiveDrawer(null)}
        heroAttributes={heroAttributes}
        attributeCosts={attributeCosts}
        heroGold={heroGold}
        onUpgradeAttribute={upgradeAttribute}
        skills={skills}
        equippedSkillIds={equippedSkillIds}
        onUpgradeSkill={upgradeSkill}
        onToggleAutoCast={toggleAutoCast}
        onEquipSkill={equipSkill}
        inventory={inventory}
        equipment={equipment}
        inventoryCapacity={inventoryCapacity}
        onEquipItem={equipItem}
        onUnequipItem={unequipItem}
        onSellItem={sellItem}
        quests={quests}
        onCompleteQuest={completeQuest}
      />

      {/* Character Creation Modal (First Time) */}
      {showCharacterCreation && (
        <CharacterCreationModal onStartAdventure={handleStartAdventure} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          heroName={heroName}
          onChangeName={handleChangeName}
          onResetGame={resetGame}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Merchant Shop Modal */}
      {showMerchantShop && (
        <MerchantShop
          skills={skills}
          consumables={consumables}
          shopItems={shopItems}
          heroGold={heroGold}
          heroLevel={heroLevel}
          equippedSkillIds={equippedSkillIds}
          inventoryCount={inventory.length}
          inventoryCapacity={inventoryCapacity}
          onBuySkill={buySkill}
          onBuyConsumable={buyConsumable}
          onBuyItem={buyShopItem}
          onEquipSkill={equipSkill}
          onClose={handleCloseMerchantShop}
        />
      )}

      {/* Diamond Shop Modal */}
      {showDiamondShop && (
        <DiamondShopModal
          premiumItems={premiumItems}
          heroDiamonds={heroDiamonds}
          onBuyItem={buyPremiumItem}
          onClose={() => setShowDiamondShop(false)}
        />
      )}

      {/* Path Choice Modal */}
      {showPathChoice && (
        <PathChoiceModal onChoose={handlePathChoice} onOpenShop={handleOpenShopFromPath} />
      )}

      {/* NPC Dialogue Modal */}
      {currentNPCQuest && (
        <NPCDialogueModal
          quest={currentNPCQuest}
          onAccept={() => acceptQuest(currentNPCQuest)}
          onDecline={declineQuest}
        />
      )}
    </div>
  );
}
