import { useRef, useState } from 'react';
import type {
  ActiveBuff,
  ActiveConsumable,
  ActivePremiumEffect,
  AttributeCosts,
  Equipment,
  HeroAttributes,
  Item,
  Skill,
} from '../types/game';
import type { Quest } from '../data/questsData';
import {
  DEFAULT_ATTRIBUTE_COSTS,
  DEFAULT_HERO_ATTRIBUTES,
  INVENTORY_BASE_CAPACITY,
} from '../lib/constants';
import { initialSkills } from '../data/skillsData';

// === Estado global do herói/jogo — apenas declarações de useState, com os MESMOS defaults do App.tsx original ===
export const useGameState = () => {
  // === Hero State (fixed position) ===
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
  const [inventoryCapacity, setInventoryCapacity] = useState(INVENTORY_BASE_CAPACITY); // Can be expanded with premium items

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

  // Hero attributes (upgradable) - New Game defaults
  const [heroAttributes, setHeroAttributes] = useState<HeroAttributes>(DEFAULT_HERO_ATTRIBUTES);

  // Attribute upgrade costs - New Game defaults
  const [attributeCosts, setAttributeCosts] = useState<AttributeCosts>(DEFAULT_ATTRIBUTE_COSTS);

  // === Skills System === - New Game defaults (3 initial skills)
  const [skills, setSkills] = useState<Skill[]>(initialSkills);

  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);

  // === Skill Deck System ===
  const [equippedSkillIds, setEquippedSkillIds] = useState<string[]>(['power_strike', 'quick_heal', 'fury']);

  // === Consumables System ===
  const [activeConsumables, setActiveConsumables] = useState<ActiveConsumable[]>([]);

  // === Quest System ===
  const [currentNPCQuest, setCurrentNPCQuest] = useState<Quest | null>(null);
  const lastNPCSpawnWave = useRef(0);
  const [wavesSinceLastEvent, setWavesSinceLastEvent] = useState(0);
  const [completedQuestsSinceLastPath, setCompletedQuestsSinceLastPath] = useState(0);

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

  // === Wave System === - Balanced progression
  const [wave, setWave] = useState(1);

  return {
    heroName, setHeroName,
    heroHp, setHeroHp,
    heroLevel, setHeroLevel,
    heroXp, setHeroXp,
    heroGold, setHeroGold,
    heroDiamonds, setHeroDiamonds,
    isSpeedBoosted, setIsSpeedBoosted,
    hasNoAds, setHasNoAds,
    activePremiumEffects, setActivePremiumEffects,
    inventoryCapacity, setInventoryCapacity,
    showCharacterCreation, setShowCharacterCreation,
    showSettings, setShowSettings,
    showMerchantShop, setShowMerchantShop,
    showDiamondShop, setShowDiamondShop,
    showPathChoice, setShowPathChoice,
    isFirstTime, setIsFirstTime,
    isGameStarted, setIsGameStarted,
    isPaused, setIsPaused,
    activeDrawer, setActiveDrawer,
    isResetting,
    heroAttributes, setHeroAttributes,
    attributeCosts, setAttributeCosts,
    skills, setSkills,
    activeBuffs, setActiveBuffs,
    equippedSkillIds, setEquippedSkillIds,
    activeConsumables, setActiveConsumables,
    currentNPCQuest, setCurrentNPCQuest,
    lastNPCSpawnWave,
    wavesSinceLastEvent, setWavesSinceLastEvent,
    completedQuestsSinceLastPath, setCompletedQuestsSinceLastPath,
    pathDifficultyMultiplier, setPathDifficultyMultiplier,
    inventory, setInventory,
    equipment, setEquipment,
    currentBiomeId, setCurrentBiomeId,
    biomeKills, setBiomeKills,
    totalKills, setTotalKills,
    isBossWave, setIsBossWave,
    wave, setWave,
  };
};
