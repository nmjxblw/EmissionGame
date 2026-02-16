/**
 * I18N Manager - 国际化管理器
 * 动态加载和管理多语言文本资源
 */
class I18NManager {
  constructor() {
    this.data = {};
    this.currentLang = "zh_cn";
    this.isLoaded = false;
  }

  /**
   * 加载 CSV 文件并解析
   */
  async load(csvPath = "./resources/i18n.csv") {
    try {
      const response = await fetch(csvPath);
      const csvText = await response.text();
      this.parseCSV(csvText);
      this.isLoaded = true;
      console.log("[I18N] CSV loaded successfully:", this.data);
    } catch (error) {
      console.error("[I18N] Failed to load CSV:", error);
      // 如果加载失败，使用空数据避免崩溃
      this.data = {};
      this.isLoaded = false;
    }
  }

  /**
   * 解析 CSV 文本
   * @param {string} csvText - CSV 文件内容
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      console.warn("[I18N] CSV file is empty or invalid");
      return;
    }

    // 解析表头
    const headers = this.parseCSVLine(lines[0]);
    // 假设格式: text_id, en_us, zh_cn, ...
    const textIdIndex = headers.indexOf("text_id");
    const langIndices = {};

    headers.forEach((header, index) => {
      if (header !== "text_id") {
        langIndices[header] = index;
      }
    });

    // 解析数据行
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length <= textIdIndex) continue;

      const textId = values[textIdIndex];
      if (!textId) continue;

      // 为每种语言创建映射
      Object.keys(langIndices).forEach((lang) => {
        if (!this.data[lang]) {
          this.data[lang] = {};
        }
        const index = langIndices[lang];
        this.data[lang][textId] = values[index] || textId;
      });
    }
  }

  /**
   * 解析 CSV 行（处理逗号分隔，支持引号）
   * @param {string} line - CSV 行
   * @returns {Array<string>} 解析后的值数组
   */
  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 转义的引号
          current += '"';
          i++;
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // 字段分隔符
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * 设置当前语言
   * @param {string} lang - 语言代码（如 'en_us', 'zh_cn'）
   */
  setLanguage(lang) {
    // 兼容旧的语言代码
    const langMap = {
      en: "en_us",
      zh: "zh_cn",
    };
    this.currentLang = langMap[lang] || lang;
    console.log("[I18N] Language set to:", this.currentLang);
  }

  /**
   * 获取文本
   * @param {string} textId - 文本 ID
   * @param {Object} params - 可选的格式化参数
   * @returns {string} 本地化后的文本
   */
  getText(textId, params = {}) {
    if (!this.isLoaded) {
      console.warn("[I18N] Data not loaded yet");
      return textId;
    }

    const langData = this.data[this.currentLang];
    if (!langData) {
      console.warn(`[I18N] Language '${this.currentLang}' not found`);
      return textId;
    }

    let text = langData[textId];
    if (!text) {
      console.warn(`[I18N] Text ID '${textId}' not found`);
      return textId;
    }

    // 动态格式化：支持 {key} 占位符
    Object.keys(params).forEach((key) => {
      const placeholder = `{${key}}`;
      text = text.replace(new RegExp(placeholder, "g"), params[key]);
    });

    return text;
  }

  /**
   * 获取所有支持的语言
   * @returns {Array<string>} 语言代码列表
   */
  getSupportedLanguages() {
    return Object.keys(this.data);
  }
}

// 创建全局实例
const i18n = new I18NManager();

// 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = { I18NManager, i18n };
}
