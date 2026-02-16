/**
 * AssetLoader - 资源加载管理器
 * 用于动态加载 SVG 图标和其他静态资源
 */
class AssetLoader {
  static svgCache = {};
  static loadingPromises = {};

  /**
   * 加载 SVG 文件内容
   * @param {string} iconName - SVG 文件名（不含扩展名）
   * @param {string} category - 资源分类（如 'icons'）
   * @returns {Promise<string>} SVG 内容字符串
   */
  static async loadSVG(iconName, category = "icons") {
    const key = `${category}/${iconName}`;

    // 检查缓存
    if (this.svgCache[key]) {
      return this.svgCache[key];
    }

    // 检查是否正在加载
    if (this.loadingPromises[key]) {
      return this.loadingPromises[key];
    }

    // 创建加载 Promise
    const promise = (async () => {
      try {
        const response = await fetch(`assets/${category}/${iconName}.svg`);
        if (!response.ok) {
          throw new Error(
            `Failed to load SVG: ${iconName} (${response.status})`,
          );
        }
        const svgText = await response.text();
        this.svgCache[key] = svgText;
        return svgText;
      } catch (error) {
        console.error(`[AssetLoader] Error loading SVG ${key}:`, error);
        throw error;
      } finally {
        delete this.loadingPromises[key];
      }
    })();

    this.loadingPromises[key] = promise;
    return promise;
  }

  /**
   * 将 SVG 内容注入到指定的 DOM 元素
   * @param {string} elementId - 目标元素的 ID
   * @param {string} iconName - SVG 文件名
   * @param {string} category - 资源分类
   */
  static async injectSVG(elementId, iconName, category = "icons") {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`[AssetLoader] Element not found: ${elementId}`);
      return;
    }

    try {
      const svgContent = await this.loadSVG(iconName, category);
      element.innerHTML = svgContent;
    } catch (error) {
      console.error(
        `[AssetLoader] Failed to inject SVG into ${elementId}:`,
        error,
      );
    }
  }

  /**
   * 批量加载多个 SVG
   * @param {Array<{id: string, icon: string, category?: string}>} items
   * @returns {Promise<void>}
   */
  static async loadMultipleSVG(items) {
    const promises = items.map((item) =>
      this.injectSVG(item.id, item.icon, item.category || "icons"),
    );
    await Promise.all(promises);
  }

  /**
   * 清除缓存
   */
  static clearCache() {
    this.svgCache = {};
    this.loadingPromises = {};
  }

  /**
   * 获取已缓存的资源数量
   */
  static getCacheSize() {
    return Object.keys(this.svgCache).length;
  }

  /**
   * 获取 SVG 内容（同步，仅限已缓存）
   * @param {string} iconName - SVG 文件名
   * @param {string} category - 资源分类
   * @returns {string|null} SVG 内容或 null
   */
  static getSVGSync(iconName, category = "icons") {
    const key = `${category}/${iconName}`;
    return this.svgCache[key] || null;
  }

  /**
   * 构建带属性的 SVG 字符串
   * @param {string} svgContent - SVG 内容
   * @param {Object} attributes - 要添加的属性 {fill, stroke, etc.}
   * @returns {string} 处理后的 SVG 字符串
   */
  static buildSVGWithAttributes(svgContent, attributes = {}) {
    if (!svgContent) return "";

    // 解析 SVG 标签
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svg = doc.querySelector("svg");

    if (!svg) return svgContent;

    // 应用属性到 SVG 根元素或第一个路径
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "viewBox" || key === "width" || key === "height") {
        svg.setAttribute(key, value);
      } else {
        // 应用到第一个形状元素
        const shape =
          svg.querySelector("path") ||
          svg.querySelector("circle") ||
          svg.querySelector("rect");
        if (shape) {
          shape.setAttribute(key, value);
        }
      }
    });

    return svg.outerHTML;
  }

  /**
   * 批量预加载 SVG 资源
   * @param {Array<{icon: string, category?: string}>} items
   * @returns {Promise<void>}
   */
  static async preloadSVGs(items) {
    const promises = items.map((item) =>
      this.loadSVG(item.icon, item.category || "icons"),
    );
    await Promise.all(promises);
    console.log(`[AssetLoader] Preloaded ${items.length} SVG assets`);
  }
}

// 暴露到全局
window.assetLoader = AssetLoader;
