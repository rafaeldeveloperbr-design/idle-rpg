import type { HeroAttributes, AttributeCosts, Skill, Item, Equipment } from '../App';

const SAVE_KEY = 'idle_rpg_save_v1';

export interface GameSaveData {
  // Hero State
  heroName: string;
  heroHp: number;
  heroLevel: number;
  heroXp: number;
  heroGold: number;
  
  // Hero Attributes
  heroAttributes: HeroAttributes;
  attributeCosts: AttributeCosts;
  
  // Skills
  skills: Skill[];
  
  // Inventory & Equipment
  inventory: Item[];
  equipment: Equipment;
  
  // Biome & Progress
  currentBiomeId: string;
  biomeKills: number;
  totalKills: number;
  wave: number;
  
  // Event Management
  wavesSinceLastEvent: number;
  completedQuestsSinceLastPath: number;
  
  // Metadata
  savedAt: number;
  version: string;
}

export const saveGameData = (data: Omit<GameSaveData, 'savedAt' | 'version'>): boolean => {
  try {
    const saveData: GameSaveData = {
      ...data,
      savedAt: Date.now(),
      version: '1.0.0',
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('[Auto-Save] Game saved successfully at', new Date(saveData.savedAt).toLocaleTimeString());
    return true;
  } catch (error) {
    console.error('[Auto-Save] Failed to save game:', error);
    return false;
  }
};

export const loadGameData = (): GameSaveData | null => {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    
    if (!savedData) {
      console.log('[Load] No save data found');
      return null;
    }
    
    const parsedData = JSON.parse(savedData) as GameSaveData;
    
    // Validate version
    if (!parsedData.version || !parsedData.savedAt) {
      console.warn('[Load] Invalid save data structure, starting fresh');
      return null;
    }
    
    // Validate required fields
    if (
      typeof parsedData.heroHp !== 'number' ||
      typeof parsedData.heroLevel !== 'number' ||
      typeof parsedData.heroGold !== 'number' ||
      !parsedData.heroAttributes ||
      !parsedData.skills ||
      !parsedData.inventory ||
      !parsedData.equipment
    ) {
      console.warn('[Load] Save data missing required fields, starting fresh');
      return null;
    }
    
    console.log('[Load] Game loaded successfully from', new Date(parsedData.savedAt).toLocaleTimeString());
    return parsedData;
  } catch (error) {
    console.error('[Load] Failed to load game data:', error);
    return null;
  }
};

export const clearSaveData = (): boolean => {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('[Reset] Save data cleared');
    return true;
  } catch (error) {
    console.error('[Reset] Failed to clear save data:', error);
    return false;
  }
};

export const hasSaveData = (): boolean => {
  return localStorage.getItem(SAVE_KEY) !== null;
};
