import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type {
  ActiveBuff,
  AttributeCosts,
  Equipment,
  EquipmentSlot,
  HeroAttributes,
  Item,
  Skill,
  Toast,
} from '../types/game';
import { BASE_ENEMY_GOLD, BASE_ENEMY_XP } from '../lib/constants';

// === Progressão do herói: atributos, skills e inventário — lógica idêntica ao App.tsx ===
interface PathDifficulty {
  hpMultiplier: number;
  attackMultiplier: number;
  rewardMultiplier: number;
  dropChanceBonus: number;
  remainingEnemies: number;
}

interface ProgressionDeps {
  heroGold: number;
  heroAttributes: HeroAttributes;
  attributeCosts: AttributeCosts;
  skills: Skill[];
  equippedSkillIds: string[];
  inventory: Item[];
  equipment: Equipment;
  enemyXRef: MutableRefObject<number>;
  heroX: number;
  waveRef: MutableRefObject<number>;
  pathRemainingEnemies: number;
  // Setters / callbacks externos
  setHeroGold: Dispatch<SetStateAction<number>>;
  setHeroAttributes: Dispatch<SetStateAction<HeroAttributes>>;
  setAttributeCosts: Dispatch<SetStateAction<AttributeCosts>>;
  setSkills: Dispatch<SetStateAction<Skill[]>>;
  setEquippedSkillIds: Dispatch<SetStateAction<string[]>>;
  setInventory: Dispatch<SetStateAction<Item[]>>;
  setEquipment: Dispatch<SetStateAction<Equipment>>;
  setHeroHp: Dispatch<SetStateAction<number>>;
  setHeroXp: Dispatch<SetStateAction<number>>;
  setActiveBuffs: Dispatch<SetStateAction<ActiveBuff[]>>;
  setEnemyHitFlash: Dispatch<SetStateAction<boolean>>;
  setEnemyHp: Dispatch<SetStateAction<number>>;
  setPathDifficultyMultiplier: Dispatch<SetStateAction<PathDifficulty>>;
  spawnDamagePopup: (value: number, targetX: number, isCrit: boolean, isHeal?: boolean, isSkill?: boolean) => void;
  generateItemDrop: () => Item | null;
  spawnNewEnemy: () => void;
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
}

export const useHeroProgression = (deps: ProgressionDeps) => {
  const {
    heroGold, heroAttributes, attributeCosts, skills, equippedSkillIds, inventory, equipment,
    enemyXRef, heroX, waveRef, pathRemainingEnemies,
    setHeroGold, setHeroAttributes, setAttributeCosts, setSkills, setEquippedSkillIds,
    setInventory, setEquipment, setHeroHp, setHeroXp, setActiveBuffs, setEnemyHitFlash,
    setEnemyHp, setPathDifficultyMultiplier, spawnDamagePopup, generateItemDrop,
    spawnNewEnemy, addToast,
  } = deps;

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
            const goldReward = BASE_ENEMY_GOLD + (currentWave - 1) * 5;
            const xpReward = BASE_ENEMY_XP + (currentWave - 1) * 8;
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
            if (pathRemainingEnemies > 0) {
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

  return {
    upgradeAttribute,
    useSkill,
    upgradeSkill,
    toggleAutoCast,
    equipSkill,
    equipItem,
    unequipItem,
    sellItem,
  };
};
