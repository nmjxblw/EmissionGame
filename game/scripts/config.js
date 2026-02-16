/**
 * Game Configuration
 * 游戏全局配置常量
 */
const CONFIG = {
  SCREEN_WIDTH: 540,
  SCREEN_HEIGHT: 960,
  GRID_SIZE: 10,
  STORAGE_KEY: "pixel_tactics_save_v1",
  MAX_SPEED: 100,
  MIN_SPEED: 1,
  BASE_AP_GOAL: 1000,
  LANGUAGE: "zh_cn",
  ELEMENTS: {
    FIRE: "fire",
    WATER: "water",
    LEAF: "leaf",
    LIGHT: "light",
    DARK: "dark",
    NONE: "none",
  },
  COLORS: {
    fire: "#ff4444",
    water: "#44aaff",
    leaf: "#88cc44",
    light: "#ffee66",
    dark: "#aa44cc",
    none: "#cccccc",
  },
  POSITIONS: {
    PLAYER: {
      ACTIVE: { left: "160px", bottom: "100px", zIndex: 50 },
    },
    ENEMY: {
      ACTIVE: { right: "160px", bottom: "100px", zIndex: 50 },
    },
  },
};
