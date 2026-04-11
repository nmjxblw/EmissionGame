import Papa from "papaparse";
import { Character, ElementalStats } from "../types";
import enemiesCsv from "@configs/enemies.csv?url";

/** 敌人注册表：Map<敌人ID, 敌人属性对象> */
let enemyRegistry: Map<string, Character> = new Map();

/**
 * 初始化敌人数据
 * 从 CSV 配置文件中加载并解析敌人属性
 */
export const initEnemies = async (): Promise<void> => {
  try {
    const response = await fetch(enemiesCsv);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          results.data.forEach((row: any) => {
            const enemy: Character = {
              name: row.name,
              maxHp: parseInt(row.maxHp, 10),
              currentHp: parseInt(row.maxHp, 10),
              addDamageBonus: {
                gold: parseInt(row.gold_bonus, 10),
                wood: parseInt(row.wood_bonus, 10),
                water: parseInt(row.water_bonus, 10),
                fire: parseInt(row.fire_bonus, 10),
                earth: parseInt(row.earth_bonus, 10),
              },
              addDamageReduction: {
                gold: parseInt(row.gold_reduction, 10),
                wood: parseInt(row.wood_reduction, 10),
                water: parseInt(row.water_reduction, 10),
                fire: parseInt(row.fire_reduction, 10),
                earth: parseInt(row.earth_reduction, 10),
              },
              multDamageBonus: parseFloat(row.multDamageBonus),
              multDamageReduction: parseFloat(row.multDamageReduction),
              baseMultBonus: parseFloat(row.baseMultBonus),
              baseMultReduction: parseFloat(row.baseMultReduction),
              attackInterval: parseInt(row.attackInterval, 10),
              baseDamage: parseInt(row.baseDamage, 10),
              damageFloat: parseInt(row.damageFloat, 10),
            };
            // 使用 CSV 中的 ID 作为键存储敌人配置
            enemyRegistry.set(row.id, enemy);
          });
          console.log(
            "敌人注册表初始化完成：已加载",
            enemyRegistry.size,
            "个敌人。",
          );
          resolve();
        },
        error: (error: any) => {
          console.error("解析 enemies.csv 出错：", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("加载 enemies.csv 失败：", error);
  }
};

/**
 * 根据 ID 获取敌人配置
 * @param id 敌人ID
 */
export const getEnemyConfig = (id: string): Character | undefined => {
  return enemyRegistry.get(id);
};

/** 获取所有已加载的敌人列表 */
export const getAllEnemies = (): Character[] => {
  return Array.from(enemyRegistry.values());
};
