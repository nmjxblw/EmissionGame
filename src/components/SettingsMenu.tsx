import { motion, AnimatePresence } from 'motion/react';
import { Save, Download, Trash2, RotateCcw, Play } from 'lucide-react';
import { SaveSlot } from '../types';

interface SettingsMenuProps {
  isOpen: boolean;
  saveSlots: SaveSlot[];
  onClose: () => void;
  onSave: (id: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onSurrender: () => void;
  onToggleMenu: () => void;
}

export const SettingsMenu = ({ 
  isOpen, 
  saveSlots, 
  onClose, 
  onSave, 
  onLoad, 
  onDelete,
  onSurrender,
  onToggleMenu
}: SettingsMenuProps) => {
  return (
    <>
      <div className="menu-trigger-container">
        <motion.button 
          onClick={onToggleMenu}
          whileHover={{ scale: 1.1 }}
          className="menu-trigger-btn"
        >
          <motion.div
            animate={isOpen ? { rotate: 0 } : {}}
            whileHover={{ 
              rotate: 360,
              transition: { 
                rotate: { duration: 12, repeat: Infinity, ease: "linear" }
              }
            }}
          >
            <svg 
              id="gear-icon" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              className="gear-icon"
            >
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.61-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="menu-backdrop"
            />

            {/* Menu Content */}
            <div className="menu-overlay">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="menu-content"
              >
                <div className="menu-section">
                {/* Save Slots */}
                <div className="menu-subsection">
                  <h4 className="menu-label">存档管理</h4>
                  <div className="save-slots-container custom-scrollbar">
                    {saveSlots.map((slot) => (
                      <div key={slot.id} className="save-slot-item">
                        <div className="slot-info">
                          <p className="slot-title">进度 {slot.id}</p>
                          <p className="slot-time">
                            {slot.state ? `${new Date(slot.state.timestamp).toLocaleTimeString()}` : '空存档'}
                          </p>
                        </div>
                        <div className="slot-actions">
                          <button 
                            onClick={() => onSave(slot.id)}
                            className="slot-btn btn-save"
                            title="保存"
                          >
                            <Save size={16} />
                          </button>
                          {slot.state && (
                            <>
                              <button 
                                onClick={() => onLoad(slot.id)}
                                className="slot-btn btn-load"
                                title="读取"
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                onClick={() => onDelete(slot.id)}
                                className="slot-btn btn-delete"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="menu-actions-grid">
                  <button 
                    onClick={onClose}
                    className="action-btn btn-resume"
                  >
                    <Play size={20} fill="currentColor" />
                    恢复游戏
                  </button>
                  <button 
                    onClick={onSurrender}
                    className="action-btn btn-surrender"
                  >
                    <RotateCcw size={20} />
                    放弃对战
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
        )}
      </AnimatePresence>
    </>
  );
};
