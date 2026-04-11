import { useGameViewModel } from './logic/useGameViewModel';

// 提取出的子组件
import { GameOverOverlay } from './components/GameOverOverlay';
import { SettingsMenu } from './components/SettingsMenu';
import { Battlefield } from './components/Battlefield';
import { SpellProgressBars } from './components/SpellProgressBars';
import { GameBoard } from './components/GameBoard';

/**
 * 游戏主入口组件
 * 负责整体布局的组织，将 ViewModel 的状态分发给各个功能组件
 */
export default function App() {
  // 获取游戏状态和操作方法
  const { state, actions } = useGameViewModel();

  return (
    <div className="app-container">
      {/* 背景装饰元素 */}
      <div className="bg-decor">
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>

      {/* 顶部菜单与设置界面 */}
      <SettingsMenu 
        isOpen={state.isMenuOpen}
        saveSlots={state.saveSlots}
        onClose={actions.closeMenu}
        onSave={actions.handleSave}
        onLoad={actions.handleLoad}
        onDelete={actions.handleDeleteSave}
        onSurrender={actions.handleSurrender}
        onToggleMenu={actions.toggleMenu}
      />

      {/* 游戏核心区域 */}
      <main className="main-area">
        {/* 1. 战斗区域 (顶部)：显示血条、计时器、受击动画和飘字 */}
        <div className="battlefield-wrapper">
          <Battlefield 
            timer={state.timer}
            player={state.player}
            enemy={state.enemy}
            isPlayerHit={state.isPlayerHit}
            isEnemyHit={state.isEnemyHit}
            notifications={state.spellNotifications}
            damageNumbers={state.damageNumbers}
            previewDamage={state.previewDamage}
            isPaused={state.isPaused}
          />
        </div>

        {/* 2. 法诀进度条 (中部)：显示五行元素的充能进度 */}
        <div className="spells-wrapper">
          <SpellProgressBars 
            spellProgress={state.spellProgress} 
            previewProgress={state.previewSpellProgress}
          />
        </div>

        {/* 3. 消除棋盘 (底部)：游戏核心交互区域 */}
        <div className="board-wrapper">
          <GameBoard 
            board={state.board}
            selected={state.selected}
            onPieceClick={actions.handlePieceClick}
            onDragOver={actions.handlePieceDragOver}
            onDragEnd={actions.handlePieceDragEnd}
            isPaused={state.isPaused}
          />
        </div>
      </main>

      {/* 游戏结束弹窗 */}
      <GameOverOverlay 
        isGameOver={state.isGameOver}
        winner={state.winner}
        onRestart={actions.handleRestart}
      />
    </div>
  );
}
