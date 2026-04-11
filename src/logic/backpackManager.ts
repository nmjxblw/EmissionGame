import { BackpackItem, PropDefinition } from '../types';
import { propsManager } from './propsManager';
import { saveDataManager } from './saveDataManager';

/** 背包变更回调函数类型 */
type BackpackChangeHandler = (items: BackpackItem[]) => void;

/**
 * 背包管理器类
 * 负责管理玩家的道具背包，包括添加、移除、查询和持久化
 */
class BackpackManager {
  /** 道具列表：Map<道具ID, 数量> */
  private items: Map<string, number> = new Map();
  /** 监听器集合 */
  private listeners: Set<BackpackChangeHandler> = new Set();

  constructor() {
    // 从存档管理器初始化背包数据
    const saved = saveDataManager.loadBackpack();
    if (saved) {
      Object.entries(saved).forEach(([id, qty]) => {
        this.items.set(id, qty as number);
      });
    }
  }

  /** 通知所有监听器背包已变更 */
  private notify() {
    const currentItems = this.getItems();
    this.listeners.forEach(listener => listener(currentItems));
    this.saveToStorage();
  }

  /** 将当前背包数据保存到本地存储 */
  private saveToStorage() {
    const obj = Object.fromEntries(this.items.entries());
    saveDataManager.saveBackpack(obj);
  }

  /**
   * 订阅背包变更
   * @param handler 变更时的回调函数
   * @returns 取消订阅的函数
   */
  public subscribe(handler: BackpackChangeHandler) {
    this.listeners.add(handler);
    handler(this.getItems());
    return () => this.listeners.delete(handler);
  }

  /**
   * 添加道具到背包
   * @param propId 道具ID
   * @param quantity 数量，默认为1
   * @returns 是否添加成功
   */
  public addItem(propId: string, quantity: number = 1): boolean {
    const def = propsManager.getPropDefinition(propId);
    if (!def) {
      console.error(`道具 ${propId} 在注册表中未找到。`);
      return false;
    }

    const currentQty = this.items.get(propId) || 0;
    const newQty = Math.min(def.max_quantity, currentQty + quantity);
    
    if (newQty === currentQty && quantity > 0) return false;

    this.items.set(propId, newQty);
    this.notify();
    return true;
  }

  /**
   * 从背包中移除道具
   * @param propId 道具ID
   * @param quantity 数量，默认为1
   * @returns 是否移除成功
   */
  public removeItem(propId: string, quantity: number = 1): boolean {
    const currentQty = this.items.get(propId) || 0;
    if (currentQty < quantity) return false;

    const newQty = currentQty - quantity;
    if (newQty <= 0) {
      this.items.delete(propId);
    } else {
      this.items.set(propId, newQty);
    }

    this.notify();
    return true;
  }

  /**
   * 获取指定道具的数量
   * @param propId 道具ID
   */
  public getQuantity(propId: string): number {
    return this.items.get(propId) || 0;
  }

  /** 获取背包中所有道具的列表 */
  public getItems(): BackpackItem[] {
    return Array.from(this.items.entries()).map(([propId, quantity]) => ({
      propId,
      quantity
    }));
  }

  /** 清空背包 */
  public clear() {
    this.items.clear();
    this.notify();
  }
}

/** 背包管理器单例 */
export const backpackManager = new BackpackManager();
