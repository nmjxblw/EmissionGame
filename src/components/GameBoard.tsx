import { motion, AnimatePresence, useMotionValue, animate, useTransform } from 'motion/react';
import React, { useRef, useState, useEffect } from 'react';
import { Piece } from '../types';
import { ROWS, COLS } from '../constants';
import { PieceComponent } from './Piece';

interface GameBoardProps {
  /** 棋盘棋子数据 */
  board: Piece[];
  /** 当前选中的棋子坐标 */
  selected: { row: number; col: number } | null;
  /** 棋子点击回调 */
  onPieceClick: (row: number, col: number) => void;
  /** 拖拽悬停回调（用于预览消除效果） */
  onDragOver: (row1: number, col1: number, row2: number, col2: number) => void;
  /** 拖拽结束回调 */
  onDragEnd: () => void;
  /** 游戏是否暂停 */
  isPaused?: boolean;
}

/**
 * 棋盘组件
 * 处理棋子的渲染、点击选中、以及基于指针事件的手势交换逻辑
 */
export const GameBoard = ({ board, selected, onPieceClick, onDragOver, onDragEnd, isPaused }: GameBoardProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  /** 预览交换中的目标格子坐标 */
  const [swappedCell, setSwappedCell] = useState<{ row: number; col: number } | null>(null);
  /** 当前正在交互（按下）的棋子ID */
  const [activePieceId, setActivePieceId] = useState<string | null>(null);
  /** 棋盘格子的实际像素尺寸 */
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  /** 指针按下的起始位置 */
  const startPos = useRef<{ x: number; y: number } | null>(null);
  /** 上一次判定的交换方向 */
  const lastDirection = useRef<{ row: number; col: number } | null>(null);

  // 监听窗口缩放，动态更新格子尺寸以保证交互判定准确
  useEffect(() => {
    const updateSize = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const style = window.getComputedStyle(gridRef.current);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const gap = parseFloat(style.gap) || 0;
        
        const stepX = (rect.width - paddingX + gap) / COLS;
        const stepY = (rect.height - paddingY + gap) / ROWS;
        
        setGridSize({ width: stepX, height: stepY });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cellWidth = gridSize.width;
  const cellHeight = gridSize.height;

  // 当棋盘更新或交互结束时重置临时状态
  useEffect(() => {
    if (!activePieceId) {
      setSwappedCell(null);
      lastDirection.current = null;
      startPos.current = null;
    }
  }, [board, activePieceId]);

  /** 处理指针按下：记录起始点并选中棋子 */
  const handlePointerDown = (piece: Piece, e: React.PointerEvent) => {
    if (isPaused) return;
    setActivePieceId(piece.id);
    startPos.current = { x: e.clientX, y: e.clientY };
    onPieceClick(piece.row, piece.col);
    
    // 捕获指针，确保移动到棋盘外也能接收到事件
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  /** 处理指针移动：基于位移判定交换方向并展示预览效果 */
  const handlePointerMove = (piece: Piece, e: React.PointerEvent) => {
    if (!activePieceId || !startPos.current || isPaused) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    // 判定阈值：移动超过格子宽度的 30% 时触发预览
    const threshold = cellWidth * 0.3;
    let targetRow = piece.row;
    let targetCol = piece.col;

    // 根据位移最大的轴判定方向
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) {
        targetCol = piece.col + (dx > 0 ? 1 : -1);
      }
    } else {
      if (Math.abs(dy) > threshold) {
        targetRow = piece.row + (dy > 0 ? 1 : -1);
      }
    }

    // 边界检查
    if (targetRow < 0 || targetRow >= ROWS || targetCol < 0 || targetCol >= COLS) {
      targetRow = piece.row;
      targetCol = piece.col;
    }

    const isLegal = targetRow !== piece.row || targetCol !== piece.col;
    const directionChanged = lastDirection.current?.row !== targetRow || lastDirection.current?.col !== targetCol;

    if (directionChanged) {
      // 当指针相对方位发生变化时，先将棋子复位
      setSwappedCell(null);
      onDragEnd();

      if (isLegal) {
        // 然后再与对应方向上的棋子交换位置（视觉预览）
        setSwappedCell({ row: targetRow, col: targetCol });
        onDragOver(piece.row, piece.col, targetRow, targetCol);
      }
      
      lastDirection.current = { row: targetRow, col: targetCol };
    }
  };

  /** 处理指针抬起：执行最终的交换操作 */
  const handlePointerUp = (piece: Piece, e: React.PointerEvent) => {
    if (!activePieceId || isPaused) return;

    const target = lastDirection.current;
    if (target && (target.row !== piece.row || target.col !== piece.col)) {
      // 执行实际的交换逻辑
      onPieceClick(piece.row, piece.col);
      onPieceClick(target.row, target.col);
    }

    // 清理状态
    setActivePieceId(null);
    setSwappedCell(null);
    lastDirection.current = null;
    startPos.current = null;
    onDragEnd();
    
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="game-board">
      <div 
        className="board-grid"
        style={{ 
          aspectRatio: `${COLS} / ${ROWS}`,
          height: '100%',
          width: 'auto'
        }}
      >
        {/* 背景格线 */}
        <div 
          className="grid-background"
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`
          }}
        >
          {Array.from({ length: ROWS * COLS }).map((_, i) => (
            <div key={i} className="grid-cell-bg" />
          ))}
        </div>

        {/* 棋子层 */}
        <div 
          ref={gridRef}
          className="pieces-grid"
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`
          }}
        >
          <AnimatePresence mode="popLayout">
            {board.map((piece) => {
              const isActive = piece.id === activePieceId;
              const activePiece = board.find(p => p.id === activePieceId);
              const isSwapped = swappedCell && piece.row === swappedCell.row && piece.col === swappedCell.col;
              
              // 计算显示的行列（处理预览时的视觉交换）
              let displayRow = piece.row;
              let displayCol = piece.col;
              
              if (isSwapped && activePiece) {
                displayRow = activePiece.row;
                displayCol = activePiece.col;
              } else if (isActive && swappedCell) {
                displayRow = swappedCell.row;
                displayCol = swappedCell.col;
              }

              return (
                <motion.div 
                  key={piece.id}
                  layout
                  onPointerDown={(e) => handlePointerDown(piece, e)}
                  onPointerMove={(e) => handlePointerMove(piece, e)}
                  onPointerUp={(e) => handlePointerUp(piece, e)}
                  style={{
                    gridRowStart: displayRow + 1,
                    gridColumnStart: displayCol + 1,
                    zIndex: isActive ? 50 : 10,
                    pointerEvents: isPaused ? 'none' : 'auto',
                    touchAction: 'none' // 禁用移动端默认滚动，确保手势流畅
                  }}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    filter: isActive ? "brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.3))" : "none"
                  }}
                  className="piece-motion-wrapper"
                >
                  <PieceComponent 
                    piece={piece}
                    isSelected={selected?.row === piece.row && selected?.col === piece.col}
                    onClick={() => {}} 
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
