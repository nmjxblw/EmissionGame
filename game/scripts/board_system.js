/**
 * Board System
 * 游戏棋盘系统（三消机制）
 */
class BoardSystem {
  static grid = [];
  static width = 10;
  static height = 10;
  static actionDeck = [];
  static playerTeam = [];
  static deckPool = [];
  static isLocked = false;

  static init(playerTeam, deckConfig) {
    this.playerTeam = playerTeam;
    this.deckPool = [];
    deckConfig.forEach((cfg) => {
      const charEntity = this.playerTeam.find(
        (p) => p.position === cfg.charIndex,
      );
      if (charEntity) {
        const actionData = charEntity.actions[cfg.actionId];
        if (!actionData) return;
        const element =
          actionData && actionData.type !== "none"
            ? actionData.type
            : charEntity.element;
        this.deckPool.push({
          charIndex: cfg.charIndex,
          actionId: cfg.actionId,
          element: element,
        });
      }
    });
    this.fillBoard(true);
    this.bindEvents();
    this.render();
  }

  static getRandomTile() {
    if (this.deckPool.length === 0) return null;
    const item =
      this.deckPool[Math.floor(Math.random() * this.deckPool.length)];
    return {
      id: Utils.uuid(),
      type: item.actionId,
      charIndex: item.charIndex,
      element: item.element,
      isMatch: false,
      justDropped: false,
      dropDistance: 0,
    };
  }

  static fillBoard(full = false) {
    if (full) {
      this.grid = [];
      for (let y = 0; y < this.height; y++) {
        let row = [];
        for (let x = 0; x < this.width; x++) row.push(this.getRandomTile());
        this.grid.push(row);
      }
    } else {
      for (let x = 0; x < this.width; x++) {
        let emptySlots = 0;
        for (let y = this.height - 1; y >= 0; y--) {
          if (this.grid[y][x] === null) emptySlots++;
          else if (emptySlots > 0) {
            this.grid[y + emptySlots][x] = this.grid[y][x];
            this.grid[y][x] = null;
            this.grid[y + emptySlots][x].dropDistance = emptySlots;
          }
        }
        for (let y = 0; y < emptySlots; y++) {
          this.grid[y][x] = this.getRandomTile();
          this.grid[y][x].dropDistance = emptySlots;
        }
      }
    }
  }

