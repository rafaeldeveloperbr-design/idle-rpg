import type { Item } from '../types/game';

export type QuestObjectiveType = 'kill_monsters' | 'reach_wave' | 'collect_gold' | 'defeat_boss';

export interface Quest {
  id: string;
  title: string;
  npcName: string;
  npcIcon: string;
  dialogue: string;
  objectiveType: QuestObjectiveType;
  objectiveTarget: number;
  reward: {
    gold: number;
    xp: number;
    item?: Omit<Item, 'id'>;
  };
  unlockedAtLevel: number;
  completed: boolean;
  active: boolean;
  progress: number;
  // Reference values stored when quest is accepted
  currentGoldAtAccept?: number;
  currentWaveAtAccept?: number;
  currentKillsAtAccept?: number;
  currentBossKillsAtAccept?: number;
  completedAt?: number;
}

export const questsData: Omit<Quest, 'completed' | 'active' | 'progress'>[] = [
  {
    id: 'quest_ferreiro_grimbold',
    title: 'O Pedido do Ferreiro',
    npcName: 'Ferreiro Grimbold',
    npcIcon: '🔨',
    dialogue: 'Aventureiro! Preciso de ajuda para limpar a floresta desses goblins. Eles estão atacando minhas caravanas de suprimentos. Derrote mais 15 monstros a partir de agora e vou te recompensar com ouro e uma espada especial!',
    objectiveType: 'kill_monsters',
    objectiveTarget: 15,
    reward: {
      gold: 100,
      xp: 50,
      item: {
        name: 'Espada do Ferreiro',
        icon: '⚔️',
        slot: 'weapon',
        rarity: 'rare',
        bonuses: { attack: 12, critChance: 2 },
        sellValue: 80,
      },
    },
    unlockedAtLevel: 3,
  },
  {
    id: 'quest_aldea_perdida',
    title: 'A Aldeã em Perigo',
    npcName: 'Aldeã Maria',
    npcIcon: '👵',
    dialogue: 'Por favor, aventureiro! Meu filho foi capturado pelos monstros da caverna. Avance mais 10 waves a partir de agora e prometo que te darei todas as minhas economias e um amuleto de proteção!',
    objectiveType: 'reach_wave',
    objectiveTarget: 10,
    reward: {
      gold: 150,
      xp: 80,
      item: {
        name: 'Amuleto de Proteção',
        icon: '📿',
        slot: 'accessory',
        rarity: 'rare',
        bonuses: { defense: 8, maxHp: 30 },
        sellValue: 100,
      },
    },
    unlockedAtLevel: 5,
  },
  {
    id: 'quest_mercador_rico',
    title: 'Fortuna do Mercador',
    npcName: 'Mercador Rico',
    npcIcon: '💰',
    dialogue: 'Ei, aventureiro! Estou procurando alguém para acumular uma fortuna. Consiga mais 500 de ouro a partir de agora e vou te dar uma armadura épica em troca!',
    objectiveType: 'collect_gold',
    objectiveTarget: 500,
    reward: {
      gold: 200,
      xp: 100,
      item: {
        name: 'Armadura do Mercador',
        icon: '🛡️',
        slot: 'armor',
        rarity: 'epic',
        bonuses: { defense: 18, maxHp: 45, regen: 2 },
        sellValue: 250,
      },
    },
    unlockedAtLevel: 8,
  },
  {
    id: 'quest_cacador_chefao',
    title: 'Caçador de Chefes',
    npcName: 'Caçador Veterano',
    npcIcon: '🏹',
    dialogue: 'Ouvi dizer que você é corajoso! Prove seu valor derrotando mais 3 chefes a partir de agora. Em troca, vou te dar um anel lendário que aumentará muito seu poder!',
    objectiveType: 'defeat_boss',
    objectiveTarget: 3,
    reward: {
      gold: 300,
      xp: 200,
      item: {
        name: 'Anel do Caçador',
        icon: '💍',
        slot: 'accessory',
        rarity: 'epic',
        bonuses: { attack: 15, critChance: 8, speed: 5 },
        sellValue: 350,
      },
    },
    unlockedAtLevel: 12,
  },
  {
    id: 'quest_guerreiro_ancestral',
    title: 'Legado do Guerreiro',
    npcName: 'Espírito Ancestral',
    npcIcon: '👻',
    dialogue: 'Guerreiro... sinto seu potencial. Derrote mais 50 monstros a partir de agora e prove que você é digno de portar minha lâmina ancestral, forjada pelos deuses antigos!',
    objectiveType: 'kill_monsters',
    objectiveTarget: 50,
    reward: {
      gold: 500,
      xp: 300,
      item: {
        name: 'Lâmina Ancestral',
        icon: '🗡️',
        slot: 'weapon',
        rarity: 'epic',
        bonuses: { attack: 35, critChance: 10, speed: 8 },
        sellValue: 500,
      },
    },
    unlockedAtLevel: 15,
  },
];
