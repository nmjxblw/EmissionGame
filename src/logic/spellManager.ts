import { ElementalStats, PieceType, BattleMessage } from '../types';
import { ELEMENT_MAP, INITIAL_ELEMENTAL_STATS } from './gameInitial';
import { SPELL_THRESHOLD, SPELL_BASE_DAMAGE, PIECE_CONFIG } from '../constants';

/**
 * 法诀管理器类
 * 负责管理五行法诀的能量积攒（法诀槽）和释放逻辑
 */
class SpellManager {
  /** 各元素法诀的当前进度 */
  private progress: ElementalStats = { ...INITIAL_ELEMENTAL_STATS };

  /** 获取当前法诀进度 */
  getProgress(): ElementalStats {
    return { ...this.progress };
  }

  /** 设置法诀进度（用于存档加载） */
  setProgress(progress: ElementalStats) {
    this.progress = { ...progress };
  }

  /** 重置所有法诀进度 */
  reset() {
    this.progress = { ...INITIAL_ELEMENTAL_STATS };
  }

  /**
   * 处理棋子消除，更新法诀进度并判定是否释放法诀
   * @param pieceType 消除的棋子类型
   * @param count 消除的数量
   * @returns 返回触发的战斗消息和通知信息
   */
  handleElimination(pieceType: PieceType, count: number) {
    const element = ELEMENT_MAP[pieceType];
    const totalPoints = this.progress[element] + count;
    
    // 计算释放次数
    const releases = Math.trunc(totalPoints / SPELL_THRESHOLD);
    // 更新剩余进度
    this.progress[element] = totalPoints % SPELL_THRESHOLD;

    const spellMessages: BattleMessage[] = [];
    const notifications: { id: string; text: string; color: string; x: number; type: 'player' }[] = [];

    if (releases > 0) {
      for (let i = 0; i < releases; i++) {
        const id = Math.random().toString(36).substr(2, 9);
        spellMessages.push({
          id,
          type: 'PLAYER_SPELL',
          element,
          damage: SPELL_BASE_DAMAGE,
          timestamp: Date.now()
        });

        notifications.push({
          id,
          text: `${PIECE_CONFIG[pieceType].text}诀`,
          color: PIECE_CONFIG[pieceType].color,
          x: (Math.random() - 0.5) * 100,
          type: 'player'
        });
      }
    }

    return { spellMessages, notifications };
  }

  /**
   * 模拟消除以预览进度变化
   * @param currentProgress 当前进度参考
   * @param pieceType 消除类型
   * @param count 消除数量
   * @returns 模拟后的进度
   */
  simulateProgress(currentProgress: ElementalStats, pieceType: PieceType, count: number): ElementalStats {
    const element = ELEMENT_MAP[pieceType];
    const newProgress = { ...currentProgress };
    newProgress[element] += count;
    return newProgress;
  }
}

/** 法诀管理器单例 */
export const spellManager = new SpellManager();
