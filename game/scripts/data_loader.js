/**
 * Data Loader - 游戏数据加载器
 * 从CSV文件加载并反序列化角色、技能、敌人数据
 */
class DataLoader {
  constructor() {
    this.skills = new Map(); // skill_id -> skill对象
    this.characters = new Map(); // character_code -> character对象
    this.enemies = new Map(); // enemy_code -> enemy对象
    this.isLoaded = false;
  }

  /**
   * 加载所有游戏数据
   */
  async loadAll() {
    try {
      console.log("[DataLoader] Loading game data...");

      // 并行加载所有CSV文件
      const [
        skillsData,
        charactersData,
        characterBreaksData,
        enemiesData,
        enemyBreaksData,
      ] = await Promise.all([
        this.loadCSV("./resources/skills.csv"),
        this.loadCSV("./resources/characters.csv"),
        this.loadCSV("./resources/character_breaks.csv"),
        this.loadCSV("./resources/enemies.csv"),
        this.loadCSV("./resources/enemy_breaks.csv"),
      ]);

      // 解析技能数据
      this.parseSkills(skillsData);

      // 解析角色数据
      this.parseCharacters(charactersData, characterBreaksData);

      // 解析敌人数据
      this.parseEnemies(enemiesData, enemyBreaksData);

      this.isLoaded = true;
      console.log("[DataLoader] All data loaded successfully");
      console.log(`  - Skills: ${this.skills.size}`);
      console.log(`  - Characters: ${this.characters.size}`);
      console.log(`  - Enemies: ${this.enemies.size}`);
    } catch (error) {
      console.error("[DataLoader] Failed to load data:", error);
      this.isLoaded = false;
      throw error;
    }
  }

  /**
   * 加载CSV文件
   */
  async loadCSV(path) {
    const response = await fetch(path);
    const text = await response.text();
    return this.parseCSV(text);
  }

  /**
   * 解析CSV文本为数组
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      return [];
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  }

  /**
   * 解析CSV行（处理引号）
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
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
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
   * 解析技能数据
   */
  parseSkills(rows) {
    rows.forEach((row) => {
      const skillId = parseInt(row.skill_id);
      this.skills.set(skillId, {
        id: skillId,
        name: {
          en: row.name_en,
          zh: row.name_zh,
        },
        type: row.type,
        desc: {
          en: row.desc_en,
          zh: row.desc_zh,
        },
      });
    });
  }

  /**
   * 解析角色数据
   */
  parseCharacters(charRows, breakRows) {
    charRows.forEach((row) => {
      const charId = parseInt(row.character_id);
      const charCode = row.character_code;

      // 解析技能列表
      const skillIds = row.skills.split(",").map((id) => parseInt(id.trim()));

      // 构建actions对象（保持原有结构）
      const actions = {};
      skillIds.forEach((skillId, index) => {
        const skill = this.skills.get(skillId);
        if (skill) {
          actions[index + 1] = {
            name: skill.name,
            type: skill.type,
            desc: skill.desc,
          };
        }
      });

      // 解析破盾数据
      const breaks = {};
      breakRows
        .filter((b) => parseInt(b.character_id) === charId)
        .forEach((b) => {
          breaks[b.element_type] = {
            count: parseInt(b.count),
            dmg: parseInt(b.damage),
          };
        });

      // 构建角色对象
      this.characters.set(charCode, {
        id: charId,
        name: {
          en: row.name_en,
          zh: row.name_zh,
        },
        hp: parseInt(row.hp),
        atk: parseInt(row.atk),
        def: parseInt(row.def),
        spd: parseInt(row.spd),
        element: row.element,
        breaks: breaks,
        actions: actions,
        skillIds: skillIds, // 保留技能ID列表
      });
    });
  }

  /**
   * 解析敌人数据
   */
  parseEnemies(enemyRows, breakRows) {
    enemyRows.forEach((row) => {
      const enemyId = parseInt(row.enemy_id);
      const enemyCode = row.enemy_code;

      // 解析破盾数据
      const breaks = {};
      breakRows
        .filter((b) => parseInt(b.enemy_id) === enemyId)
        .forEach((b) => {
          breaks[b.element_type] = {
            count: parseInt(b.count),
            dmg: parseInt(b.damage),
          };
        });

      // 构建敌人对象
      this.enemies.set(enemyCode, {
        id: enemyId,
        name: {
          en: row.name_en,
          zh: row.name_zh,
        },
        hp: parseInt(row.hp),
        atk: parseInt(row.atk),
        def: parseInt(row.def),
        spd: parseInt(row.spd),
        element: row.element,
        breaks: breaks,
      });
    });
  }

  /**
   * 获取角色数据（兼容原有接口）
   */
  getCharacter(code) {
    return this.characters.get(code);
  }

  /**
   * 获取敌人数据（兼容原有接口）
   */
  getEnemy(code) {
    return this.enemies.get(code);
  }

  /**
   * 获取技能数据
   */
  getSkill(skillId) {
    return this.skills.get(skillId);
  }

  /**
   * 获取所有角色代码列表
   */
  getAllCharacterCodes() {
    return Array.from(this.characters.keys());
  }

  /**
   * 获取所有敌人代码列表
   */
  getAllEnemyCodes() {
    return Array.from(this.enemies.keys());
  }

  /**
   * 转换为原有的CHAR_DATABASE格式（向后兼容）
   */
  toCharDatabase() {
    const database = {};
    this.characters.forEach((char, code) => {
      database[code] = char;
    });
    return database;
  }

  /**
   * 转换为原有的ENEMY_DATABASE格式（向后兼容）
   */
  toEnemyDatabase() {
    const database = {};
    this.enemies.forEach((enemy, code) => {
      database[code] = enemy;
    });
    return database;
  }
}

// 创建全局实例
const dataLoader = new DataLoader();

// 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DataLoader, dataLoader };
}
