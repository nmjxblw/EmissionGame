import { useState, useEffect, useCallback, useRef } from 'react';
import { Piece, SaveSlot, Character, ElementalStats, BattleMessage, PieceType } from '../types';
import { 
  ROWS, 
  COLS, 
  PROCESS_DELAY, 
  SWAP_DURATION, 
  POWER_PIECE_LENGTH,
  BOMB_PIECE_LENGTH,
  PIECE_CONFIG,
  SPELL_THRESHOLD,
  SPELL_BASE_DAMAGE
} from '../constants';
import { saveDataManager } from './saveDataManager';
import { battleManager } from './battleManager';
import { getEnemyConfig, initEnemies } from './enemyManager';
import { 
  INITIAL_PLAYER, 
  INITIAL_ENEMY, 
  ELEMENT_MAP,
  INITIAL_ELEMENTAL_STATS
} from './gameInitial';
import { eventManager, PieceEliminatedPayload } from './eventManager';
import { gameManager } from './gameManager';
import { menuManager } from './menuManager';
import { gameBoardManager } from './gameBoardManager';
import { spellManager } from './spellManager';

/** 战斗初始时长（秒） */
const BATTLE_TIME = 180;

/**
 * 游戏核心 ViewModel 钩子
 * 负责聚合所有 Manager 的逻辑，管理 UI 状态，并处理用户交互
 */
