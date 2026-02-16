/**
 * LangManager - 语言切换管理器
 */
class LangManager {
  static toggle() {
    CONFIG.LANGUAGE = CONFIG.LANGUAGE === "zh_cn" ? "en_us" : "zh_cn";
    if (window.i18n) {
      i18n.setLanguage(CONFIG.LANGUAGE);
    }
    this.apply();
    PrepManager.renderRosterPool();
    PrepManager.renderRoster();
    PrepManager.renderDeckBuilder();
  }
  static apply() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.innerText = Utils.getText(key);
    });
    // 处理 title 属性的国际化
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      el.title = Utils.getText(key);
    });
  }
}
