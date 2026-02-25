/**
 * DOMBuilder - 动态构建所有游戏 UI 元素
 */
class DOMBuilder {
  /**
   * 构建所有游戏界面元素
   */
  static buildAll() {
    const container = document.getElementById("game-container");
    if (!container) {
      console.error("[DOMBuilder] game-container not found!");
      return;
    }

    // 清空容器
    container.innerHTML = "";

    // 按顺序构建所有 UI 组件
    container.appendChild(this.buildSettingsButton());
    container.appendChild(this.buildSettingsModal());
    container.appendChild(this.buildPrepScene());
    container.appendChild(this.buildLevelSelectScene());
    container.appendChild(this.buildBattleScene());
    container.appendChild(this.buildToast());

    console.log("[DOMBuilder] All UI elements built successfully");
  }

  /**
   * 创建设置按钮
   */
  static buildSettingsButton() {
    const btn = document.createElement("div");
    btn.id = "settings-btn";
    btn.setAttribute("data-i18n-title", "settings_tooltip");

    const gearIcon = document.createElement("div");
    gearIcon.id = "gear-icon";
    btn.appendChild(gearIcon);

    return btn;
  }

  /**
   * 创建设置模态框
   */
  static buildSettingsModal() {
    const modal = document.createElement("div");
    modal.id = "settings-modal";

    const content = document.createElement("div");
    content.className = "modal-content";

    // 标题
    const title = document.createElement("h3");
    title.setAttribute("data-i18n", "settings_title");
    title.textContent = "SETTINGS";
    content.appendChild(title);

    // 音量控制
    const volRow = document.createElement("div");
    volRow.className = "modal-row";
    const volLabel = document.createElement("span");
    volLabel.setAttribute("data-i18n", "volume");
    volLabel.textContent = "Volume";
    const volSlider = document.createElement("input");
    volSlider.type = "range";
    volSlider.id = "vol-slider";
    volSlider.min = "0";
    volSlider.max = "100";
    volSlider.value = "50";
    volRow.appendChild(volLabel);
    volRow.appendChild(volSlider);
    content.appendChild(volRow);

    // 语言切换
    const langRow = document.createElement("div");
    langRow.className = "modal-row";
    const langLabel = document.createElement("span");
    langLabel.setAttribute("data-i18n", "language");
    langLabel.textContent = "Language";
    const langBtn = document.createElement("button");
    langBtn.id = "lang-switch-btn";
    langBtn.className = "modal-btn";
    langBtn.style.width = "auto";
    langBtn.textContent = "🇺🇸 / 🇨🇳";
    langRow.appendChild(langLabel);
    langRow.appendChild(langBtn);
    content.appendChild(langRow);

    // 分隔线
    const hr = document.createElement("hr");
    hr.style.borderColor = "#444";
    hr.style.width = "100%";
    hr.style.margin = "10px 0";
    content.appendChild(hr);

    // 战斗控制（初始隐藏）
    const battleControls = document.createElement("div");
    battleControls.id = "battle-controls";
    battleControls.style.display = "none";
    battleControls.style.width = "100%";

    const pausedText = document.createElement("div");
    pausedText.style.fontSize = "12px";
    pausedText.style.color = "#aaa";
    pausedText.style.marginBottom = "5px";
    pausedText.setAttribute("data-i18n", "game_paused");
    pausedText.textContent = "GAME PAUSED";
    battleControls.appendChild(pausedText);

    const surrenderBtn = document.createElement("button");
    surrenderBtn.id = "btn-surrender";
    surrenderBtn.className = "modal-btn danger";
    surrenderBtn.setAttribute("data-i18n", "btn_surrender");
    surrenderBtn.textContent = "SURRENDER";
    battleControls.appendChild(surrenderBtn);

    content.appendChild(battleControls);

    // 恢复按钮
    const resumeBtn = document.createElement("button");
    resumeBtn.id = "btn-resume";
    resumeBtn.className = "modal-btn";
    resumeBtn.setAttribute("data-i18n", "btn_resume");
    resumeBtn.textContent = "RESUME";
    content.appendChild(resumeBtn);

    modal.appendChild(content);
    return modal;
  }

