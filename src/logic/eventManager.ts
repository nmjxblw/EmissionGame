import { PieceType } from '../types';

/** 游戏事件类型枚举 */
export type GameEventType = 
  | 'PIECE_ELIMINATED' // 棋子被消除
  | 'GAME_PAUSED'      // 游戏暂停
  | 'GAME_RESUMED'     // 游戏恢复
  | 'MENU_OPENED'      // 菜单打开
  | 'MENU_CLOSED'      // 菜单关闭
  | 'BATTLE_OVER'      // 战斗结束
  | 'TIMER_TICK'       // 计时器跳动
  | 'COMBAT_ACTION'    // 战斗动作发起
  | 'COMBAT_DAMAGE';   // 伤害产生

/** 游戏事件接口 */
export interface GameEvent {
  type: GameEventType;
  payload: any;
}

/** 棋子消除事件的负载数据接口 */
export interface PieceEliminatedPayload {
  pieceType: PieceType;
  count: number;
}

/** 事件回调函数类型 */
type EventCallback = (payload: any) => void;

/**
 * 事件管理器类
 * 实现简单的发布/订阅模式，用于模块间的解耦通信
 */
class EventManager {
  /** 事件监听器映射表：Map<事件类型, 回调函数数组> */
  private listeners: Map<GameEventType, EventCallback[]> = new Map();

  /**
   * 注册事件监听
   * @param event 事件类型
   * @param callback 回调函数
   */
  on(event: GameEventType, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听
   * @param event 事件类型
   * @param callback 要移除的回调函数
   */
  off(event: GameEventType, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param payload 传递给回调函数的负载数据
   */
  emit(event: GameEventType, payload: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }
}

/** 事件管理器单例 */
export const eventManager = new EventManager();
