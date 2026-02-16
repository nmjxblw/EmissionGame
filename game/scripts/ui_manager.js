/**
 * UIManager - 统一的 UI 管理类，处理所有战斗场景的 UI 渲染和动画
 */
class UIManager {
  static timelineQueue = document.querySelector(
    "#timeline-container .timeline-queue",
  );
  static prepScene = document.getElementById("prep-scene");
  static levelSelectScene = document.getElementById("level-select-scene");
  static battleScene = document.getElementById("battle-scene");
  static toast = document.getElementById("toast");

  static initBattle(pTeam, eTeam) {
    this.prepScene.classList.remove("active");
    this.levelSelectScene.classList.remove("active");
    this.battleScene.classList.add("active");
    ["p-pos-1", "p-pos-2", "p-pos-3", "e-pos-1", "e-pos-2", "e-pos-3"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
      },
    );
    pTeam.forEach((p) => this.createHUD(p, p.position, true));
    eTeam.forEach((e) => this.createHUD(e, e.position, false));
    this.updateAll(pTeam.concat(eTeam));
  }
  static createHUD(entity, index, isPlayer) {
    const posId = isPlayer ? `p-pos-${index + 1}` : `e-pos-${index + 1}`;
    const container = document.getElementById(posId);
    const sprite = document.createElement("div");
    sprite.className = "sprite";
    sprite.innerHTML = this.getCharSpriteSVG(entity.templateId, entity.element);
    container.appendChild(sprite);
    const hud = document.createElement("div");
    hud.className = "char-hud";
    hud.id = `hud-${entity.id}`;
    hud.innerHTML = `<div class="hud-header"><div class="break-gauge" id="break-${
      entity.id
    }"></div><div class="char-slot-id">#${
      index + 1
    }</div><div class="char-name">${entity.name.substr(
      0,
      8,
    )}</div></div><div class="hp-bar-container"><div class="hp-bar-fill" id="hp-fill-${
      entity.id
    }"></div><div class="shield-bar-overlay" id="shield-fill-${
      entity.id
    }"></div><div class="hp-text" id="hp-val-${entity.id}">${
      entity.currentHp
    }/${entity.maxHp}</div></div>`;
    container.appendChild(hud);
    this.updateBreaks(entity);
  }
  static updateCharacterPositions(activeEntity, allEntities) {
    const P_POS = CONFIG.POSITIONS.PLAYER,
      E_POS = CONFIG.POSITIONS.ENEMY;
    allEntities.forEach((e) => {
      if (e.isFainted) return;
      const isCurrent = e.id === activeEntity.id;
      if (e.isPlayer) {
        const container = document.getElementById(`p-pos-${e.position + 1}`);
        if (container) {
          if (isCurrent) {
            container.style.left = P_POS.ACTIVE.left;
            container.style.bottom = P_POS.ACTIVE.bottom;
            container.style.zIndex = P_POS.ACTIVE.zIndex;
          } else {
            container.style.left = "";
            container.style.bottom = "";
            container.style.zIndex = "";
          }
        }
      } else {
        const container = document.getElementById(`e-pos-${e.position + 1}`);
        if (container) {
          if (isCurrent) {
            container.style.right = E_POS.ACTIVE.right;
            container.style.bottom = E_POS.ACTIVE.bottom;
            container.style.zIndex = E_POS.ACTIVE.zIndex;
          } else {
            container.style.right = "";
            container.style.bottom = "";
            container.style.zIndex = "";
          }
        }
      }
    });
  }
  static getCharSpriteSVG(templateId, element) {
    const color = CONFIG.COLORS[element] || "#ccc";

    // 确定使用哪个精灵模板
    let spriteTemplate = templateId;
    if (templateId.includes("boss")) {
      spriteTemplate = "boss";
    } else if (templateId.includes("minion")) {
      spriteTemplate = "minion";
    } else if (!["kai", "sosa", "aya"].includes(templateId)) {
      spriteTemplate = "default";
    }

    // 从缓存获取 SVG
    let svgContent = assetLoader.getSVGSync(spriteTemplate, "sprites");

    if (!svgContent) {
      console.warn(`[UIManager] Sprite not found: ${spriteTemplate}`);
      svgContent = assetLoader.getSVGSync("default", "sprites") || "";
    }

    // 解析并应用颜色
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svg = doc.querySelector("svg");

    if (svg) {
      // 应用元素颜色到 Body 部分（没有明确 fill 的元素）
      svg.querySelectorAll("path, rect, circle").forEach((el) => {
        if (
          !el.hasAttribute("fill") ||
          el.getAttribute("fill") === "" ||
          el.getAttribute("fill") === "currentColor"
        ) {
          el.setAttribute("fill", color);
        }
      });

      // 设置 SVG 根属性
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("preserveAspectRatio", "xMidYMax");

      return svg.outerHTML;
    }

    return svgContent;
  }
  static updateBreaks(entity) {
    const div = document.getElementById(`break-${entity.id}`);
    if (!div) return;
    div.innerHTML = "";
    Object.keys(entity.breaks).forEach((type) => {
      const b = entity.breaks[type];
      const icon = document.createElement("div");
      icon.className = "break-icon";
      icon.style.color = CONFIG.COLORS[type];

      // 获取盾牌 SVG
      let shieldSVG = assetLoader.getSVGSync("shield", "icons");
      if (shieldSVG) {
        // 应用颜色
        shieldSVG = assetLoader.buildSVGWithAttributes(shieldSVG, {
          fill: CONFIG.COLORS[type],
          stroke: "#fff",
          "stroke-width": "1",
        });
      } else {
        // 后备方案
        shieldSVG = `<svg viewBox="0 0 24 24" fill="${CONFIG.COLORS[type]}" stroke="#fff" stroke-width="1"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`;
      }

      icon.innerHTML = `${shieldSVG}<span class="break-count">${b.count}</span>`;
      div.appendChild(icon);
    });
  }
  static highlightTurn(entity) {
    document
      .querySelectorAll(".char-hud")
      .forEach((el) => el.classList.remove("active-turn"));
    const hud = document.getElementById(`hud-${entity.id}`);
    if (hud) hud.classList.add("active-turn");
  }
  static playAttackAnim(entity) {
    const hud = document.getElementById(`hud-${entity.id}`);
    if (!hud) return;
    const container = hud.parentElement;
    const sprite = container.querySelector(".sprite");
    if (sprite) {
      sprite.classList.remove("anim-attack-player", "anim-attack-enemy");
      void sprite.offsetWidth;
      if (entity.isPlayer) sprite.classList.add("anim-attack-player");
      else sprite.classList.add("anim-attack-enemy");
    }
  }
  static playHitAnim(entity, isHeavy) {
    const hud = document.getElementById(`hud-${entity.id}`);
    if (!hud) return;
    const container = hud.parentElement;
    const sprite = container.querySelector(".sprite");
    if (sprite) {
      sprite.classList.remove("anim-hit-player", "anim-hit-enemy");
      void sprite.offsetWidth;
      if (entity.isPlayer) sprite.classList.add("anim-hit-player");
      else sprite.classList.add("anim-hit-enemy");
    }
    if (isHeavy) {
      const field = document.getElementById("battlefield");
      field.classList.remove("camera-shake");
      void field.offsetWidth;
      field.classList.add("camera-shake");
    }
  }
  static playDeathAnim(entity) {
    const hud = document.getElementById(`hud-${entity.id}`);
    if (!hud) return;
    const container = hud.parentElement;
    const sprite = container.querySelector(".sprite");
    if (sprite) sprite.classList.add("anim-death");
  }
  static reviveEntity(entity) {
    const hud = document.getElementById(`hud-${entity.id}`);
    if (!hud) return;
    const container = hud.parentElement;
    const sprite = container.querySelector(".sprite");
    if (sprite) sprite.classList.remove("anim-death");
  }
  static updateAll(entities) {
    entities.forEach((e) => this.updateEntityStatus(e));
  }
  static updateEntityStatus(entity) {
    const hpFill = document.getElementById(`hp-fill-${entity.id}`);
    const hpVal = document.getElementById(`hp-val-${entity.id}`);
    const hud = document.getElementById(`hud-${entity.id}`);
    const shieldFill = document.getElementById(`shield-fill-${entity.id}`);
    if (!hpFill) return;
    const hpPct = Math.max(0, Math.min(1, entity.currentHp / entity.maxHp));
    const g = Math.floor(255 * hpPct);
    const b = Math.floor(255 * hpPct);
    hpFill.style.width = `${hpPct * 100}%`;
    hpFill.style.backgroundColor = `rgb(255, ${g}, ${b})`;
    hpVal.innerText = `${entity.currentHp}/${entity.maxHp}`;
    const shieldPct = Math.min(100, (entity.temp.shield / entity.maxHp) * 100);
    shieldFill.style.width = `${shieldPct}%`;
    if (entity.isFainted) hud.classList.add("fainted");
    else hud.classList.remove("fainted");
    if (
      entity.currentHp <= entity.maxHp * 0.1 &&
      !entity.isFainted &&
      entity.currentHp > 0
    )
      hud.classList.add("low-hp");
    else hud.classList.remove("low-hp");
    this.updateBreaks(entity);
  }
  static updateActionOrder(orderList, animate = false) {
    const container = document.querySelector(
      "#timeline-container .timeline-queue",
    );
    if (!container) return;
    if (animate) {
      const firstChild = container.firstElementChild;
      if (firstChild) {
        firstChild.classList.add("exit");
        const newItemData = orderList[orderList.length - 1];
        if (newItemData) {
          const newIcon = this.createOrderIcon(newItemData, orderList.length);
          newIcon.classList.add("enter");
          container.appendChild(newIcon);
        }
        setTimeout(() => {
          this.renderOrderList(container, orderList);
        }, 500);
      } else this.renderOrderList(container, orderList);
    } else this.renderOrderList(container, orderList);
  }
  static renderOrderList(container, orderList) {
    container.innerHTML = "";
    orderList.forEach((item, index) => {
      const icon = this.createOrderIcon(item, index + 1);
      container.appendChild(icon);
    });
  }
  static createOrderIcon(item, index) {
    const icon = document.createElement("div");
    icon.className = "order-icon";
    if (item.isCurrent) icon.classList.add("current");
    icon.style.borderColor = item.isPlayer ? "#4ade80" : "#ef4444";
    icon.innerText = item.name.charAt(0);
    const badge = document.createElement("div");
    badge.className = "order-badge";
    badge.innerText = index;
    icon.appendChild(badge);
    return icon;
  }
  static showDamage(posIndex, isPlayer, hpDmg, shieldDmg) {
    const posId = isPlayer ? `p-pos-${posIndex + 1}` : `e-pos-${posIndex + 1}`;
    const container = document.getElementById(posId);
    if (shieldDmg > 0)
      this.createFloatText(container, `-${shieldDmg}`, "#60a5fa", -20);
    if (hpDmg > 0)
      setTimeout(() => {
        this.createFloatText(container, `-${hpDmg}`, "#ef4444", 0);
      }, 200);
    else if (shieldDmg === 0 && hpDmg === 0)
      this.createFloatText(container, Utils.getText("block"), "#ccc", 0);
  }
  static showFloatText(posIndex, isPlayer, text, color) {
    const posId = isPlayer ? `p-pos-${posIndex + 1}` : `e-pos-${posIndex + 1}`;
    const container = document.getElementById(posId);
    if (container) this.createFloatText(container, text, color, -30);
  }
  static createFloatText(parent, text, color, yOffset) {
    const el = document.createElement("div");
    el.className = "pop-text";
    el.innerText = text;
    el.style.color = color;
    el.style.top = yOffset + "px";
    parent.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  static log(msg) {
    console.log(`[BATTLE] ${msg}`);
    const hint = document.getElementById("action-hint");
    if (hint) hint.innerText = msg;
  }
  static showToast(msg, persist = false) {
    this.toast.innerText = msg;
    this.toast.style.display = "block";
    if (!persist)
      setTimeout(() => {
        this.toast.style.display = "none";
      }, 2000);
  }
  static switchScene(sceneName) {
    document
      .querySelectorAll(".scene")
      .forEach((el) => el.classList.remove("active"));
    if (sceneName === "prep") this.prepScene.classList.add("active");
    else if (sceneName === "levelSelect")
      this.levelSelectScene.classList.add("active");
    else if (sceneName === "battle") this.battleScene.classList.add("active");
  }
}
