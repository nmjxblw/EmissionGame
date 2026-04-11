import { Character, ElementalStats, BattleMessage } from '../types';
import { eventManager } from './eventManager';

/**
 * 战斗管理器类
 * 负责处理战斗相关的计算逻辑，如伤害值计算
 */
class BattleManager {
  /**
   * 计算最终造成的伤害值
   * @param attacker 攻击者对象
   * @param target 目标（被攻击者）对象
   * @param element 攻击的元素属性
   * @param baseMultiplier 基础伤害倍率
   * @param fixedDamage 固定伤害值，默认为0
   * @returns 最终计算出的伤害值
   */
  calculateDamage(
    attacker: Character,
    target: Character,
    element: keyof ElementalStats,
    baseMultiplier: number,
    fixedDamage: number = 0
  ): number {
    // 获取攻击者的元素伤害加成和目标的元素伤害减免
    const attackerAddBonus = attacker.addDamageBonus[element];
    const targetAddReduc = target.addDamageReduction[element];

    // 基础倍率部分：基础倍率 * (1 + 攻击者基础倍率加成 - 目标基础倍率减免)
    const effectiveBaseMult = baseMultiplier * (1 + attacker.baseMultBonus - target.baseMultReduction);

    // 内部最大值计算：max(0, 有效基础倍率 + 攻击者附加加成 - 目标附加减免)
    const innerValue = Math.max(0, effectiveBaseMult + attackerAddBonus - targetAddReduc);

    // 乘法部分：内部计算值 * (1 + 攻击者乘法伤害加成) * (1 - 目标乘法伤害减免)
    const multValue = innerValue * (1 + attacker.multDamageBonus) * (1 - target.multDamageReduction);

    // 外部最大值计算：max(0, 乘法计算值 + 固定伤害)
    const rawDamage = Math.max(0, multValue + fixedDamage);

    // 最终伤害上限：不能超过目标最大生命值的 1/4
    const damageCap = Math.floor(target.maxHp / 4);

    // 返回最终伤害值（取上限和原始伤害的较小值，并向下取整）
    return Math.min(damageCap, Math.floor(rawDamage));
  }

  /**
   * 处理战斗消息，计算伤害并触发伤害事件
   * @param message 战斗消息
   * @param attacker 攻击者
   * @param target 目标
   */
  processBattleMessage(message: BattleMessage, attacker: Character, target: Character) {
    let damage = 0;
    let targetType: 'player' | 'enemy';

    if (message.type === 'PLAYER_ATTACK' || message.type === 'PLAYER_SPELL') {
      damage = this.calculateDamage(attacker, target, message.element!, message.damage, 0);
      targetType = 'enemy';
    } else {
      damage = Math.round(message.damage);
      targetType = 'player';
    }

    // 触发伤害产生事件
    eventManager.emit('COMBAT_DAMAGE', {
      damage,
      targetType,
      element: message.element,
      messageType: message.type,
      messageId: message.id
    });
  }
}

/** 战斗管理器单例 */
export const battleManager = new BattleManager();