  /**
   * 创建准备场景
   */
  static buildPrepScene() {
    const scene = document.createElement("div");
    scene.id = "prep-scene";
    scene.className = "scene active";

    // 标题
    const title = document.createElement("h2");
    title.style.textAlign = "center";
    title.style.color = "gold";
    title.setAttribute("data-i18n", "prep_title");
    title.textContent = "TEAM PREPARATION";
    scene.appendChild(title);

    // 队伍编辑面板
    const teamPanel = document.createElement("div");
    teamPanel.className = "panel-box";

    const teamTitle = document.createElement("h3");
    teamTitle.setAttribute("data-i18n", "deploy_unit");
    teamTitle.textContent = "Deploy Unit (Pick 3)";
    teamPanel.appendChild(teamTitle);

    const teamSlots = document.createElement("div");
    teamSlots.id = "team-slots";
    teamSlots.className = "char-select-row";
    teamPanel.appendChild(teamSlots);

    const poolHint = document.createElement("div");
    poolHint.style.fontSize = "10px";
    poolHint.style.color = "#aaa";
    poolHint.style.marginBottom = "5px";
    poolHint.setAttribute("data-i18n", "roster_pool_hint");
    poolHint.textContent = "Roster Pool (Click to Add):";
    teamPanel.appendChild(poolHint);

    const rosterPool = document.createElement("div");
    rosterPool.id = "roster-pool";
    rosterPool.style.display = "flex";
    rosterPool.style.flexWrap = "wrap";
    rosterPool.style.gap = "5px";
    teamPanel.appendChild(rosterPool);

    scene.appendChild(teamPanel);

    // 技能选择面板
    const deckPanel = document.createElement("div");
    deckPanel.className = "panel-box";

    const deckTitle = document.createElement("h3");
    deckTitle.setAttribute("data-i18n", "action_matrix");
    deckTitle.textContent = "Action Matrix (Select 8)";
    deckPanel.appendChild(deckTitle);

    const ruleHint = document.createElement("div");
    ruleHint.style.fontSize = "10px";
    ruleHint.style.color = "#aaa";
    ruleHint.style.marginBottom = "5px";
    ruleHint.setAttribute("data-i18n", "rule_hint");
    ruleHint.textContent =
      "Rule: 8 Unique actions. Must include >=1 from each deployed unit.";
    deckPanel.appendChild(ruleHint);

    const deckUI = document.createElement("div");
    deckUI.id = "action-deck-ui";
    deckUI.className = "action-pool-grid";
    deckPanel.appendChild(deckUI);

    const deckCount = document.createElement("div");
    deckCount.style.marginTop = "5px";
    deckCount.style.textAlign = "right";

    const selectedLabel = document.createElement("span");
    selectedLabel.setAttribute("data-i18n", "selected");
    selectedLabel.textContent = "Selected:";
    const countSpan = document.createElement("span");
    countSpan.id = "deck-count";
    countSpan.textContent = "0";
    deckCount.appendChild(selectedLabel);
    deckCount.appendChild(document.createTextNode(" "));
    deckCount.appendChild(countSpan);
    deckCount.appendChild(document.createTextNode("/8"));

    deckPanel.appendChild(deckCount);
    scene.appendChild(deckPanel);

    // 进入关卡选择按钮
    const toLevelBtn = document.createElement("button");
    toLevelBtn.id = "btn-to-level";
    toLevelBtn.className = "pixel-btn";
    toLevelBtn.disabled = true;
    toLevelBtn.setAttribute("data-i18n", "btn_to_level");
    toLevelBtn.textContent = "TO LEVEL SELECT";
    scene.appendChild(toLevelBtn);

    return scene;
  }

