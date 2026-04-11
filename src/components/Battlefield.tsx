import { motion, AnimatePresence } from 'motion/react';
import { User, Swords } from 'lucide-react';
import { Character } from '../types';
import { PlayerSprite, EnemySprite } from '../assets/Sprites';

interface BattlefieldProps {
  timer: number;
  player: Character;
  enemy: Character;
  isPlayerHit?: boolean;
  isEnemyHit?: boolean;
  notifications: { id: string; text: string; color: string; yOffset: number; type: 'player' | 'enemy' }[];
  damageNumbers: { id: string; value: number; color: string; type: 'player' | 'enemy'; velocity: { x: number; y: number } }[];
  previewDamage?: number;
  isPaused?: boolean;
}

export const Battlefield = ({ 
  timer, 
  player, 
  enemy, 
  isPlayerHit, 
  isEnemyHit,
  notifications,
  damageNumbers,
  previewDamage = 0,
  isPaused
}: BattlefieldProps) => {
  return (
    <div className="battlefield">
      <div className="battlefield-overlay" />
      
      {/* Timer */}
      <div className="timer-container">
        <div className="timer-badge">
          <span className="timer-text">
            {timer}
          </span>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="battle-arena">
        {/* Paused Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="paused-overlay"
            >
              <div className="paused-badge">
                已暂停
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Player Side (Left 1/3) */}
        <div className="side-container">
          <div className="sprite-wrapper">
            <PlayerSprite isHit={isPlayerHit} />
            
            {/* Damage Numbers */}
            <AnimatePresence>
              {damageNumbers.filter(d => d.type === 'player').map(d => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    x: d.velocity.x * 1.0, 
                    y: [0, d.velocity.y * 0.8, d.velocity.y * 0.4 + 100], 
                    scale: [0.5, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.0, 
                    ease: "easeOut",
                    times: [0, 0.1, 0.8, 1]
                  }}
                  className="damage-number"
                  style={{ color: d.color }}
                >
                  -{d.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="stats-container">
            <span className="character-label player">
              <User size={8} /> {player.name}
            </span>
            <div className="hp-bar-container">
              <div className="hp-values">
                <span className="hp-current player">{player.currentHp}</span>
                <span className="hp-max player">{player.maxHp}</span>
              </div>
              <div className="hp-bar-bg">
                <motion.div 
                  className="hp-bar-fill"
                  animate={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section (Barrage Display 1/3) */}
        <div className="notification-area">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ 
                  opacity: 0, 
                  x: notif.type === 'player' ? '-150%' : '150%', 
                  y: notif.yOffset, 
                  scale: 0.6,
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: notif.type === 'player' ? '150%' : '-150%',
                  y: [notif.yOffset, notif.yOffset - 30, notif.yOffset - 10], // 错位浮动效果
                  scale: [0.6, 1.6, 1.2],
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1.2, 
                  ease: "easeOut",
                }}
                className="battle-notification"
                style={{ 
                  color: notif.color,
                }}
              >
                {notif.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enemy Side (Right 1/3) */}
        <div className="side-container">
          <div className="sprite-wrapper">
            <EnemySprite isHit={isEnemyHit} />

            {/* Damage Numbers */}
            <AnimatePresence>
              {damageNumbers.filter(d => d.type === 'enemy').map(d => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    x: d.velocity.x * 1.0, 
                    y: [0, d.velocity.y * 0.8, d.velocity.y * 0.4 + 100], 
                    scale: [0.5, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.0, 
                    ease: "easeOut",
                    times: [0, 0.1, 0.8, 1]
                  }}
                  className="damage-number"
                  style={{ color: d.color }}
                >
                  -{d.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="stats-container">
            <span className="character-label enemy">
              <Swords size={8} /> {enemy.name}
            </span>
            <div className="hp-bar-container">
              <div className="hp-values">
                <span className="hp-current enemy">{enemy.currentHp}</span>
                <span className="hp-max enemy">{enemy.maxHp}</span>
              </div>
              <div className="hp-bar-bg">
                {/* 1. 基础血条填充 */}
                <motion.div 
                  className="hp-bar-fill enemy-hp-bar-fill"
                  animate={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
                
                {/* 2. 伤害预览遮罩 (幽灵条) */}
                {/* 遮罩起点为当前血条右端点，向左延伸遮住血条 */}
                {previewDamage > 0 && (
                  <motion.div 
                    className="preview-damage-mask"
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      height: '100%', 
                      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 遮罩色：半透明黑
                      zIndex: 20,
                      right: `${100 - (enemy.currentHp / enemy.maxHp) * 100}%`,
                      pointerEvents: 'none',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                    animate={{ 
                      width: `${(Math.min(enemy.currentHp, previewDamage) / enemy.maxHp) * 100}%`
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