  static render() {
    const canvas = document.getElementById("grid-canvas");
    canvas.innerHTML = "";
    const activeCharIdx = game.battleSystem.currentEntity?.isPlayer
      ? game.battleSystem.currentEntity.position
      : -1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.grid[y][x];
        if (!tile) continue;
        const div = document.createElement("div");
        div.className = "tile";
        div.dataset.x = x;
        div.dataset.y = y;
        if (tile.dropDistance > 0) {
          div.style.setProperty("--drop-dist", tile.dropDistance);
          div.classList.add("falling");
          tile.dropDistance = 0;
        }
        const isOwnedByActive = tile.charIndex === activeCharIdx;
        const isHighLight = activeCharIdx !== -1 ? isOwnedByActive : true;
        if (activeCharIdx !== -1 && !isOwnedByActive)
          div.classList.add("dimmed");
        else div.classList.add("highlighted");
        div.innerHTML = Utils.getTileSVG(tile.type, tile.element, isHighLight);
        canvas.appendChild(div);
      }
    }
  }

  static prepareBoardForCharacter(charEntity) {
    const charIdx = charEntity.position;
    let hasTiles = false;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] && this.grid[y][x].charIndex === charIdx) {
          hasTiles = true;
          break;
        }
      }
    }
    if (!hasTiles) {
      UIManager.showToast(Utils.getText("refresh_board"), false);
      this.fillBoard(true);
    }
    this.render();
  }

  static bindEvents() {
    const oldCanvas = document.getElementById("grid-canvas");
    const newCanvas = oldCanvas.cloneNode(true);
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

    let selected = null;
    let lastClickTime = 0;
    let lastClickTile = null;
    newCanvas.addEventListener("click", (e) => {
      if (this.isLocked) return;
      SoundManager.init();
      const el = e.target.closest(".tile");
      if (!el) return;
      const activeEntity = game.battleSystem.currentEntity;
      if (!activeEntity || !activeEntity.isPlayer) return;
      const x = parseInt(el.dataset.x);
      const y = parseInt(el.dataset.y);
      const tile = this.grid[y][x];
      const now = Date.now();
      const isMine = tile.charIndex === activeEntity.position;

      if (isMine && lastClickTile === tile && now - lastClickTime < 300) {
        SoundManager.playClick();
        this.handleElimination([{ x, y }], tile.type, false);
        lastClickTile = null;
        lastClickTime = 0;
        selected = null;
        this.clearSelection();
        return;
      }
      SoundManager.playClick();
      if (isMine) {
        lastClickTile = tile;
        lastClickTime = now;
      } else lastClickTile = null;

      if (!selected) {
        if (!isMine) return;
        selected = { x, y, el };
        el.classList.add("selected-swap");
      } else {
        const dist = Math.abs(selected.x - x) + Math.abs(selected.y - y);
        if (dist === 0) {
          this.clearSelection();
          selected = null;
          return;
        }
        if (dist === 1) {
          this.swapAndCheck(selected, { x, y });
          selected = null;
          this.clearSelection();
        } else {
          this.clearSelection();
          if (isMine) {
            selected = { x, y, el };
            el.classList.add("selected-swap");
          } else selected = null;
        }
      }
    });
  }

  static clearSelection() {
    document
      .querySelectorAll(".tile.selected-swap")
      .forEach((el) => el.classList.remove("selected-swap"));
  }

  static async swapAndCheck(pos1, pos2) {
    SoundManager.playSwap();
    const t1 = this.grid[pos1.y][pos1.x];
    const t2 = this.grid[pos2.y][pos2.x];
    this.grid[pos1.y][pos1.x] = t2;
    this.grid[pos2.y][pos2.x] = t1;
    this.render();
    const allMatches = this.findMatches();
    const activeCharIdx = game.battleSystem.currentEntity
      ? game.battleSystem.currentEntity.position
      : -1;
    const validActiveMatches = allMatches.filter((c) => {
      const tile = this.grid[c.y][c.x];
      return tile && tile.charIndex === activeCharIdx;
    });

    if (validActiveMatches.length > 0) {
      await new Promise((r) => setTimeout(r, 200));
      const sampleCoord = validActiveMatches[0];
      const matchSample = this.grid[sampleCoord.y][sampleCoord.x];
      this.handleElimination(allMatches, matchSample.type, true);
    } else {
      await new Promise((r) => setTimeout(r, 200));
      this.grid[pos1.y][pos1.x] = t1;
      this.grid[pos2.y][pos2.x] = t2;
      SoundManager.playSwap();
      this.render();
    }
  }

  static findMatches() {
    let matchedSet = new Set();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width - 2; x++) {
        const t1 = this.grid[y][x],
          t2 = this.grid[y][x + 1],
          t3 = this.grid[y][x + 2];
        if (
          t1 &&
          t2 &&
          t3 &&
          t1.charIndex === t2.charIndex &&
          t2.charIndex === t3.charIndex &&
          t1.type === t2.type &&
          t2.type === t3.type
        ) {
          matchedSet.add(`${x},${y}`);
          matchedSet.add(`${x + 1},${y}`);
          matchedSet.add(`${x + 2},${y}`);
        }
      }
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height - 2; y++) {
        const t1 = this.grid[y][x],
          t2 = this.grid[y + 1][x],
          t3 = this.grid[y + 2][x];
        if (
          t1 &&
          t2 &&
          t3 &&
          t1.charIndex === t2.charIndex &&
          t2.charIndex === t3.charIndex &&
          t1.type === t2.type &&
          t2.type === t3.type
        ) {
          matchedSet.add(`${x},${y}`);
          matchedSet.add(`${x},${y + 1}`);
          matchedSet.add(`${x},${y + 2}`);
        }
      }
    }
    return Array.from(matchedSet).map((s) => {
      const [x, y] = s.split(",").map(Number);
      return { x, y };
    });
  }

  static async handleElimination(coords, actionType, isMatch3) {
    SoundManager.playMatch();
    const canvas = document.getElementById("grid-canvas");
    const promises = coords.map((c) => {
      const el = canvas.querySelector(
        `.tile[data-x="${c.x}"][data-y="${c.y}"]`,
      );
      if (el) {
        el.classList.add("eliminating");
        return new Promise((resolve) => setTimeout(resolve, 300));
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
    coords.forEach((c) => {
      this.grid[c.y][c.x] = null;
    });
    this.fillBoard();
    this.render();
    if (game.battleSystem.currentEntity)
      game.battleSystem.executePlayerSkill(
        game.battleSystem.currentEntity,
        actionType,
        coords.length,
        isMatch3,
      );
  }
}
