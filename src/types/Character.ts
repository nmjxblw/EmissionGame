import { ElementalStats } from './ElementalStats';

export interface Character {
  name: string;
  maxHp: number;
  currentHp: number;
  addDamageBonus: ElementalStats;
  addDamageReduction: ElementalStats;
  multDamageBonus: number;
  multDamageReduction: number;
  baseMultBonus: number;
  baseMultReduction: number;
  attackInterval?: number; // in seconds
  baseDamage?: number;
  damageFloat?: number;
}