export const useGameViewModel = () => {
  // --- UI 状态 ---
  /** 棋盘棋子列表 */
  const [board, setBoard] = useState<Piece[]>([]);
  /** 当前选中的棋子坐标 */
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  /** 是否正在处理消除动画中 */
  const [isProcessing, setIsProcessing] = useState(false);
  /** 玩家属性状态 */
  const [player, setPlayer] = useState<Character>(INITIAL_PLAYER);
  /** 敌人属性状态 */
  const [enemy, setEnemy] = useState<Character>(INITIAL_ENEMY);
  /** 存档列表 */
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  /** 游戏是否暂停 */
  const [isPaused, setIsPaused] = useState(false);
  /** 菜单是否打开 */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /** 剩余时间 */
  const [timer, setTimer] = useState(BATTLE_TIME);
  /** 各元素法诀充能进度 */
  const [spellProgress, setSpellProgress] = useState<ElementalStats>({ ...INITIAL_ELEMENTAL_STATS });
  /** 战斗事件队列（用于顺序处理伤害） */
  const [battleQueue, setBattleQueue] = useState<BattleMessage[]>([]);
  /** 法诀/攻击飘字通知 */
  const [spellNotifications, setSpellNotifications] = useState<{ id: string; text: string; color: string; x: number; type: 'player' | 'enemy' }[]>([]);
  /** 游戏是否结束 */
  const [isGameOver, setIsGameOver] = useState(false);
  /** 获胜者 */
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  /** 玩家受击动画状态 */
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  /** 敌人受击动画状态 */
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  /** 飘字伤害数字 */
  const [damageNumbers, setDamageNumbers] = useState<{ id: string; value: number; color: string; type: 'player' | 'enemy'; velocity: { x: number; y: number } }[]>([]);
  /** 预览伤害数值 */
  const [previewDamage, setPreviewDamage] = useState(0);
  /** 预览法诀进度变化 */
  const [previewSpellProgress, setPreviewSpellProgress] = useState<ElementalStats | null>(null);

  // --- 引用（用于在 Effect/Callback 中获取最新值而无需重载） ---
  const boardRef = useRef<Piece[]>([]);
  const playerRef = useRef<Character>(player);
  const enemyRef = useRef<Character>(enemy);
  const spellProgressRef = useRef<ElementalStats>(spellProgress);
  const isGameOverRef = useRef(false);
  const lastEnemyAttackTimeRef = useRef(0);
  const lastPreviewRef = useRef<{r1: number, c1: number, r2: number, c2: number} | null>(null);

  // 同步 Ref
  useEffect(() => {
    boardRef.current = board;
    playerRef.current = player;
    enemyRef.current = enemy;
    spellProgressRef.current = spellProgress;
    isGameOverRef.current = isGameOver;
  }, [board, player, enemy, spellProgress, isGameOver]);

  // --- 事件监听初始化 ---
  useEffect(() => {
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);
    const handleMenuOpen = () => setIsMenuOpen(true);
    const handleMenuClose = () => setIsMenuOpen(false);
    const handleTimerTick = (newTime: number) => setTimer(newTime);
    const handleBattleOver = (payload: { winner: 'player' | 'enemy' | 'timeout' }) => {
      setIsGameOver(true);
      isGameOverRef.current = true;
      
      // 游戏结束时立即清空所有队列，防止后续逻辑错误触发
      setBattleQueue([]);
      setSpellNotifications([]);
      setDamageNumbers([]);
      
      if (payload.winner === 'timeout') {
        // 超时判定：敌人血量百分比大于20%则判负，否则判胜
        const enemyHpPercent = (enemyRef.current.currentHp / enemyRef.current.maxHp) * 100;
        setWinner(enemyHpPercent > 20 ? 'enemy' : 'player');
      } else {
        setWinner(payload.winner);
      }
    };

    eventManager.on('GAME_PAUSED', handlePause);
    eventManager.on('GAME_RESUMED', handleResume);
    eventManager.on('MENU_OPENED', handleMenuOpen);
    eventManager.on('MENU_CLOSED', handleMenuClose);
    eventManager.on('TIMER_TICK', handleTimerTick);
    eventManager.on('BATTLE_OVER', handleBattleOver);

    return () => {
      eventManager.off('GAME_PAUSED', handlePause);
      eventManager.off('GAME_RESUMED', handleResume);
      eventManager.off('MENU_OPENED', handleMenuOpen);
      eventManager.off('MENU_CLOSED', handleMenuClose);
      eventManager.off('TIMER_TICK', handleTimerTick);
      eventManager.off('BATTLE_OVER', handleBattleOver);
    };
  }, []);

  /** 判定游戏结束 */
  const handleGameEnd = useCallback((winnerOverride?: 'player' | 'enemy') => {
    if (winnerOverride) {
      eventManager.emit('BATTLE_OVER', { winner: winnerOverride });
    } else {
      gameManager.checkBattleResult();
    }
  }, []);

  // --- 敌人自动攻击逻辑 ---
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      const currentTime = BATTLE_TIME - timer;
      const enemyConfig = enemyRef.current;
      
      // 检查攻击间隔
      if (enemyConfig.attackInterval && (currentTime - lastEnemyAttackTimeRef.current) >= enemyConfig.attackInterval) {
        const baseDmg = enemyConfig.baseDamage || 10;
        const float = enemyConfig.damageFloat || 3;
        const actualDmg = baseDmg + (Math.random() * float * 2 - float);
        
        const id = Math.random().toString(36).substr(2, 9);
        const message: BattleMessage = {
          id,
          type: 'ENEMY_ATTACK',
          damage: Math.round(actualDmg),
          timestamp: Date.now()
        };
        setBattleQueue(q => [...q, message]);
        lastEnemyAttackTimeRef.current = currentTime;

        // 飘字通知
        const newNotif = {
          id,
          text: '攻击',
          color: '#ef4444',
          yOffset: (Math.random() - 0.5) * 120, // 增加垂直分布范围
          type: 'enemy' as const
        };
        setSpellNotifications(prevNotifs => [...prevNotifs, newNotif]);
        setTimeout(() => {
          setSpellNotifications(prevNotifs => prevNotifs.filter(n => n.id !== id));
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, timer]);

  /** 添加伤害数字飘字 */
  const addDamageNumber = useCallback((value: number, element: keyof ElementalStats | undefined, type: 'player' | 'enemy') => {
    const id = Math.random().toString(36).substr(2, 9);
    let color = '#ffffff';
    if (element) {
      // 查找对应元素的棋子颜色
      const type = ([0, 1, 2, 3, 4] as PieceType[]).find(t => ELEMENT_MAP[t] === element);
      if (type !== undefined) {
        const config = PIECE_CONFIG[type];
        if (config) color = config.color;
      }
    }

    // 随机初速度和角度 (斜抛运动)
    // 敌人受击向右斜上方抛出，玩家受击向左斜上方抛出
    const angle = (Math.random() * 30 + 45) * (Math.PI / 180); // 45-75度斜向上
    const speed = Math.random() * 40 + 60; // 60-100 像素/秒
    const vx = Math.cos(angle) * speed * (type === 'enemy' ? 1 : -1); 
    const vy = -Math.sin(angle) * speed;

    setDamageNumbers(prev => [...prev, { id, value, color, type, velocity: { x: vx, y: vy } }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1200); // 延长生命周期以匹配1秒动画
  }, []);

  // --- 战斗逻辑处理 (事件驱动) ---
  useEffect(() => {
    const handleCombatDamage = (payload: { 
      damage: number, 
      targetType: 'player' | 'enemy', 
      element?: keyof ElementalStats 
    }) => {
      if (isGameOverRef.current) return;
      
      const { damage, targetType, element } = payload;
      
      if (targetType === 'enemy') {
        setEnemy(prev => {
          const newHp = Math.max(0, prev.currentHp - damage);
          gameManager.checkBattleResult(playerRef.current.currentHp, newHp);
          return { ...prev, currentHp: newHp };
        });
        setIsEnemyHit(true);
        addDamageNumber(damage, element, 'enemy');
        setTimeout(() => setIsEnemyHit(false), 500);
      } else {
        setPlayer(prev => {
          const newHp = Math.max(0, prev.currentHp - damage);
          gameManager.checkBattleResult(newHp, enemyRef.current.currentHp);
          return { ...prev, currentHp: newHp };
        });
        setIsPlayerHit(true);
        addDamageNumber(damage, undefined, 'player');
        setTimeout(() => setIsPlayerHit(false), 500);
      }
    };

    eventManager.on('COMBAT_DAMAGE', handleCombatDamage);
    return () => eventManager.off('COMBAT_DAMAGE', handleCombatDamage);
  }, [addDamageNumber]);

  // --- 战斗队列处理逻辑 ---
  useEffect(() => {
    if (battleQueue.length === 0 || isGameOver || isPaused) return;

    const message = battleQueue[0];
    const attacker = (message.type === 'ENEMY_ATTACK') ? enemyRef.current : playerRef.current;
    const target = (message.type === 'ENEMY_ATTACK') ? playerRef.current : enemyRef.current;

    // 将战斗逻辑交给 battleManager 处理，它会计算伤害并触发 COMBAT_DAMAGE 事件
    battleManager.processBattleMessage(message, attacker, target);

    // 移除已处理的消息
    setBattleQueue(prev => prev.slice(1));
  }, [battleQueue, isGameOver, isPaused]);

  // --- 棋子消除事件处理逻辑 ---
  useEffect(() => {
    const handlePieceEliminated = (payload: PieceEliminatedPayload) => {
      const element = ELEMENT_MAP[payload.pieceType];
      
      // 1. 使用 spellManager 处理法诀逻辑
      const { spellMessages, notifications } = spellManager.handleElimination(payload.pieceType, payload.count);
      
      // 2. 将法诀消息加入队列
      setBattleQueue(q => [...q, ...spellMessages]);
      
      if (notifications.length > 0) {
        const notificationsWithOffset = notifications.map(n => ({
          ...n,
          yOffset: (Math.random() - 0.5) * 150 // 法诀弹幕范围更大，且更居中
        }));
        setSpellNotifications(prev => [...prev, ...notificationsWithOffset]);
        
        // 2秒后自动移除通知
        setTimeout(() => {
          setSpellNotifications(prev => prev.filter(n => !notificationsWithOffset.find(nn => nn.id === n.id)));
        }, 2000);
      }

      // 同步最新的法诀进度到状态
      setSpellProgress(spellManager.getProgress());
    };

    eventManager.on('PIECE_ELIMINATED', handlePieceEliminated);
    return () => eventManager.off('PIECE_ELIMINATED', handlePieceEliminated);
  }, []);

  /** 初始化游戏状态 */
  const initGame = useCallback(() => {
    const autoSave = saveDataManager.loadGame();
    if (autoSave) {
      // 优先加载自动存档
      setBoard(autoSave.board);
      gameBoardManager.setBoard(autoSave.board);
      setPlayer(autoSave.player || INITIAL_PLAYER);
      setEnemy(autoSave.enemy || INITIAL_ENEMY);
      if (autoSave.spellProgress) {
        spellManager.setProgress(autoSave.spellProgress);
        setSpellProgress(spellManager.getProgress());
      }
    } else {
      // 否则初始化新棋盘和第一个敌人
      const newBoard = gameBoardManager.initBoard();
      setBoard(newBoard);
      
      const firstEnemy = getEnemyConfig('enemy_001');
      if (firstEnemy) {
        setEnemy({ ...firstEnemy });
      }
    }
    setSaveSlots(saveDataManager.getSaveSlots());

    // 重置各项状态
    gameManager.startTimer(BATTLE_TIME);
    setTimer(BATTLE_TIME);
    spellManager.reset();
    setSpellProgress(spellManager.getProgress());
    setBattleQueue([]);
    setIsGameOver(false);
    setWinner(null);
    lastEnemyAttackTimeRef.current = 0;
  }, []);

  // --- 挂载初始化与自动存档逻辑 ---
  useEffect(() => {
    const loadData = async () => {
      await initEnemies();
      initGame();
    };
    loadData();

    // 页面关闭前自动存档
    const handleBeforeUnload = () => {
      if (boardRef.current.length > 0) {
        saveDataManager.saveGame(boardRef.current, playerRef.current, enemyRef.current, spellProgressRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [initGame]);

  /** 调用棋盘管理器处理消除流程 */
  const processMatches = async (currentBoard: Piece[], triggerPos: { row: number, col: number } | null = null) => {
    await gameBoardManager.processMatches(currentBoard, triggerPos, setBoard, setIsProcessing);
  };

  /** 处理棋子点击/交换逻辑 */
  const handlePieceClick = async (row: number, col: number) => {
    if (isProcessing || isPaused) return;

    if (!selected) {
      setSelected({ row, col });
    } else {
      const dist = Math.abs(selected.row - row) + Math.abs(selected.col - col);
      if (dist === 1) {
        // 相邻棋子交换
        const p1 = board.find(p => p.row === selected.row && p.col === selected.col);
        const p2 = board.find(p => p.row === row && p.col === col);
        
        if (p1 && p2) {
          const newBoard = board.map(p => {
            if (p.id === p1.id) return { ...p, row, col };
            if (p.id === p2.id) return { ...p, row: selected.row, col: selected.col };
            return p;
          });
          
          setBoard(newBoard);
          setSelected(null);
          await new Promise(resolve => setTimeout(resolve, SWAP_DURATION));
          
          // 检查交换后是否产生消除
          const { matches } = gameBoardManager.checkMatches(newBoard);
          if (matches.size > 0) {
            await processMatches(newBoard, { row, col });
          } else {
            // 无消除则换回（TODO: 增加换回动画）
            setBoard(board);
          }
        }
      } else {
        // 选中不相邻的棋子，更新选中项
        setSelected({ row, col });
      }
    }
  };

  /** 预览消除效果（伤害和技能进度） */
  const handlePieceDragOver = useCallback((row1: number, col1: number, row2: number, col2: number) => {
    if (isProcessing) return;
    
    // 避免重复计算
    if (lastPreviewRef.current?.r1 === row1 && lastPreviewRef.current?.c1 === col1 && 
        lastPreviewRef.current?.r2 === row2 && lastPreviewRef.current?.c2 === col2) return;
    
    lastPreviewRef.current = {r1: row1, c1: col1, r2: row2, c2: col2};
    
    const tempBoard = [...board];
    const idx1 = tempBoard.findIndex(p => p.row === row1 && p.col === col1);
    const idx2 = tempBoard.findIndex(p => p.row === row2 && p.col === col2);
    
    if (idx1 === -1 || idx2 === -1) return;
    
    // 模拟交换
    const p1 = { ...tempBoard[idx1], row: row2, col: col2 };
    const p2 = { ...tempBoard[idx2], row: row1, col: col1 };
    tempBoard[idx1] = p1;
    tempBoard[idx2] = p2;
    
    const { matchGroups } = gameBoardManager.checkMatches(tempBoard);
    
    if (matchGroups.length === 0) {
      setPreviewDamage(0);
      setPreviewSpellProgress(null);
      return;
    }
    
    let totalDmg = 0;
    const simulatedProgress = { ...spellProgress };
    const displayProgress = { ...spellProgress };
    
    // 按类型汇总消除数量，以匹配实际消除时的伤害计算逻辑
    const typeCounts: Record<number, number> = {};
    matchGroups.forEach(groupInfo => {
      const type = groupInfo.pieces[0].type;
      typeCounts[type] = (typeCounts[type] || 0) + groupInfo.pieces.length;
    });

    // 模拟计算所有匹配组产生的效果
    Object.entries(typeCounts).forEach(([typeStr, count]) => {
      const type = Number(typeStr) as PieceType;
      const element = ELEMENT_MAP[type];
      
      // 模拟法诀进度增加
      const points = simulatedProgress[element] + count;
      const releases = Math.trunc(points / SPELL_THRESHOLD);
      simulatedProgress[element] = points % SPELL_THRESHOLD;
      
      // 预览显示进度：累加消除数量，不进行取模，以便组件显示“满条”
      displayProgress[element] += count;

      // 累加模拟法诀伤害（如果释放了）
      if (releases > 0) {
        for (let i = 0; i < releases; i++) {
          totalDmg += battleManager.calculateDamage(player, enemy, element, SPELL_BASE_DAMAGE, 0);
        }
      }
    });
    
    setPreviewDamage(totalDmg);
    setPreviewSpellProgress(displayProgress);
  }, [board, isProcessing, player, enemy, spellProgress]);

  /** 结束预览 */
  const handlePieceDragEnd = useCallback(() => {
    setPreviewDamage(0);
    setPreviewSpellProgress(null);
    lastPreviewRef.current = null;
  }, []);

  /** 保存存档 */
  const handleSave = (slotId: string) => {
    saveDataManager.saveGame(board, player, enemy, spellProgress, slotId);
    setSaveSlots(saveDataManager.getSaveSlots());
  };

  /** 加载存档 */
  const handleLoad = (slotId: string) => {
    const saved = saveDataManager.loadGame(slotId);
    if (saved) {
      setBoard(saved.board);
      setPlayer(saved.player || INITIAL_PLAYER);
      setEnemy(saved.enemy || INITIAL_ENEMY);
      if (saved.spellProgress) {
        spellManager.setProgress(saved.spellProgress);
        setSpellProgress(spellManager.getProgress());
      }
      menuManager.closeMenu();
    }
  };

  /** 删除存档 */
  const handleDeleteSave = (slotId: string) => {
    saveDataManager.deleteSave(slotId);
    setSaveSlots(saveDataManager.getSaveSlots());
  };

  /** 投降逻辑 */
  const handleSurrender = () => {
    setPlayer(prev => ({ ...prev, currentHp: 0 }));
    menuManager.closeMenu();
    gameManager.surrender();
  };

  /** 重新开始游戏 */
  const handleRestart = () => {
    gameManager.reset(BATTLE_TIME);
    gameManager.startTimer(BATTLE_TIME);
    const newBoard = gameBoardManager.initBoard();
    setBoard(newBoard);
    setPlayer({ ...INITIAL_PLAYER });
    const firstEnemy = getEnemyConfig('enemy_001') || INITIAL_ENEMY;
    setEnemy({ ...firstEnemy });
    setTimer(BATTLE_TIME);
    spellManager.reset();
    setSpellProgress(spellManager.getProgress());
    setBattleQueue([]);
    setIsGameOver(false);
    setWinner(null);
    lastEnemyAttackTimeRef.current = 0;
    localStorage.removeItem('neon_match_auto_save');
  };

  return {
    state: {
      board,
      selected,
      isProcessing,
      player,
      enemy,
      saveSlots,
      isPaused,
      isMenuOpen,
      timer,
      spellProgress,
      spellNotifications,
      isGameOver,
      winner,
      isPlayerHit,
      isEnemyHit,
      damageNumbers,
      previewDamage,
      previewSpellProgress
    },
    actions: {
      handlePieceClick,
      handlePieceDragOver,
      handlePieceDragEnd,
      handleSave,
      handleLoad,
      handleDeleteSave,
      handleSurrender,
      handleRestart,
      toggleMenu: () => isMenuOpen ? menuManager.closeMenu() : menuManager.openMenu(),
      closeMenu: () => menuManager.closeMenu()
    }
  };
};
