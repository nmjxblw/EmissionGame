/**
 * PrepManager - 战前准备界面管理（队伍编辑、牌组构建）
 */
class PrepManager {
  static config = { roster: [null, null, null], deck: [] };
  static init() {
    SettingsManager.init();
    this.loadConfig();
    this.renderRoster();
    this.renderRosterPool();
    this.renderDeckBuilder();
    document.getElementById("btn-to-level").onclick = () => {
      if (this.validate()) {
        this.saveConfig();
        UIManager.switchScene("levelSelect");
      }
    };
    document.getElementById("btn-back-prep").onclick = () => {
      UIManager.switchScene("prep");
    };
    document.getElementById("btn-start-battle").onclick = () => {
      game.startBattle(this.config);
    };
    window.addEventListener("resize", this.fitScreen);
    this.fitScreen();
  }
  static fitScreen() {
    const container = document.getElementById("game-container");
    const scale = Math.min(
      window.innerWidth / CONFIG.SCREEN_WIDTH,
      window.innerHeight / CONFIG.SCREEN_HEIGHT,
    );
    container.style.transform = `scale(${scale})`;
  }
  static loadConfig() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.roster && parsed.roster.length === 3) this.config = parsed;
        else this.setDefaultRoster();
      } catch (e) {
        console.error(Utils.getText("save_load_failed"), e);
        this.setDefaultRoster();
      }
    } else {
      this.setDefaultRoster();
      this.autoFillDeck();
    }
  }
  static setDefaultRoster() {
    this.config.roster = ["kai", "sosa", "aya"];
  }
  static autoFillDeck() {
    this.config.deck = [];
    this.config.roster.forEach((cid, idx) => {
      if (!cid) return;
      this.config.deck.push({ charIndex: idx, actionId: 1 });
      this.config.deck.push({ charIndex: idx, actionId: 2 });
    });
    if (this.config.roster[0])
      this.config.deck.push({ charIndex: 0, actionId: 3 });
    if (this.config.roster[1])
      this.config.deck.push({ charIndex: 1, actionId: 3 });
  }
  static saveConfig() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.config));
  }
  static renderRosterPool() {
    const pool = document.getElementById("roster-pool");
    pool.innerHTML = "";
    const charCodes = dataLoader.getAllCharacterCodes();
    charCodes.forEach((charId) => {
      const charData = dataLoader.getCharacter(charId);
      const div = document.createElement("div");
      div.className = "pool-item";
      const isInRoster = this.config.roster.includes(charId);
      if (isInRoster) div.classList.add("disabled");
      div.innerText = Utils.getText(charData.name);
      div.onclick = () => {
        if (!isInRoster) this.addCharToRoster(charId);
      };
      pool.appendChild(div);
    });
  }
  static renderRoster() {
    const slots = document.getElementById("team-slots");
    slots.innerHTML = "";
    this.config.roster.forEach((charId, idx) => {
      const div = document.createElement("div");
      div.className = "char-slot";
      if (charId) {
        div.classList.add("selected");
        const charData = dataLoader.getCharacter(charId);
        div.innerText = charData ? Utils.getText(charData.name) : charId;
        const hint = document.createElement("div");
        hint.className = "remove-hint";
        hint.innerText = "x";
        div.appendChild(hint);
        div.onclick = () => this.removeCharFromRoster(idx);
        div.title = Utils.getText("click_remove");
      } else {
        div.classList.add("empty");
        div.innerText = Utils.getText("click_add");
        div.style.color = "#555";
      }
      slots.appendChild(div);
    });
  }
  static addCharToRoster(charId) {
    const emptyIdx = this.config.roster.indexOf(null);
    if (emptyIdx !== -1) {
      this.config.roster[emptyIdx] = charId;
      this.refreshAll();
    } else UIManager.showToast(Utils.getText("roster_full"), false);
  }
  static removeCharFromRoster(idx) {
    this.config.roster[idx] = null;
    this.config.deck = this.config.deck.filter((d) => d.charIndex !== idx);
    this.refreshAll();
  }
  static refreshAll() {
    this.renderRoster();
    this.renderRosterPool();
    this.renderDeckBuilder();
  }
  static renderDeckBuilder() {
    const container = document.getElementById("action-deck-ui");
    container.innerHTML = "";
    this.config.roster.forEach((charId, charIndex) => {
      if (!charId) return;
      const charData = dataLoader.getCharacter(charId);
      if (!charData || !charData.actions) return;
      Object.keys(charData.actions).forEach((actId) => {
        const act = charData.actions[actId];
        const btn = document.createElement("div");
        btn.className = "action-item";
        const inDeckIdx = this.config.deck.findIndex(
          (d) => d.charIndex === charIndex && d.actionId == actId,
        );
        if (inDeckIdx > -1) btn.classList.add("selected");
        btn.innerHTML = Utils.getTileSVG(
          actId,
          act.type !== "none" ? act.type : charData.element,
          true,
        );
        const dot = document.createElement("div");
        dot.className = "owner-dot";
        dot.style.background = ["red", "green", "blue"][charIndex];
        btn.appendChild(dot);
        btn.onclick = () => this.toggleDeckItem(charIndex, actId);
        container.appendChild(btn);
      });
    });
    document.getElementById("deck-count").innerText = this.config.deck.length;
    this.checkValidity();
  }
  static toggleDeckItem(charIndex, actionId) {
    const idx = this.config.deck.findIndex(
      (d) => d.charIndex === charIndex && d.actionId == actionId,
    );
    if (idx > -1) {
      this.config.deck.splice(idx, 1);
    } else {
      if (this.config.deck.length < 8)
        this.config.deck.push({ charIndex, actionId });
    }
    this.renderDeckBuilder();
  }
  static checkValidity() {
    const btn = document.getElementById("btn-to-level");
    btn.disabled = !this.validate();
  }
  static validate() {
    if (this.config.roster.some((c) => c === null)) return false;
    if (this.config.deck.length !== 8) return false;
    const hasC0 = this.config.deck.some((d) => d.charIndex === 0);
    const hasC1 = this.config.deck.some((d) => d.charIndex === 1);
    const hasC2 = this.config.deck.some((d) => d.charIndex === 2);
    return hasC0 && hasC1 && hasC2;
  }
}
