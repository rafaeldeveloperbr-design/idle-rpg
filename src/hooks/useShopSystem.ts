import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type {
  ActiveConsumable,
  ActivePremiumEffect,
  Consumable,
  HeroAttributes,
  Item,
  PremiumItem,
  Skill,
  Toast,
} from '../types/game';
import { generateInstanceId } from '../lib/itemFactory';

// === Sistema de compras (loja de ouro + loja premium) — lógica idêntica ao App.tsx ===
interface ShopSystemDeps {
  // Estado/lendo
  skills: Skill[];
  heroGold: number;
  heroLevel: number;
  equippedSkillIds: string[];
  inventoryLength: number;
  inventoryCapacity: number;
  heroDiamonds: number;
  heroAttributes: HeroAttributes;
  activePremiumEffects: ActivePremiumEffect[];
  consumables: Consumable[];
  shopItems: Item[];
  premiumItems: PremiumItem[];
  // Setters
  setHeroGold: Dispatch<SetStateAction<number>>;
  setSkills: Dispatch<SetStateAction<Skill[]>>;
  setEquippedSkillIds: Dispatch<SetStateAction<string[]>>;
  setInventory: Dispatch<SetStateAction<Item[]>>;
  setHeroHp: Dispatch<SetStateAction<number>>;
  setActiveConsumables: Dispatch<SetStateAction<ActiveConsumable[]>>;
  setHeroDiamonds: Dispatch<SetStateAction<number>>;
  setIsSpeedBoosted: Dispatch<SetStateAction<boolean>>;
  setActivePremiumEffects: Dispatch<SetStateAction<ActivePremiumEffect[]>>;
  setHasNoAds: Dispatch<SetStateAction<boolean>>;
  setInventoryCapacity: Dispatch<SetStateAction<number>>;
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
}

export const useShopSystem = (deps: ShopSystemDeps) => {
  const {
    skills, heroGold, heroLevel, equippedSkillIds, inventoryLength, inventoryCapacity,
    heroDiamonds, heroAttributes, activePremiumEffects, consumables, shopItems, premiumItems,
    setHeroGold, setSkills, setEquippedSkillIds, setInventory, setHeroHp, setActiveConsumables,
    setHeroDiamonds, setIsSpeedBoosted, setActivePremiumEffects, setHasNoAds,
    setInventoryCapacity, addToast,
  } = deps;

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
    if (inventoryLength >= inventoryCapacity) {
      addToast('⚠️ Inventário cheio!', 'info');
      return;
    }

    setHeroGold(prev => prev - item.sellValue);

    // Create new item instance with unique ID
    const newItem: Item = {
      ...item,
      id: generateInstanceId(item.id),
    };

    setInventory(prev => [...prev, newItem]);
    addToast(`🛡️ ${item.name} comprado!`, 'info');
  }, [shopItems, heroGold, heroLevel, inventoryLength, addToast]);

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
      case 'speed_boost': {
        const now = Date.now();

        setIsSpeedBoosted(true);

        setActivePremiumEffects(prev => {
          const currentExpiry = prev
            .filter(effect => effect.itemId === 'speed_boost')
            .reduce(
              (latest, effect) => Math.max(latest, effect.expiresAt ?? 0),
              now
            );

          const newExpiry =
            Math.max(now, currentExpiry) + (item.duration ?? 3600) * 1000;

          return [
            ...prev.filter(effect => effect.itemId !== 'speed_boost'),
            {
              id: `speed_${now}`,
              itemId: 'speed_boost',
              expiresAt: newExpiry,
              value: 2,
            },
          ];
        });

        addToast('⚡ Acelerador 2× renovado! +1 hora', 'info');
        break;
      }

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

  return { buySkill, buyConsumable, buyShopItem, buyPremiumItem, useRevive };
};
