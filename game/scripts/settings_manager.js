/**
 * SettingsManager - 游戏设置管理（音量、暂停、投降等）
 */
class SettingsManager {
  static isPaused = false;
  static init() {
    const btn = document.getElementById("settings-btn");
    const modal = document.getElementById("settings-modal");
    const resumeBtn = document.getElementById("btn-resume");
    const volSlider = document.getElementById("vol-slider");
    const langBtn = document.getElementById("lang-switch-btn");
    const surrenderBtn = document.getElementById("btn-surrender");
    btn.onclick = () => {
      this.toggle(true);
      SoundManager.init();
    };
    resumeBtn.onclick = () => this.toggle(false);
    volSlider.oninput = (e) => {
      SoundManager.setVolume(e.target.value / 100);
    };
    langBtn.onclick = () => {
      LangManager.toggle();
    };
    surrenderBtn.onclick = () => {
      game.battleSystem.surrender();
    };
    LangManager.apply();
  }
  static toggle(show) {
    const modal = document.getElementById("settings-modal");
    const battleControls = document.getElementById("battle-controls");
    const isBattle = game.battleSystem.isBattleActive;
    if (show) {
      modal.classList.add("active");
      if (isBattle) {
        this.isPaused = true;
        battleControls.style.display = "block";
      } else {
        battleControls.style.display = "none";
      }
    } else {
      modal.classList.remove("active");
      this.isPaused = false;
    }
  }
}
