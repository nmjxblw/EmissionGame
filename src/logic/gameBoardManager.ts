import { Piece, PieceType, MatchGroup } from '../types';
import { 
  ROWS, 
  COLS, 
  TYPES, 
  WEIGHT_BIAS, 
  MAX_GEN_ATTEMPTS, 
  MIN_MATCH_LENGTH,
  PROCESS_DELAY, 
  POWER_PIECE_LENGTH, 
  BOMB_PIECE_LENGTH, 
  POWER_ELIMINATION_RANGE, 
  BOMB_ELIMINATION_RANGE 
} from '../constants';
import { eventManager } from './eventManager';

/**
 * 棋盘管理器类
 * 负责棋盘的初始化、棋子生成、消除检测、特殊棋子处理及掉落补全
 */
class GameBoardManager {
  /** 当前棋盘状态 */
  private board: Piece[] = [];

  /** 设置棋盘数据 */
  setBoard(board: Piece[]) {
    this.board = board;
  }

  /** 获取当前棋盘数据 */
  getBoard() {
    return this.board;
  }

  /**
   * 生成一个新的棋子
   * @param row 行坐标
   * @param col 列坐标
   * @param currentBoard 当前棋盘快照，用于检测是否会立即形成消除
   * @returns 生成的棋子对象
   */
  generatePiece(row: number, col: number, currentBoard: Piece[]): Piece {
    const counts = Array(TYPES).fill(0);
    currentBoard.forEach(p => counts[p.type]++);
    
    // 计算权重，使得出现次数较少的棋子生成概率更高（动态平衡）
    const total = currentBoard.length || 1;
    const weights = counts.map(c => 1 / ((c / total) + WEIGHT_BIAS));
    const weightSum = weights.reduce((a, b) => a + b, 0);
    
    let type: PieceType = 0;
    let attempts = 0;
    // 尝试生成不立即导致消除的棋子
    while (attempts < MAX_GEN_ATTEMPTS) {
      let rand = Math.random() * weightSum;
      for (let i = 0; i < TYPES; i++) {
        if (rand < weights[i]) {
          type = i as PieceType;
          break;
        }
        rand -= weights[i];
      }

      const horizontalMatch = (col >= 2 && currentBoard.find(p => p.row === row && p.col === col - 1)?.type === type && currentBoard.find(p => p.row === row && p.col === col - 2)?.type === type);
      const verticalMatch = (row >= 2 && currentBoard.find(p => p.row === row - 1 && p.col === col)?.type === type && currentBoard.find(p => p.row === row - 2 && p.col === col)?.type === type);
      
      if (!horizontalMatch && !verticalMatch) break;
      attempts++;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      special: 'none',
      row,
      col
    };
  }

  /**
   * 检测棋盘上的所有匹配项
   * @param currentBoard 待检测的棋盘
   * @returns 包含所有消除棋子ID的集合以及匹配分组信息
   */
  checkMatches(currentBoard: Piece[]) {
    const matches = new Set<string>();
    const horizontalGroups: Piece[][] = [];
    const verticalGroups: Piece[][] = [];

    // 水平方向检测
    for (let r = 0; r < ROWS; r++) {
      let count = 1;
      for (let c = 1; c <= COLS; c++) {
        const prev = currentBoard.find(p => p.row === r && p.col === c - 1);
        const curr = currentBoard.find(p => p.row === r && p.col === c);
        if (curr && prev && curr.type === prev.type) {
          count++;
        } else {
          if (count >= MIN_MATCH_LENGTH) {
            const group: Piece[] = [];
            for (let i = 1; i <= count; i++) {
              const p = currentBoard.find(p => p.row === r && p.col === c - i)!;
              matches.add(p.id);
              group.push(p);
            }
            horizontalGroups.push(group);
          }
          count = 1;
        }
      }
    }

    // 垂直方向检测
    for (let c = 0; c < COLS; c++) {
      let count = 1;
      for (let r = 1; r <= ROWS; r++) {
        const prev = currentBoard.find(p => p.row === r - 1 && p.col === c);
        const curr = currentBoard.find(p => p.row === r && p.col === c);
        if (curr && prev && curr.type === prev.type) {
          count++;
        } else {
          if (count >= MIN_MATCH_LENGTH) {
            const group: Piece[] = [];
            for (let i = 1; i <= count; i++) {
              const p = currentBoard.find(p => p.row === r - i && p.col === c)!;
              matches.add(p.id);
              group.push(p);
            }
            verticalGroups.push(group);
          }
          count = 1;
        }
      }
    }

    // 组合匹配组（处理 T 型、L 型等交叉消除）
    const matchGroups: MatchGroup[] = [];
    const usedHorizontal = new Set<number>();
    const usedVertical = new Set<number>();

    horizontalGroups.forEach((hGroup, hIdx) => {
      verticalGroups.forEach((vGroup, vIdx) => {
        const intersection = hGroup.filter(hp => vGroup.some(vp => vp.id === hp.id));
        if (intersection.length > 0) {
          const combined = Array.from(new Set([...hGroup, ...vGroup]));
          matchGroups.push({ pieces: combined, isTL: true });
          usedHorizontal.add(hIdx);
          usedVertical.add(vIdx);
        }
      });
    });

    horizontalGroups.forEach((group, idx) => {
      if (!usedHorizontal.has(idx)) matchGroups.push({ pieces: group, isTL: false });
    });
    verticalGroups.forEach((group, idx) => {
      if (!usedVertical.has(idx)) matchGroups.push({ pieces: group, isTL: false });
    });

    return { matches, matchGroups };
  }

