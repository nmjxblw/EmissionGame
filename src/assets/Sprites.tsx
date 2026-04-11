import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const PlayerSprite = ({ isHit }: { isHit?: boolean }) => (
  <motion.div 
    animate={{ 
      y: [0, -6, 0], 
      rotate: [45, 50, 45],
      x: isHit ? [0, -10, 10, -10, 10, 0] : 0,
    }}
    transition={{ 
      y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      x: { duration: 0.4, ease: "linear" }
    }}
    className="sprite-container"
  >
    <motion.div 
      animate={{ 
        backgroundColor: isHit ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.2)"
      }}
      className="sprite-glow" 
    />
    <motion.div 
      animate={{ 
        borderColor: isHit ? "rgba(239, 68, 68, 0.6)" : "rgba(59, 130, 246, 0.3)",
        backgroundColor: isHit ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.05)"
      }}
      className={`sprite-body ${isHit ? 'hit' : ''} player`}
    >
      <motion.div 
        animate={{ 
          backgroundColor: isHit ? "#ef4444" : "#38bdf8",
          boxShadow: isHit ? "0 0 20px rgba(239, 68, 68, 0.8)" : "0 0 20px rgba(56,189,248,0.6)"
        }}
        className="player-sprite-inner" 
      />
    </motion.div>
  </motion.div>
);

export const EnemySprite = ({ isHit }: { isHit?: boolean }) => (
  <motion.div 
    animate={{ 
      y: [0, -10, 0], 
      scale: [1, 1.03, 1],
      x: isHit ? [0, 10, -10, 10, -10, 0] : 0,
    }}
    transition={{ 
      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      x: { duration: 0.4, ease: "linear" }
    }}
    className="sprite-container"
  >
    <motion.div 
      animate={{ 
        backgroundColor: isHit ? "rgba(239, 68, 68, 0.6)" : "rgba(225, 29, 72, 0.2)"
      }}
      className="sprite-glow" 
    />
    <motion.div 
      animate={{ 
        borderColor: isHit ? "rgba(239, 68, 68, 0.8)" : "rgba(225, 29, 72, 0.3)",
        backgroundColor: isHit ? "rgba(239, 68, 68, 0.3)" : "rgba(225, 29, 72, 0.05)"
      }}
      className={`sprite-body ${isHit ? 'hit' : ''} enemy`}
    >
      <motion.div
        animate={{
          color: isHit ? "#ffffff" : "#fb7185"
        }}
        className="enemy-sprite-inner"
      >
        <Sparkles className="sparkle-icon" />
      </motion.div>
    </motion.div>
  </motion.div>
);
