import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';
import { saveGameData, loadGameData, clearSaveData } from './utils/gameSave';

type GamePhase = 'approaching' | 'fighting' | 'waiting' | 'respawning';

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
}

export interface ActiveBuff {
  id: string;
  skillId: string;
  expiresAt: number;
  multiplier: number;
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
}

export default function App() {
  // === Hero State (fixed position) ===
  const heroX = 150;
  const [heroHp, setHeroHp] = useState(100);
  const [heroLevel, setHeroLevel] = useState(1);
  const [heroXp, setHeroXp] = useState(0);
  const [heroGold, setHeroGold] = useState(10);

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

  // === Skills System === - New Game defaults
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
      autoCast: false,
      lastUsed: 0,
      effect: 'damage',
      effectValue: 2.5,
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
      autoCast: false,
      lastUsed: 0,
      effect: 'heal',
      effectValue: 0.3,
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
      autoCast: false,
      lastUsed: 0,
      effect: 'buff',
      effectValue: 2.0,
      buffDuration: 5,
    },
  ]);

  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);

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
    { name: 'Espada de Ferro', icon: '🗡️', slot: 'weapon', rarity: 'common', bonuses: { attack: 5 }, sellValue: 20 },
    { name: 'Machado de Guerra', icon: '🪓', slot: 'weapon', rarity: 'rare', bonuses: { attack: 12, critChance: 2 }, sellValue: 50 },
    { name: 'Lâmina Élfica', icon: '⚔️', slot: 'weapon', rarity: 'epic', bonuses: { attack: 25, critChance: 5, speed: 3 }, sellValue: 150 },
    // Armor
    { name: 'Escudo de Madeira', icon: '🛡️', slot: 'armor', rarity: 'common', bonuses: { defense: 4, maxHp: 10 }, sellValue: 15 },
    { name: 'Armadura de Couro', icon: '🦺', slot: 'armor', rarity: 'rare', bonuses: { defense: 10, maxHp: 25 }, sellValue: 60 },
    { name: 'Peitoral de Aço', icon: '⛓️', slot: 'armor', rarity: 'epic', bonuses: { defense: 20, maxHp: 50, regen: 2 }, sellValue: 180 },
    // Accessories
    { name: 'Anel de Vida', icon: '💍', slot: 'accessory', rarity: 'common', bonuses: { maxHp: 15, regen: 1 }, sellValue: 25 },
    { name: 'Amuleto de Velocidade', icon: '📿', slot: 'accessory', rarity: 'rare', bonuses: { speed: 5, critChance: 3 }, sellValue: 70 },
    { name: 'Coroa do Rei', icon: '👑', slot: 'accessory', rarity: 'epic', bonuses: { attack: 10, defense: 10, maxHp: 30, speed: 5 }, sellValue: 200 },
  ];

  // === Wave System === - Balanced for Level 1 hero
  const [wave, setWave] = useState(1);
  const baseEnemyHp = 30;
  const baseEnemyGold = 10;
  const baseEnemyXp = 15;
  const baseEnemyAttack = 3;
  
  // Scaled enemy stats per wave + biome multiplier
  const biomeMultiplier = currentBiome.enemyMultiplier;
  const isBoss = isBossWave;
  const bossMultiplier = isBoss ? 5 : 1; // Boss has 5x HP
  
  const enemyMaxHp = Math.floor((baseEnemyHp + (wave - 1) * 15) * biomeMultiplier.hp * bossMultiplier);
  const enemyGoldReward = Math.floor((baseEnemyGold + (wave - 1) * 5) * biomeMultiplier.gold * (isBoss ? 3 : 1));
  const enemyXpReward = Math.floor((baseEnemyXp + (wave - 1) * 8) * biomeMultiplier.xp * (isBoss ? 3 : 1));
  const enemyAttackPower = Math.floor((baseEnemyAttack + Math.floor((wave - 1) * 2)) * biomeMultiplier.attack);

  // === Enemy State (moves toward hero) ===
  const [enemyX, setEnemyX] = useState(700);
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
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
  const enemySpawnX = 750;
  const waitDuration = 2000;

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
      setHeroHp(savedData.heroHp);
      setHeroLevel(savedData.heroLevel);
      setHeroXp(savedData.heroXp);
      setHeroGold(savedData.heroGold);
      
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
      
      console.log('[Load] Game restored successfully!');
    } else {
      console.log('[New Game] Starting fresh game...');
      console.log('[New Game] Hero Level: 1');
      console.log('[New Game] Hero XP: 0/100');
      console.log('[New Game] Hero Gold: 10');
      console.log('[New Game] Current Biome: forest');
      console.log('[New Game] Wave: 1');
      console.log('[New Game] Game initialized successfully!');
    }
  }, []);

  // === Auto-Save System ===
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameData({
        heroHp,
        heroLevel,
        heroXp,
        heroGold,
        heroAttributes,
        attributeCosts,
        skills,
        inventory,
        equipment,
        currentBiomeId,
        biomeKills,
        totalKills,
        wave,
      });
    }, 5000); // Save every 5 seconds

    // Save on page close/refresh
    const handleBeforeUnload = () => {
      saveGameData({
        heroHp,
        heroLevel,
        heroXp,
        heroGold,
        heroAttributes,
        attributeCosts,
        skills,
        inventory,
        equipment,
        currentBiomeId,
        biomeKills,
        totalKills,
        wave,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [heroHp, heroLevel, heroXp, heroGold, heroAttributes, attributeCosts, skills, inventory, equipment, currentBiomeId, biomeKills, totalKills, wave]);

  // === Reset Game ===
  const resetGame = useCallback(() => {
    if (window.confirm('Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita!')) {
      clearSaveData();
      window.location.reload();
    }
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
    }
  }, [heroXp, heroAttributes.maxHp]);

  // === Spawn new enemy after delay ===
  const spawnNewEnemy = useCallback(() => {
    const newWave = wave + 1;
    setWave(newWave);
    
    // Track kills for biome progression
    const newBiomeKills = biomeKills + 1;
    const newTotalKills = totalKills + 1;
    setBiomeKills(newBiomeKills);
    setTotalKills(newTotalKills);
    
    // Check if next enemy should be a boss (every 10 kills in biome)
    const nextIsBoss = newBiomeKills > 0 && newBiomeKills % 10 === 0;
    setIsBossWave(nextIsBoss);
    
    setEnemyX(enemySpawnX);
    setGamePhase('approaching');
    lastHeroAttackRef.current = Date.now();
    lastEnemyAttackRef.current = Date.now();
  }, [wave, biomeKills, totalKills, enemySpawnX]);

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
      [attribute]: Math.floor(prev[attribute] * 1.5),
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
        const damage = isCrit ? baseDamage * 2 : baseDamage;
        
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
            setGamePhase('waiting');
            
            // Generate item drop
            const droppedItem = generateItemDrop();
            if (droppedItem) {
              setInventory((prev) => [...prev, droppedItem]);
            }
            
            setTimeout(() => spawnNewEnemy(), waitDuration);
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
            cost: Math.floor(s.cost * 1.5),
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

  // === Generate Random Item Drop ===
  const generateItemDrop = useCallback((): Item | null => {
    // 30% chance to drop an item
    if (Math.random() > 0.3) return null;

    // Rarity weights: common 60%, rare 30%, epic 10%
    const rarityRoll = Math.random();
    let targetRarity: ItemRarity;
    if (rarityRoll < 0.6) targetRarity = 'common';
    else if (rarityRoll < 0.9) targetRarity = 'rare';
    else targetRarity = 'epic';

    // Filter items by rarity
    const availableItems = itemDatabase.filter(item => item.rarity === targetRarity);
    if (availableItems.length === 0) return null;

    // Pick random item from filtered list
    const template = availableItems[Math.floor(Math.random() * availableItems.length)];
    
    // Scale bonuses based on wave
    const waveBonus = Math.floor((wave - 1) * 0.1); // +10% per wave
    const scaledBonuses: Partial<HeroAttributes> = {};
    Object.entries(template.bonuses).forEach(([key, value]) => {
      if (value !== undefined) {
        scaledBonuses[key as keyof HeroAttributes] = value + Math.floor(value * waveBonus);
      }
    });

    return {
      ...template,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bonuses: scaledBonuses,
      sellValue: Math.floor(template.sellValue * (1 + waveBonus)),
    };
  }, [wave]);

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
          const damage = isCrit ? baseDamage * 2 : baseDamage;

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
              setGamePhase('waiting');

              // Generate item drop
              const droppedItem = generateItemDrop();
              if (droppedItem) {
                setInventory((prev) => [...prev, droppedItem]);
              }

              setTimeout(() => {
                spawnNewEnemy();
              }, waitDuration);

              return 0;
            }
            return newHp;
          });
        }

        // Enemy attacks hero
        if (enemyHpRef.current > 0 && now - lastEnemyAttackRef.current >= enemyAttackSpeed) {
          lastEnemyAttackRef.current = now;
          const currentWave = waveRef.current;
          const currentEnemyAttack = baseEnemyAttack + Math.floor((currentWave - 1) * 2);
          const damage = Math.max(1, currentEnemyAttack - combatAttrs.defense);
          
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

        // HP Regeneration (every 2 seconds)
        if (now - lastRegenRef.current >= 2000) {
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
    }, 30);

    return () => clearInterval(interval);
  }, [heroX, attackRange, enemySpeed, heroAttackSpeed, enemyAttackSpeed, waitDuration, spawnNewEnemy, spawnDamagePopup, useSkill, activeBuffs, skills, generateItemDrop, effectiveAttributes, handleHeroDeath]);

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
    <div className="h-screen w-screen flex flex-col bg-[#0f0f1a] overflow-hidden">
      <PlayerStatus
        hp={heroHp}
        maxHp={heroAttributes.maxHp}
        level={heroLevel}
        xp={heroXp}
        maxXp={xpToNextLevel}
        gold={heroGold}
        currentBiome={currentBiome}
        biomes={biomes}
        biomeKills={biomeKills}
        totalKills={totalKills}
        isBiomeUnlocked={isBiomeUnlocked}
        onChangeBiome={changeBiome}
      />

      <GameViewport
        heroX={heroX}
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
        activeBuffs={activeBuffs}
        onUseSkill={useSkill}
        currentBiome={currentBiome}
        isBossWave={isBossWave}
        biomeKills={biomeKills}
      />

      <BottomPanel
        heroAttributes={heroAttributes}
        attributeCosts={attributeCosts}
        heroGold={heroGold}
        onUpgradeAttribute={upgradeAttribute}
        skills={skills}
        onUpgradeSkill={upgradeSkill}
        onToggleAutoCast={toggleAutoCast}
        inventory={inventory}
        equipment={equipment}
        onEquipItem={equipItem}
        onUnequipItem={unequipItem}
        onSellItem={sellItem}
        onResetGame={resetGame}
      />
    </div>
  );
}
