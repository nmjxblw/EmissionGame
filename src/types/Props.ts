export enum PropType {
  CURRENCY = 'currency',
  MATERIAL = 'material',
  CONSUMABLE = 'consumable',
  EQUIPMENT = 'equipment'
}

export enum Rarity {
  COMMON = 0,    // 下品
  UNCOMMON = 1,  // 中品
  RARE = 2,      // 上品
  EPIC = 3,      // 极品
  LEGENDARY = 4  // 仙品
}

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.COMMON]: '下品',
  [Rarity.UNCOMMON]: '中品',
  [Rarity.RARE]: '上品',
  [Rarity.EPIC]: '极品',
  [Rarity.LEGENDARY]: '仙品'
};

export interface PropDefinition {
  id: string;
  display_name: string;
  description: string;
  prop_type: PropType[];
  rarity: Rarity;
  max_quantity: number;
  tradeable: boolean;
}

export interface BackpackItem {
  propId: string;
  quantity: number;
}
