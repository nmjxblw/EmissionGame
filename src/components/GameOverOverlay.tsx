import { motion, AnimatePresence } from 'motion/react';

interface GameOverOverlayProps {
  isGameOver: boolean;
  winner: 'player' | 'enemy' | null;
  onRestart: () => void;
}

export const GameOverOverlay = ({ isGameOver, winner, onRestart }: GameOverOverlayProps) => {
  return (
    <AnimatePresence>
      {isGameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overlay-backdrop"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="overlay-card"
          >
            <h2 className={`overlay-title ${winner === 'player' ? 'player' : 'enemy'}`}>
              {winner === 'player' ? '大捷' : '惜败'}
            </h2>
            <p className="overlay-desc">
              {winner === 'player' ? '道友修为深厚，妖魔已除！' : '胜败乃兵家常事，请道友重整旗鼓。'}
            </p>
            <button 
              onClick={onRestart}
              className="overlay-button"
            >
              再来一局
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
