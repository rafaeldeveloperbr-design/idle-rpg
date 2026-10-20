import type { Item } from '../types/game';

// === Generate Random Item Drop — fórmula 100% idêntica ao App.tsx original, agora pura/testável ===
export interface DropContext {
  wave: number;
  isBossWave: boolean;
  currentBiomeId: string;
  biomes: { id: string }[];
  dropChanceBonus: number; // pathDifficultyMultiplier.dropChanceBonus
}

export const rollItemDrop = (
  context: DropContext,
  itemDatabase: Omit<Item, 'id'>[]
): Item | null => {
  // 30% base chance to drop an item + path difficulty bonus
  const dropChance = 0.3 + context.dropChanceBonus;
  if (Math.random() > dropChance) return null;

  // Rarity weights adjusted by path difficulty bonus
  // Base: common 60%, rare 30%, epic 10%
  // With bonus: shift towards higher rarities
  const rarityRoll = Math.random();
  let targetRarity: Item['rarity'];
  const epicBonus = context.dropChanceBonus * 0.5; // Half of bonus goes to epic
  const rareBonus = context.dropChanceBonus * 0.3; // 30% goes to rare

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
  const bossBonus = context.isBossWave ? 0.15 : 0;

  // Biome bonus: higher biomes have better upgrade chances
  const biomeIndex = context.biomes.findIndex(b => b.id === context.currentBiomeId);
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
  const waveBonus = Math.floor((context.wave - 1) * 0.1); // +10% per wave

  // Apply upgrade level multiplier (each +1 adds 25% to base stats)
  const upgradeMultiplier = 1 + (upgradeLevel * 0.25);

  const scaledBonuses: Partial<Item['bonuses']> = {};
  Object.entries(template.bonuses).forEach(([key, value]) => {
    if (value !== undefined) {
      const waveScaled = value + Math.floor(value * waveBonus);
      scaledBonuses[key as keyof Item['bonuses']] = Math.round(waveScaled * upgradeMultiplier);
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
};
