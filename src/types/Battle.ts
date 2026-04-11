import { ElementalStats } from './ElementalStats';

export type BattleMessageType = 'PLAYER_PROP' | 'PLAYER_SPELL' | 'ENEMY_ATTACK';

export interface BattleMessage {
  id: string;
  type: BattleMessageType;
  element?: keyof ElementalStats;
  damage: number;
  timestamp: number;
}
