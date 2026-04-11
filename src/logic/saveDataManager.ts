import { GameState, SaveSlot, Piece, Character, ElementalStats } from '../types';

/** 自动存档的本地存储键名 */
const AUTO_SAVE_KEY = 'my_diary_to_be_an_immortal_auto_save';
/** 手动存档的前缀 */
const MANUAL_SAVE_PREFIX = 'my_diary_to_be_an_immortal_save_slot_';
/** 背包数据的本地存储键名 */
const BACKPACK_SAVE_KEY = 'my_diary_to_be_an_immortal_backpack';

/**
 * 存档管理器类
 * 负责游戏进度和背包数据的本地持久化存储（LocalStorage）
 */
class SaveDataManager {
  /**
   * 保存游戏状态到指定槽位或自动存档
   * @param board 当前棋盘数据
   * @param player 玩家属性
   * @param enemy 敌人属性
   * @param spellProgress 法诀进度
   * @param slotId 存档槽位ID，如果不传则保存到自动存档
   */
  public saveGame(board: Piece[], player: Character, enemy: Character, spellProgress: ElementalStats, slotId?: string): void {
    const state: GameState = {
      board,
      player,
      enemy,
      spellProgress,
      timestamp: Date.now(),
    };

    const key = slotId ? `${MANUAL_SAVE_PREFIX}${slotId}` : AUTO_SAVE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  }

  /**
   * 从指定槽位或自动存档加载游戏状态
   * @param slotId 存档槽位ID，如果不传则从自动存档加载
   * @returns 加载的游戏状态对象，如果不存在则返回 null
   */
  public loadGame(slotId?: string): GameState | null {
    const key = slotId ? `${MANUAL_SAVE_PREFIX}${slotId}` : AUTO_SAVE_KEY;
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('解析存档数据失败', e);
      return null;
    }
  }

  /**
   * 删除指定槽位的存档
   * @param slotId 存档槽位ID
   */
  public deleteSave(slotId: string): void {
    const key = `${MANUAL_SAVE_PREFIX}${slotId}`;
    localStorage.removeItem(key);
  }

  /**
   * 获取所有存档槽位的状态列表
   * @param totalSlots 总槽位数，默认为3
   */
  public getSaveSlots(totalSlots: number = 3): SaveSlot[] {
    const slots: SaveSlot[] = [];
    for (let i = 1; i <= totalSlots; i++) {
      const id = i.toString();
      const state = this.loadGame(id);
      slots.push({ id, state });
    }
    return slots;
  }

  /**
   * 保存背包数据
   * @param data 道具ID与数量的映射对象
   */
  public saveBackpack(data: Record<string, number>): void {
    localStorage.setItem(BACKPACK_SAVE_KEY, JSON.stringify(data));
  }

  /**
   * 加载背包数据
   * @returns 加载的背包数据对象，如果不存在则返回 null
   */
  public loadBackpack(): Record<string, number> | null {
    const saved = localStorage.getItem(BACKPACK_SAVE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('从存储加载背包失败', e);
      return null;
    }
  }
}

/** 存档管理器单例 */
export const saveDataManager = new SaveDataManager();
