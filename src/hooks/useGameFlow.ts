import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type {
  Biome,
  DamagePopup,
  Enemy,
  GamePhase,
  HeroAttributes,
  Item,
  Toast,
} from '../types/game';
import {
  BASE_ENEMY_HP,
  ENEMY_SPAWN_X,
  MIN_WAVES_BETWEEN_EVENTS,
} from '../lib/constants';

// === Save/Load + Level Up + Bifurcação (Path Choice) — lógica idêntica ao App.tsx ===
interface GameFlowDeps {
  // Leitura de estado
  heroName: string;
  heroHp: number;
  heroLevel: number;
  heroXp: number;
  heroGold: number;
  heroDiamonds: number;
  heroAttributes: HeroAttributes;
  attributeCosts: import('../types/game').AttributeCosts;
  skills: import('../types/game').Skill[];
  inventory: Item[];
  equipment: import('../types/game').Equipment;
  inventoryCapacity: number;
  currentBiomeId: string;
  biomeKills: number;
  totalKills: number;
  wave: number;
  wavesSinceLastEvent: number;
  completedQuestsSinceLastPath: number;
  isSpeedBoosted: boolean;
  hasNoAds: boolean;
  activePremiumEffects: import('../types/game').ActivePremiumEffect[];
  combatHistory: Toast[];
  quests: import('../data/questsData').Quest[];
  biomes: Biome[];
  isBossWave: boolean;
  pathDifficultyMultiplier: {
    hpMultiplier: number;
    attackMultiplier: number;
    rewardMultiplier: number;
    dropChanceBonus: number;
    remainingEnemies: number;
  };
  gamePhase: GamePhase;
  enemyMaxHp: number;
  setEnemyMaxHp: Dispatch<SetStateAction<number>>;
  isResetting: RefObject<boolean>;
  isFirstTime: boolean;
  showCharacterCreation: boolean;
  setShowCharacterCreation: Dispatch<SetStateAction<boolean>>;
  // Setters
  setHeroHp: Dispatch<SetStateAction<number>>;
  setHeroLevel: Dispatch<SetStateAction<number>>;
  setHeroXp: Dispatch<SetStateAction<number>>;
  setHeroGold: Dispatch<SetStateAction<number>>;
  setCurrentNPCQuest: Dispatch<SetStateAction<import('../data/questsData').Quest | null>>;
  setWavesSinceLastEvent: Dispatch<SetStateAction<number>>;
  setCompletedQuestsSinceLastPath: Dispatch<SetStateAction<number>>;
  setShowPathChoice: Dispatch<SetStateAction<boolean>>;
  setIsFirstTime: Dispatch<SetStateAction<boolean>>;
  setIsGameStarted: Dispatch<SetStateAction<boolean>>;
  setHeroName: Dispatch<SetStateAction<string>>;
  setEnemySpawnX: Dispatch<SetStateAction<number>>;
  spawnRandomEnemy: (isBoss?: boolean) => void;
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
}

