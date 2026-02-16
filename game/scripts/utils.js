/**
 * Utility Functions
 * 游戏工具函数集合
 */
class Utils {
  static uuid() {
    return Math.random().toString(36).substr(2, 9);
  }

  static getText(keyOrObj, params = {}) {
    if (typeof keyOrObj === "string") {
      // 使用 i18n 管理器获取文本
      return window.i18n ? i18n.getText(keyOrObj, params) : keyOrObj;
    } else if (typeof keyOrObj === "object" && keyOrObj !== null) {
      // 兼容旧的对象格式（如角色名称）
      const langMap = { zh_cn: "zh", en_us: "en" };
      const simpleLang = langMap[CONFIG.LANGUAGE] || "zh";
      return keyOrObj[simpleLang] || keyOrObj["en"] || "?";
    }
    return keyOrObj;
  }

  static getTileSVG(type, element, isHighlighted) {
    const color = CONFIG.COLORS[element] || "#fff";
    const opacity = isHighlighted ? 1.0 : 0.6;
    const strokeColor = color;
    const strokeWidth = 8;
    const glowFilter = `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color})`;

    // 获取形状名称
    const shapeNames = ["triangle", "diamond", "circle", "hexagon", "square"];
    const shapeName = shapeNames[parseInt(type) - 1] || "square";

    // 从缓存获取形状 SVG
    let shapeSVG = assetLoader.getSVGSync(shapeName, "shapes");

    if (shapeSVG) {
      // 解析并应用属性
      const parser = new DOMParser();
      const doc = parser.parseFromString(shapeSVG, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (svg) {
        // 应用颜色到形状
        const shape =
          svg.querySelector("path") ||
          svg.querySelector("circle") ||
          svg.querySelector("rect");
        if (shape) {
          shape.setAttribute("fill", color);
          shape.setAttribute("stroke", strokeColor);
          shape.setAttribute("stroke-width", strokeWidth);
        }

        // 添加罗马数字文本
        const roman = ["I", "II", "III", "IV"][parseInt(type) - 1] || "?";
        const text = doc.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "50");
        text.setAttribute("y", "60");
        text.setAttribute("font-size", "30");
        text.setAttribute("fill", "white");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("stroke", "none");
        text.style.textShadow = "0 0 3px #000";
        text.textContent = roman;
        svg.appendChild(text);

        // 设置根属性
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.opacity = opacity;
        svg.style.filter = glowFilter;
        svg.style.overflow = "visible";

        return svg.outerHTML;
      }
    }

    // 后备方案：使用原始硬编码
    let shape = "";
    switch (parseInt(type)) {
      case 1:
        shape = `<path d="M50 15 L85 75 L15 75 Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
        break;
      case 2:
        shape = `<path d="M50 10 L90 50 L50 90 L10 50 Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
        break;
      case 3:
        shape = `<circle cx="50" cy="50" r="35" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
        break;
      case 4:
        shape = `<path d="M30 10 L70 10 L90 30 L90 70 L70 90 L30 90 L10 70 L10 30 Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
        break;
      default:
        shape = `<rect x="20" y="20" width="60" height="60" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" rx="10" ry="10"/>`;
    }
    const roman = ["I", "II", "III", "IV"][type - 1] || "?";
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" style="opacity:${opacity}; filter: ${glowFilter}; overflow: visible;">${shape}<text x="50" y="60" font-size="30" fill="white" text-anchor="middle" font-weight="bold" stroke="none" style="text-shadow: 0 0 3px #000;">${roman}</text></svg>`;
  }

  static calcDamage(
    attacker,
    target,
    skillPower,
    skillType,
    isTrueDmg,
    isShieldDmg,
  ) {
    if (!attacker || !target) return 0;
    let atk = attacker.temp.atk,
      def = target.temp.def;
    let atkMod = 1 + (attacker.temp.atkBuff || 0),
      defMod = 1 + (target.temp.defBuff || 0);
    let totalDmgMod = 1 + (attacker.temp.dmgBuff || 0);
    let dmgFactor = 5;
    let numerator = atk * atkMod * dmgFactor;
    let denominator = def * defMod + dmgFactor;
    if (denominator === 0) denominator = 1;
    let rawDmg = Math.floor((numerator / denominator) * totalDmgMod);
    let maxLimit = Math.floor((1 / 5) * target.maxHp);
    let finalDmg = Math.max(1, Math.min(maxLimit, rawDmg));
    if (isShieldDmg) return { hpDmg: 0, shieldDmg: finalDmg };
    if (isTrueDmg) return { hpDmg: finalDmg, shieldDmg: 0 };
    else {
      let shield = target.temp.shield || 0;
      let shieldDmg = Math.min(shield, finalDmg);
      let hpDmg = finalDmg - shieldDmg;
      return { hpDmg, shieldDmg };
    }
  }
}