  /** 初始化棋盘，生成一个没有初始消除项的棋盘 */
  initBoard(): Piece[] {
    const newBoard: Piece[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        newBoard.push(this.generatePiece(r, c, newBoard));
      }
    }
    this.board = newBoard;
    return newBoard;
  }

  /**
   * 处理消除流程（核心逻辑）
   * 包括：检测匹配、触发特殊棋子、计算连击、掉落补全
   * @param currentBoard 当前棋盘
   * @param triggerPos 触发消除的位置（玩家操作点）
   * @param updateBoard 更新 UI 棋盘的回调
   * @param setProcessing 设置是否正在处理中的回调
   */
  async processMatches(
    currentBoard: Piece[], 
    triggerPos: { row: number, col: number } | null,
    updateBoard: (board: Piece[]) => void,
    setProcessing: (processing: boolean) => void
  ) {
    setProcessing(true);
    let tempBoard = [...currentBoard];
    let hasMoreMatches = true;
    let currentTrigger = triggerPos;
    let combo = 0;

    // 循环处理直到没有更多匹配项（处理连击）
    while (hasMoreMatches) {
      const { matches, matchGroups } = this.checkMatches(tempBoard);
      if (matches.size === 0) {
        hasMoreMatches = false;
        break;
      }

      // 1. 判定并生成特殊棋子
      const newSpecials: Piece[] = [];
      matchGroups.forEach(groupInfo => {
        const group = groupInfo.pieces;
        let spawnPiece = group[Math.floor(group.length / 2)];
        
        // 优先在玩家操作点生成特殊棋子
        if (currentTrigger) {
          const triggerInGroup = group.find(p => p.row === currentTrigger!.row && p.col === currentTrigger!.col);
          if (triggerInGroup) {
            spawnPiece = triggerInGroup;
          }
        }

        if (groupInfo.isTL || group.length >= BOMB_PIECE_LENGTH) {
          newSpecials.push({ ...spawnPiece, id: Math.random().toString(36).substr(2, 9), special: 'bomb' });
        } else if (group.length >= POWER_PIECE_LENGTH) {
          newSpecials.push({ ...spawnPiece, id: Math.random().toString(36).substr(2, 9), special: 'power' });
        }
      });

      // 第一轮消除后清除触发点
      if (combo === 0) {
        currentTrigger = null;
      }

      // 2. 递归触发特殊棋子的连锁反应
      const toEliminate = new Set(matches);
      let addedAny = true;
      while (addedAny) {
        addedAny = false;
        const currentToEliminate = Array.from(toEliminate);
        for (const id of currentToEliminate) {
          const p = tempBoard.find(piece => piece.id === id);
          if (p && p.special !== 'none') {
            if (p.special === 'power') {
              // 十字消除
              tempBoard.forEach(other => {
                if (!toEliminate.has(other.id) && Math.abs(other.row - p.row) + Math.abs(other.col - p.col) <= POWER_ELIMINATION_RANGE) {
                  toEliminate.add(other.id);
                  addedAny = true;
                }
              });
            } else if (p.special === 'bomb') {
              // 九宫格消除
              tempBoard.forEach(other => {
                if (!toEliminate.has(other.id) && Math.abs(other.row - p.row) <= BOMB_ELIMINATION_RANGE && Math.abs(other.col - p.col) <= BOMB_ELIMINATION_RANGE) {
                  toEliminate.add(other.id);
                  addedAny = true;
                }
              });
            }
          }
        }
      }

      // 3. 统计消除数量并发送事件（用于技能充能等）
      const eliminatedCounts: Record<number, number> = {};
      toEliminate.forEach(id => {
        const p = tempBoard.find(piece => piece.id === id);
        if (p) {
          eliminatedCounts[p.type] = (eliminatedCounts[p.type] || 0) + 1;
        }
      });

      Object.entries(eliminatedCounts).forEach(([type, count]) => {
        eventManager.emit('PIECE_ELIMINATED', { pieceType: Number(type) as PieceType, count });
      });

      // 4. 执行消除并添加新生成的特殊棋子
      tempBoard = tempBoard.filter(p => !toEliminate.has(p.id));
      tempBoard.push(...newSpecials);

      // 5. 处理掉落补全
      for (let c = 0; c < COLS; c++) {
        let emptyRows = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
          const p = tempBoard.find(piece => piece.row === r && piece.col === c);
          if (!p) {
            emptyRows++;
          } else if (emptyRows > 0) {
            p.row += emptyRows;
          }
        }
        // 在顶部生成新棋子
        for (let i = 0; i < emptyRows; i++) {
          tempBoard.push(this.generatePiece(i, c, tempBoard));
        }
      }

      // 6. 更新状态并等待动画延迟
      this.board = [...tempBoard];
      updateBoard(this.board);
      combo++;
      await new Promise(resolve => setTimeout(resolve, PROCESS_DELAY));
    }
    setProcessing(false);
  }
}

/** 棋盘管理器单例 */
export const gameBoardManager = new GameBoardManager();
