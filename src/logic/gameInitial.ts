import { Character, ElementalStats, PieceType } from '../types';

/** 初始元素属性统计（全为0） */
export const INITIAL_ELEMENTAL_STATS: ElementalStats = {
  gold: 0,
  wood: 0,
  water: 0,
  fire: 0,
  earth: 0,
};

/** 初始玩家属性配置 */
export const INITIAL_PLAYER: Character = {
  name: '道友',
  maxHp: 100,
  currentHp: 100,
  addDamageBonus: { ...INITIAL_ELEMENTAL_STATS },
  addDamageReduction: { ...INITIAL_ELEMENTAL_STATS },
  multDamageBonus: 0,
  multDamageReduction: 0,
  baseMultBonus: 0,
  baseMultReduction: 0,
  attackInterval: 0, // 玩家不按固定间隔攻击，而是通过消除触发
  baseDamage: 0,
  damageFloat: 0,
};

/** 初始敌人属性配置（作为保底或加载前的占位） */
export const INITIAL_ENEMY: Character = {
  name: '妖兽',
  maxHp: 200,
  currentHp: 200,
  addDamageBonus: { ...INITIAL_ELEMENTAL_STATS },
  addDamageReduction: { ...INITIAL_ELEMENTAL_STATS },
  multDamageBonus: 0,
  multDamageReduction: 0,
  baseMultBonus: 0,
  baseMultReduction: 0,
  attackInterval: 10,
  baseDamage: 5,
  damageFloat: 1,
};

/** 棋子类型与元素属性的映射关系 */
export const ELEMENT_MAP: Record<PieceType, keyof ElementalStats> = {
  0: 'water', // 水
  1: 'earth', // 土
  2: 'wood',  // 木
  3: 'gold',  // 金
  4: 'fire',  // 火
};
