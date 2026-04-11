import { eventManager } from './eventManager';

/**
 * 菜单管理器类
 * 负责控制游戏内菜单（如设置、存档）的打开与关闭状态
 */
class MenuManager {
  /** 菜单当前是否处于打开状态 */
  private isOpen: boolean = false;

  /** 打开菜单并触发相关事件 */
  openMenu() {
    this.isOpen = true;
    eventManager.emit('MENU_OPENED', null);
  }

  /** 关闭菜单并触发相关事件 */
  closeMenu() {
    this.isOpen = false;
    eventManager.emit('MENU_CLOSED', null);
  }

  /** 获取菜单当前状态 */
  isMenuOpen() {
    return this.isOpen;
  }
}

/** 菜单管理器单例 */
export const menuManager = new MenuManager();
