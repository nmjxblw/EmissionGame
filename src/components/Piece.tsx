import { motion } from 'motion/react';
import { Piece } from '../types';
import { 
  PIECE_CONFIG, 
  FONT_SIZE_PIECE, 
  STROKE_WIDTH_SPECIAL, 
  GLOW_BLUR_NORMAL, 
  GLOW_BLUR_POWER, 
  GLOW_BLUR_BOMB, 
  SCALE_SELECTED, 
  SCALE_BOMB, 
  DURATION_POWER_ANIM, 
  DURATION_BOMB_ANIM 
} from '../constants';

import { 
  TrianglePiece,
  HexagonPiece,
  RectanglePiece,
  DiamondPiece,
  CirclePiece
} from '../svg/PieceSVGs';

interface PieceProps {
  piece: Piece;
  onClick: () => void;
  isSelected: boolean;
}

export const PieceComponent = ({ piece, onClick, isSelected }: PieceProps) => {
  const config = PIECE_CONFIG[piece.type];
  
  const renderShape = () => {
    const commonProps = {
      color: config.color,
      textColor: config.textColor,
      text: config.text,
      special: piece.special,
      strokeWidthSpecial: STROKE_WIDTH_SPECIAL,
      glowBlurNormal: GLOW_BLUR_NORMAL,
      fontSizePiece: FONT_SIZE_PIECE
    };

    switch (config.shape) {
      case 'triangle':
        return <TrianglePiece {...commonProps} />;
      case 'hexagon':
        return <HexagonPiece {...commonProps} />;
      case 'rectangle':
        return <RectanglePiece {...commonProps} />;
      case 'diamond':
        return <DiamondPiece {...commonProps} />;
      case 'circle':
        return <CirclePiece {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isSelected ? SCALE_SELECTED : 1, 
        opacity: 1,
        ...(piece.special === 'power' ? {
          filter: [
            `brightness(1) drop-shadow(0 0 ${GLOW_BLUR_POWER[0]} ${config.color})`,
            `brightness(1.3) drop-shadow(0 0 ${GLOW_BLUR_POWER[1]} ${config.color})`,
            `brightness(1) drop-shadow(0 0 ${GLOW_BLUR_POWER[0]} ${config.color})`
          ]
        } : {}),
        ...(piece.special === 'bomb' ? {
          scale: [1, SCALE_BOMB, 1],
          filter: [
            `brightness(1) drop-shadow(0 0 ${GLOW_BLUR_BOMB[0]} #fbbf24)`,
            `brightness(1.5) drop-shadow(0 0 ${GLOW_BLUR_BOMB[1]} #fbbf24)`,
            `brightness(1) drop-shadow(0 0 ${GLOW_BLUR_BOMB[0]} #fbbf24)`
          ]
        } : {})
      }}
      transition={{
        ...(piece.special === 'power' ? { filter: { repeat: Infinity, duration: DURATION_POWER_ANIM } } : {}),
        ...(piece.special === 'bomb' ? { scale: { repeat: Infinity, duration: DURATION_BOMB_ANIM }, filter: { repeat: Infinity, duration: DURATION_BOMB_ANIM } } : {})
      }}
      exit={{ scale: 0, opacity: 0 }}
      className="piece-container"
      onClick={onClick}
    >
      <div className="piece-inner">
        {renderShape()}
      </div>
      {isSelected && (
        <motion.div 
          layoutId="selection"
          className="piece-selection-border"
        />
      )}
    </motion.div>
  );
};