  /**
   * 创建关卡选择场景
   */
  static buildLevelSelectScene() {
    const scene = document.createElement("div");
    scene.id = "level-select-scene";
    scene.className = "scene";

    // 标题
    const title = document.createElement("h2");
    title.style.textAlign = "center";
    title.style.color = "gold";
    title.setAttribute("data-i18n", "title_level_select");
    title.textContent = "SELECT LEVEL";
    scene.appendChild(title);

    // 关卡选择面板
    const panel = document.createElement("div");
    panel.className = "panel-box";

    const panelTitle = document.createElement("h3");
    panelTitle.setAttribute("data-i18n", "target_level");
    panelTitle.textContent = "Target Level";
    panel.appendChild(panelTitle);

    const select = document.createElement("select");
    select.id = "level-select";
    select.style.width = "100%";
    select.style.padding = "5px";
    select.style.background = "#333";
    select.style.color = "#fff";

    const option1 = document.createElement("option");
    option1.value = "boss_doll";
    option1.setAttribute("data-i18n", "level_boss_1");
    option1.textContent = "Target: Boss Doll (Lv.1)";
    select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = "boss_doll_hard";
    option2.setAttribute("data-i18n", "level_boss_5");
    option2.textContent = "Target: Boss Doll (Lv.5)";
    select.appendChild(option2);

    panel.appendChild(select);
    scene.appendChild(panel);

    // 按钮容器
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "10px";
    btnContainer.style.justifyContent = "center";
    btnContainer.style.marginTop = "auto";
    btnContainer.style.marginBottom = "50px";

    const backBtn = document.createElement("button");
    backBtn.id = "btn-back-prep";
    backBtn.className = "pixel-btn";
    backBtn.setAttribute("data-i18n", "btn_back_prep");
    backBtn.textContent = "BACK TO PREP";
    btnContainer.appendChild(backBtn);

    const startBtn = document.createElement("button");
    startBtn.id = "btn-start-battle";
    startBtn.className = "pixel-btn";
    startBtn.setAttribute("data-i18n", "btn_engage");
    startBtn.textContent = "ENGAGE";
    btnContainer.appendChild(startBtn);

    scene.appendChild(btnContainer);

    return scene;
  }

  /**
   * 创建战斗场景
   */
  static buildBattleScene() {
    const scene = document.createElement("div");
    scene.id = "battle-scene";
    scene.className = "scene";

    // 战场区域
    const battlefield = document.createElement("div");
    battlefield.id = "battlefield";

    // 精灵图层
    const spriteLayer = document.createElement("div");
    spriteLayer.id = "sprite-layer";

    // 创建6个精灵容器（3个玩家 + 3个敌人）
    for (let i = 1; i <= 3; i++) {
      const pContainer = document.createElement("div");
      pContainer.id = `p-pos-${i}`;
      pContainer.className = "sprite-container";
      spriteLayer.appendChild(pContainer);
    }
    for (let i = 1; i <= 3; i++) {
      const eContainer = document.createElement("div");
      eContainer.id = `e-pos-${i}`;
      eContainer.className = "sprite-container";
      spriteLayer.appendChild(eContainer);
    }

    battlefield.appendChild(spriteLayer);

    // 时间轴容器
    const timelineContainer = document.createElement("div");
    timelineContainer.id = "timeline-container";

    const timelineLabel = document.createElement("div");
    timelineLabel.className = "timeline-label";
    timelineLabel.setAttribute("data-i18n", "timeline_next");
    timelineLabel.textContent = "NEXT:";
    timelineContainer.appendChild(timelineLabel);

    const timelineQueue = document.createElement("div");
    timelineQueue.className = "timeline-queue";
    timelineContainer.appendChild(timelineQueue);

    battlefield.appendChild(timelineContainer);
    scene.appendChild(battlefield);

    // 棋盘区域
    const boardArea = document.createElement("div");
    boardArea.id = "board-area";

    const gridCanvas = document.createElement("div");
    gridCanvas.id = "grid-canvas";
    boardArea.appendChild(gridCanvas);

    scene.appendChild(boardArea);

    // 操作提示
    const actionHint = document.createElement("div");
    actionHint.id = "action-hint";
    actionHint.setAttribute("data-i18n", "hint_action");
    actionHint.textContent = "Double Click: Single | Match 3: Triple Skill";
    scene.appendChild(actionHint);

    return scene;
  }

  /**
   * 创建 Toast 提示元素
   */
  static buildToast() {
    const toast = document.createElement("div");
    toast.id = "toast";
    return toast;
  }
}
