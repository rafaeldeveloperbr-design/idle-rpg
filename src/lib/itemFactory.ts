import type { Item } from '../types/game';

// Cria uma instância única de item a partir de um template (IDs com timestamp/random, como no código original)
export const generateInstanceId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random()}`;

export const instantiateItem = (template: Omit<Item, 'id'>, id?: string): Item => ({
  ...template,
  id: id ?? `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
});
