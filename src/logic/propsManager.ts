import Papa from "papaparse";
import { PropDefinition, PropType, Rarity } from "../types";
import propsCsv from "@configs/props.csv?url";

/**
 * 道具管理器类
 * 负责从 CSV 配置文件加载道具定义，并提供查询接口
 */
class PropsManager {
  /** 道具注册表：Map<道具ID, 道具定义对象> */
  private propsRegistry: Map<string, PropDefinition> = new Map();

  /**
   * 初始化道具数据
   * 加载并解析 props.csv 文件
   */
  async initProps(): Promise<void> {
    try {
      const response = await fetch(propsCsv);
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const prop: PropDefinition = {
                id: row.id,
                display_name: row.display_name,
                description: row.description,
                prop_type: row.prop_type
                  .split(",")
                  .map((t: string) => t.trim() as PropType),
                rarity: parseInt(row.rarity, 10) as Rarity,
                max_quantity: parseInt(row.max_quantity, 10),
                tradeable: row.tradeable.toLowerCase() === "true",
              };
              this.propsRegistry.set(prop.id, prop);
            });
            console.log(
              "道具注册表初始化完成：已加载",
              this.propsRegistry.size,
              "个道具。",
            );
            resolve();
          },
          error: (error: any) => {
            console.error("解析 props.csv 出错：", error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error("加载 props.csv 失败：", error);
    }
  }

  /**
   * 根据 ID 获取道具定义
   * @param id 道具ID
   */
  getPropDefinition(id: string): PropDefinition | undefined {
    return this.propsRegistry.get(id);
  }

  /** 获取所有已加载的道具定义列表 */
  getAllProps(): PropDefinition[] {
    return Array.from(this.propsRegistry.values());
  }
}

/** 道具管理器单例 */
export const propsManager = new PropsManager();
