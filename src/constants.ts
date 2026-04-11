import { PieceConfig } from './types';

// --- 网格设置 ---
/** 棋盘行数 */
export const ROWS = 5;
/** 棋盘列数 */
export const COLS = 8;
/** 棋子种类总数 */
export const TYPES = 5;

// --- 游戏机制 ---
/** 最小消除长度 */
export const MIN_MATCH_LENGTH = 3;
/** 生成强力棋子（十字消除）所需的最小匹配长度 */
export const POWER_PIECE_LENGTH = 4;
/** 生成炸弹棋子（九宫格消除）所需的最小匹配长度 */
export const BOMB_PIECE_LENGTH = 5;
/** 强力棋子的消除范围（距离中心1格的十字区域） */
export const POWER_ELIMINATION_RANGE = 1;
/** 炸弹棋子的消除范围（以中心为原点的1格半径正方形区域，即3x3） */
export const BOMB_ELIMINATION_RANGE = 1;
/** 棋子生成时的权重偏差（用于动态平衡） */
export const WEIGHT_BIAS = 0.1;
/** 棋子生成时尝试避免初始消除的最大尝试次数 */
export const MAX_GEN_ATTEMPTS = 10;
/** 法诀释放阈值 */
export const SPELL_THRESHOLD = 3;
/** 法诀基础伤害 */
export const SPELL_BASE_DAMAGE = 5;

// --- 时间配置 (ms) ---
/** 交换动画时长 */
export const SWAP_DURATION = 300;
/** 消除处理间的延迟（用于展示动画效果） */
export const PROCESS_DELAY = 400;

// --- 视觉表现 ---
/** 棋子最大宽度限制 */
export const PIECE_SIZE_MAX_WIDTH = 500;
/** 棋子文字大小 */
export const FONT_SIZE_PIECE = '32px';
/** 特殊棋子描边宽度 */
export const STROKE_WIDTH_SPECIAL = '3';
/** 普通棋子发光模糊度 */
export const GLOW_BLUR_NORMAL = '8px';
/** 强力棋子发光模糊度（呼吸效果） */
export const GLOW_BLUR_POWER = ['5px', '15px'];
/** 炸弹棋子发光模糊度（呼吸效果） */
export const GLOW_BLUR_BOMB = ['10px', '25px'];
/** 选中棋子的缩放比例 */
export const SCALE_SELECTED = 1.1;
/** 炸弹棋子的缩放比例 */
export const SCALE_BOMB = 1.1;
/** 强力棋子动画周期 */
export const DURATION_POWER_ANIM = 2;
/** 炸弹棋子动画周期 */
export const DURATION_BOMB_ANIM = 0.8;

/** 棋子配置信息（颜色、形状、文字等） */
export const PIECE_CONFIG: PieceConfig[] = [
  { color: '#38bdf8', name: 'Sky Blue', shape: 'triangle', text: '水', textColor: '#e0f2fe' }, // 水 (Water)
  { color: '#92400e', name: 'Earth Brown', shape: 'rectangle', text: '土', textColor: '#3d2b1f' }, // 土 (Earth)
  { color: '#10b981', name: 'Leaf Green', shape: 'diamond', text: '木', textColor: '#004d00' }, // 木 (Wood)
  { color: '#fde047', name: 'Goose Yellow', shape: 'hexagon', text: '金', textColor: '#fffbeb' }, // 金 (Metal)
  { color: '#e11d48', name: 'Blood Red', shape: 'circle', text: '火', textColor: '#fff1f2' }, // 火 (Fire)
];
