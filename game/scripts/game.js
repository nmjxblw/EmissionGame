/**
 * game.js - 游戏主入口文件
 * 初始化全局游戏对象并启动游戏
 */

const game = {
  battleSystem: new BattleSystem(),
  startBattle: (config) => {
    const levelId = document.getElementById("level-select").value;
    game.battleSystem.init(config, levelId);
  },
};

window.onload = async () => {
  // 初始化 i18n
  if (window.i18n) {
    await i18n.load();
    i18n.setLanguage(CONFIG.LANGUAGE);
  }

  // 加载游戏数据
  if (window.dataLoader) {
    console.log("[Game] Loading game data...");
    await dataLoader.loadAll();
    console.log("[Game] Game data loaded");
  }

  // 加载 SVG 资源
  if (window.assetLoader) {
    console.log("[Game] Loading SVG assets...");
    await assetLoader.injectSVG("gear-icon", "gear", "icons");

    // 预加载所有游戏资源
    await assetLoader.preloadSVGs([
      // 角色精灵
      { icon: "kai", category: "sprites" },
      { icon: "sosa", category: "sprites" },
      { icon: "aya", category: "sprites" },
      { icon: "boss", category: "sprites" },
      { icon: "minion", category: "sprites" },
      { icon: "default", category: "sprites" },
      // 图标
      { icon: "shield", category: "icons" },
      // 形状
      { icon: "triangle", category: "shapes" },
      { icon: "diamond", category: "shapes" },
      { icon: "circle", category: "shapes" },
      { icon: "hexagon", category: "shapes" },
      { icon: "square", category: "shapes" },
    ]);

    console.log("[Game] SVG assets loaded");
  }

  // 初始化准备界面
  PrepManager.init();
};
