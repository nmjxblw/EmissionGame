import { eventManager } from './eventManager';

/**
 * 游戏流程管理器类
 * 负责管理游戏的整体状态，包括计时器、暂停/恢复、胜负判定等
 */
class GameManager {
  /** 游戏是否处于暂停状态 */
  private isPaused: boolean = false;
  /** 战斗是否已结束 */
  private isBattleOver: boolean = false;
  /** 剩余时间（秒） */
  private timer: number = 180;
  /** 计时器间隔句柄 */
  private timerInterval: number | null = null;

  constructor() {
    // 监听菜单事件，自动处理暂停和恢复
    eventManager.on('MENU_OPENED', () => this.pause());
    eventManager.on('MENU_CLOSED', () => this.resume());
  }

  /**
   * 启动计时器
   * @param initialTime 初始时间
   */
  startTimer(initialTime: number) {
    this.timer = initialTime;
    this.isBattleOver = false;
    this.isPaused = false;
    this.resumeTimer();
  }

  /** 恢复计时器运行 */
  private resumeTimer() {
    if (this.timerInterval) return;
    
    this.timerInterval = window.setInterval(() => {
      if (this.isPaused || this.isBattleOver) return;

      this.timer--;
      eventManager.emit('TIMER_TICK', this.timer);

      if (this.timer <= 0) {
        this.stopTimer();
        this.checkBattleResult();
      }
    }, 1000);
  }

  /** 停止计时器 */
  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /** 暂停游戏 */
  pause() {
    this.isPaused = true;
    eventManager.emit('GAME_PAUSED', null);
  }

  /** 恢复游戏 */
  resume() {
    this.isPaused = false;
    eventManager.emit('GAME_RESUMED', null);
  }

  /** 玩家投降 */
  surrender() {
    this.isBattleOver = true;
    this.stopTimer();
    eventManager.emit('BATTLE_OVER', { winner: 'enemy' });
  }

  /**
   * 检查战斗结果
   * @param playerHp 玩家当前血量
   * @param enemyHp 敌人当前血量
   */
  checkBattleResult(playerHp?: number, enemyHp?: number) {
    if (this.isBattleOver) return;

    // 玩家血量归零，敌人获胜
    if (playerHp !== undefined && playerHp <= 0) {
      this.isBattleOver = true;
      this.stopTimer();
      eventManager.emit('BATTLE_OVER', { winner: 'enemy' });
      return;
    }

    // 敌人血量归零，玩家获胜
    if (enemyHp !== undefined && enemyHp <= 0) {
      this.isBattleOver = true;
      this.stopTimer();
      eventManager.emit('BATTLE_OVER', { winner: 'player' });
      return;
    }

    // 时间耗尽
    if (this.timer <= 0) {
      this.isBattleOver = true;
      this.stopTimer();
      // 如果时间到了，发送超时事件（View Model 会根据血量百分比判定最终胜负）
      eventManager.emit('BATTLE_OVER', { winner: 'timeout' });
    }
  }

  /** 获取当前是否暂停 */
  getPaused() {
    return this.isPaused;
  }

  /** 获取战斗是否结束 */
  getBattleOver() {
    return this.isBattleOver;
  }

  /** 获取当前剩余时间 */
  getTimer() {
    return this.timer;
  }

  /**
   * 重置管理器状态
   * @param initialTime 重置后的初始时间
   */
  reset(initialTime: number = 180) {
    this.stopTimer();
    this.isPaused = false;
    this.isBattleOver = false;
    this.timer = initialTime;
  }
}

/** 游戏流程管理器单例 */
export const gameManager = new GameManager();
