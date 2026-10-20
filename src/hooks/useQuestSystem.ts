import { useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Item, Toast } from '../types/game';
import type { Quest } from '../data/questsData';
import { MIN_WAVES_BETWEEN_EVENTS, QUESTS_UNTIL_PATH } from '../lib/constants';

// === Quest System — mesma lógica do App.tsx (aceitar/rejeitar/completar, progresso, spawn de NPC) ===
interface QuestSystemDeps {
  quests: Quest[];
  setQuests: Dispatch<SetStateAction<Quest[]>>;
  currentNPCQuest: Quest | null;
  setCurrentNPCQuest: (quest: Quest | null) => void;
  wavesSinceLastEvent: number;
  setWavesSinceLastEvent: Dispatch<SetStateAction<number>>;
  completedQuestsSinceLastPath: number;
  setCompletedQuestsSinceLastPath: Dispatch<SetStateAction<number>>;
  showPathChoice: boolean;
  setShowPathChoice: (show: boolean) => void;
  isGameStarted: boolean;
  heroLevel: number;
  heroGold: number;
  totalKills: number;
  wave: number;
  heroMaxHp: number;
  setHeroGold: Dispatch<SetStateAction<number>>;
  setHeroXp: Dispatch<SetStateAction<number>>;
  setHeroHp: Dispatch<SetStateAction<number>>;
  setInventory: Dispatch<SetStateAction<Item[]>>;
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
}

export const useQuestSystem = (deps: QuestSystemDeps) => {
  const {
    quests, setQuests,
    currentNPCQuest, setCurrentNPCQuest,
    wavesSinceLastEvent, setWavesSinceLastEvent,
    completedQuestsSinceLastPath, setCompletedQuestsSinceLastPath,
    showPathChoice, setShowPathChoice,
    isGameStarted, heroLevel, heroGold, totalKills, wave, heroMaxHp,
    setHeroGold, setHeroXp, setHeroHp, setInventory, addToast,
  } = deps;

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
      setHeroHp(heroMaxHp);
      setShowPathChoice(true);
      addToast(`🛤️ Bifurcação disponível! Escolha seu caminho.`, 'info');
    }
  }, [quests, addToast, completedQuestsSinceLastPath, heroMaxHp]);

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

  return {
    checkAndSpawnNPC,
    acceptQuest,
    declineQuest,
    completeQuest,
    updateQuestProgress,
  };
};
