/**
 * Battle Entity
 * 战斗实体类（角色和敌人）
 */
class BattleEntity {
  constructor(id, templateId, isPlayer, position) {
    const data = isPlayer
      ? window.dataLoader
        ? dataLoader.getCharacter(templateId)
        : null
      : window.dataLoader
        ? dataLoader.getEnemy(templateId)
        : null;
    if (!data) {
      this.nameData = { en: "Unknown", zh: "未知" };
      this.baseMaxHp = 1;
      this.baseAtk = 0;
      this.baseDef = 0;
      this.baseSpd = 1;
      this.element = "none";
      this.breaks = {};
      this.actions = {};
    } else {
      this.nameData = data.name;
      this.baseMaxHp = data.hp;
      this.baseAtk = data.atk;
      this.baseDef = data.def;
      this.baseSpd = Math.max(
        CONFIG.MIN_SPEED,
        Math.min(CONFIG.MAX_SPEED, data.spd),
      );
      this.element = data.element;
      this.breaks = JSON.parse(JSON.stringify(data.breaks || {}));
      this.actions = data.actions || {};
    }
    this.id = id;
    this.templateId = templateId;
    this.isPlayer = isPlayer;
    this.position = position;
    this.currentHp = this.baseMaxHp;
    this.maxHp = this.baseMaxHp;
    this.ap = 0;
    this.isFainted = false;
    this.faintCounter = 0;
    this.reviveCount = 3;
    this.temp = {
      atk: this.baseAtk,
      def: this.baseDef,
      spd: this.baseSpd,
      atkBuff: 0,
      defBuff: 0,
      dmgBuff: 0,
      shield: 0,
      buffs: [],
    };
  }

  get name() {
    return Utils.getText(this.nameData);
  }

  resetTurn() {}

  takeDamage(hpDmg, shieldDmg, isBreak = false) {
    if (this.isFainted) return;
    this.temp.shield = Math.max(0, this.temp.shield - shieldDmg);
    this.currentHp = Math.max(0, this.currentHp - hpDmg);
    const isHeavy = isBreak || hpDmg >= this.baseMaxHp * 0.1;
    UIManager.showDamage(this.position, this.isPlayer, hpDmg, shieldDmg);
    UIManager.updateEntityStatus(this);
    UIManager.playHitAnim(this, isHeavy);
    if (this.currentHp <= 0) this.faint();
  }

  heal(amount) {
    if (this.isFainted) return;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    UIManager.showFloatText(this.position, this.isPlayer, `+${amount}`, "#4f4");
    UIManager.updateEntityStatus(this);
  }

  addShield(amount) {
    if (this.isFainted) return;
    this.temp.shield += amount;
    UIManager.showFloatText(
      this.position,
      this.isPlayer,
      `Shield +${amount}`,
      "#4af",
    );
    UIManager.updateEntityStatus(this);
  }

  faint() {
    this.isFainted = true;
    this.currentHp = 0;
    this.ap = 0;
    this.temp.shield = 0;
    this.temp.buffs = [];
    UIManager.updateEntityStatus(this);
    UIManager.playDeathAnim(this);
    UIManager.log(`${this.name} ${Utils.getText("fainted")}`);
  }

  tryRevive() {
    if (this.reviveCount > 0) {
      this.faintCounter++;
      UIManager.showFloatText(
        this.position,
        this.isPlayer,
        `${Utils.getText("revive")} ${this.faintCounter}/5`,
        "#fff",
      );
      if (this.faintCounter >= 5) {
        this.isFainted = false;
        this.currentHp = Math.floor(this.maxHp / 2);
        this.reviveCount--;
        this.faintCounter = 0;
        UIManager.reviveEntity(this);
        UIManager.log(`${this.name} ${Utils.getText("revived")}`);
        UIManager.updateEntityStatus(this);
      }
    }
  }
}
