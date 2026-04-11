import { motion, AnimatePresence } from 'motion/react';
import { ELEMENT_MAP } from '../logic/gameInitial';
import { PIECE_CONFIG, SPELL_THRESHOLD } from '../constants';
import { PieceType } from '../types';

interface SpellProgressBarsProps {
  /** 各元素法诀的当前进度 */
  spellProgress: Record<string, number>;
  /** 预览时的法诀进度变化 */
  previewProgress: Record<string, number> | null;
}

/**
 * 法诀进度条组件
 * 显示五行元素的能量积攒进度，支持消除预览效果
 */
export const SpellProgressBars = ({ spellProgress, previewProgress }: SpellProgressBarsProps) => {
  return (
    <div className="spells-container">
      {(Object.keys(ELEMENT_MAP)).map((typeStr) => {
        const type = Number(typeStr) as PieceType;
        const element = ELEMENT_MAP[type];
        const config = PIECE_CONFIG[type];
        const progress = spellProgress[element];
        
        // 计算预览宽度：如果预览进度超过阈值，则显示满条
        const previewVal = previewProgress ? previewProgress[element] : progress;
        const showPreview = previewProgress && previewProgress[element] > progress;
        const isReady = previewVal >= SPELL_THRESHOLD;
        
        return (
          <div key={element} className="spell-item">
            <div 
              className="spell-icon"
              style={{ backgroundColor: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}
            >
              {config.text}
            </div>
            <div className="spell-progress-bg">
              {/* 预览进度条（幽灵条） */}
              {showPreview && (
                <motion.div 
                  className="spell-preview-fill"
                  style={{ backgroundColor: config.color }}
                  animate={{ 
                    width: `${(Math.min(SPELL_THRESHOLD, previewVal) / SPELL_THRESHOLD) * 100}%`,
                    opacity: isReady ? [0.4, 0.8, 0.4] : 0.5
                  }}
                  transition={{ 
                    width: { duration: 0.2 },
                    opacity: isReady ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 }
                  }}
                />
              )}
              {/* 实际进度条 */}
              <motion.div 
                className="spell-progress-fill"
                style={{ backgroundColor: config.color }}
                animate={{ width: `${(progress / SPELL_THRESHOLD) * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