export const useGameFlow = (deps: GameFlowDeps) => {
  const {
    heroName, heroHp, heroLevel, heroXp, heroGold, heroDiamonds, heroAttributes, attributeCosts,
    skills, inventory, equipment, inventoryCapacity, currentBiomeId, biomeKills, totalKills,
    wave, wavesSinceLastEvent, completedQuestsSinceLastPath, isSpeedBoosted, hasNoAds,
    activePremiumEffects, combatHistory, quests, biomes, isBossWave, pathDifficultyMultiplier,
    gamePhase, enemyMaxHp, setEnemyMaxHp, isResetting, isFirstTime, showCharacterCreation,
    setShowCharacterCreation, setHeroHp, setHeroLevel, setHeroXp, setHeroGold,
    setCurrentNPCQuest, setWavesSinceLastEvent, setCompletedQuestsSinceLastPath,
    setShowPathChoice, setIsFirstTime, setIsGameStarted, setHeroName, setEnemySpawnX,
    spawnRandomEnemy, addToast,
  } = deps;

  // === Quest System State ===
  const [questsState, setQuests] = useState(() => {
    // Load saved quests or initialize with default quests
    try {
      const savedData = localStorage.getItem('idle_rpg_save_v1');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.quests && Array.isArray(parsed.quests)) {
          return parsed.quests;
        }
      }
    } catch {
      console.warn('[Quests] Failed to load saved quests, using defaults');
    }
    // Initialize with default quests
    const { questsData } = require('../data/questsData');
    return questsData.map((q: any) => ({ ...q, completed: false, active: false, progress: 0 }));
  });

  // === Path Choice Handler ===
  const handlePathChoice = useCallback((pathType: 'easy' | 'medium' | 'hard') => {
    // Heal hero to 100% when choosing a path
    setHeroHp(heroAttributes.maxHp);

    // Reset quest counter
    setCompletedQuestsSinceLastPath(0);

    // Close modal
    setShowPathChoice(false);

    // Apply difficulty multipliers based on path choice
    switch (pathType) {
      case 'easy':
        // -50% enemy HP, -20% rewards, +30% NPC spawn rate
        setPathDifficultyMultiplier({
          hpMultiplier: 0.5,
          attackMultiplier: 0.8,
          rewardMultiplier: 0.8,
          dropChanceBonus: 0,
          remainingEnemies: 0
        });
        addToast('🌿 Caminho Seguro escolhido! Inimigos mais fracos, recompensas menores.', 'info');
        break;
      case 'medium':
        // No changes (baseline)
        setPathDifficultyMultiplier({
          hpMultiplier: 1.0,
          attackMultiplier: 1.0,
          rewardMultiplier: 1.0,
          dropChanceBonus: 0,
          remainingEnemies: 0
        });
        addToast('⚖️ Caminho do Equilíbrio escolhido! Sem modificadores.', 'info');
        break;
      case 'hard':
        // +100% enemy HP, +100% rewards, +50% rare/epic drops, 10 enemies then reset
        setPathDifficultyMultiplier({
          hpMultiplier: 2.0,
          attackMultiplier: 1.5,
          rewardMultiplier: 2.0,
          dropChanceBonus: 0.15,
          remainingEnemies: 10
        });
        addToast('⚔️ Caminho do Caos escolhido! Inimigos letais, recompensas dobradas!', 'boss');
        break;
    }

    // Recalculate current enemy HP with new multiplier if fighting
    if (gamePhase === 'fighting' || gamePhase === 'approaching') {
      const baseHp = BASE_ENEMY_HP + (wave - 1) * 4;
      const biomeIndex = biomes.findIndex(b => b.id === currentBiomeId);
      const biomeHpMultiplier = 1 + (biomeIndex * 0.5);
      const bossMultiplier = isBossWave ? 5 : 1;
      const levelScaling = 1 + Math.log(wave) * 0.3;
      const newMaxHp = Math.floor(baseHp * biomeHpMultiplier * bossMultiplier * levelScaling * pathDifficultyMultiplier.hpMultiplier);
      setEnemyMaxHp(newMaxHp);
    }
  }, [heroAttributes.maxHp, gamePhase, wave, biomes, currentBiomeId, isBossWave, pathDifficultyMultiplier.hpMultiplier]);

  // === Auto-Save Game Data ===
  useEffect(() => {
    // Don't auto-save if this is first time and character creation modal is showing
    if (isFirstTime && showCharacterCreation) return;

    // Don't save if we're resetting the game
    if (isResetting.current) return;

    const saveInterval = setInterval(() => {
      // Skip saving during reset
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
        quests: questsState,
        isSpeedBoosted,
        hasNoAds,
        activePremiumEffects,
        combatHistory: combatHistory.slice(0, 5),
      });
    }, 30000); // Auto-save every 30 seconds

    // Save on page unload
    const handleBeforeUnload = () => {
      // Skip saving during reset
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
        quests: questsState,
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
    wave, wavesSinceLastEvent, completedQuestsSinceLastPath, isSpeedBoosted, hasNoAds, activePremiumEffects, combatHistory, questsState]);

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
      setHeroXp(currentXp);
      setHeroLevel(currentLevel);
      addToast(`🎉 Level Up! Você alcançou o nível ${currentLevel}!`, 'levelup');

      // Optional: Could add stat bonuses here automatically
      // For now, player manually spends gold to upgrade stats
    }
  }, [heroXp, heroLevel, addToast]);

  // === Load Saved Game Data ===
  useEffect(() => {
    const savedData = loadGameData();

    if (savedData) {
      // Restore all game state from save
      setHeroName(savedData.heroName || 'Herói');
      setHeroHp(savedData.heroHp);
      setHeroLevel(savedData.heroLevel);
      setHeroXp(savedData.heroXp);
      setHeroGold(savedData.heroGold);
      setHeroDiamonds(savedData.heroDiamonds ?? 0);
      setHeroAttributes(savedData.heroAttributes);
      setAttributeCosts(savedData.attributeCosts);
      setSkills(savedData.skills);
      setInventory(savedData.inventory);
      setEquipment(savedData.equipment);
      setInventoryCapacity(savedData.inventoryCapacity ?? INVENTORY_BASE_CAPACITY);
      setCurrentBiomeId(savedData.currentBiomeId || 'forest');
      setBiomeKills(savedData.biomeKills ?? 0);
      setTotalKills(savedData.totalKills ?? 0);
      setWave(savedData.wave);
      setWavesSinceLastEvent(savedData.wavesSinceLastEvent ?? 0);
      setCompletedQuestsSinceLastPath(savedData.completedQuestsSinceLastPath ?? 0);
      setIsSpeedBoosted(savedData.isSpeedBoosted ?? false);
      setHasNoAds(savedData.hasNoAds ?? false);
      setActivePremiumEffects(savedData.activePremiumEffects ?? []);
      setCombatHistory(savedData.combatHistory ?? []);

      // Restore quests if available
      if (savedData.quests && Array.isArray(savedData.quests)) {
        setQuests(savedData.quests);
      }

      // Auto-resume game (don't show character creation)
      setIsFirstTime(false);
      setIsGameStarted(true); // Resume the game loop

      console.log('[Load] Game resumed successfully');
    } else {
      // New Game - Show Character Creation Modal
      setIsFirstTime(true);
      setShowCharacterCreation(true);
      setIsGameStarted(false); // Keep game paused until adventure starts
      console.log('[New Game] Showing character creation modal');
    }
  }, []);

  return { quests: questsState, setQuests, handlePathChoice, resetGame, handleStartAdventure, handleChangeName };
};
