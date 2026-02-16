/**
 * Battle System
 * 战斗系统管理器
 */
class BattleSystem {
  constructor() {
    this.playerTeam = [];
    this.enemyTeam = [];
    this.turnQueue = [];
    this.currentEntity = null;
    this.isBattleActive = false;
    this.actionDeck = [];
  }

  init(playerConfig, levelId) {
    this.playerTeam = [];
    playerConfig.roster.forEach((charId, idx) => {
      if (charId && dataLoader.getCharacter(charId))
        this.playerTeam.push(new BattleEntity(`p_${idx}`, charId, true, idx));
    });
    this.actionDeck = playerConfig.deck;
    let enemyId = levelId;
    if (!dataLoader.getEnemy(enemyId)) enemyId = "boss_doll";
    this.enemyTeam = [new BattleEntity("e_0", enemyId, false, 0)];
    this.isBattleActive = true;
    this.turnQueue = [];
    UIManager.initBattle(this.playerTeam, this.enemyTeam);
    UIManager.updateCharacterPositions({ id: null }, [
      ...this.playerTeam,
      ...this.enemyTeam,
    ]);
    BoardSystem.init(this.playerTeam, this.actionDeck);
    SoundManager.startBGM();
    this.gameLoop();
  }

  surrender() {
    this.isBattleActive = false;
    SoundManager.stopBGM();
    SettingsManager.toggle(false);
    UIManager.showToast(Utils.getText("defeat"), true);
    SoundManager.playDefeat();
    setTimeout(() => {
      document.getElementById("battle-scene").classList.remove("active");
      document.getElementById("level-select-scene").classList.add("active");
    }, 1500);
  }

  predictActionOrder(count = 8) {
    let simEntities = [...this.playerTeam, ...this.enemyTeam]
      .filter((e) => !e.isFainted)
      .map((e) => ({
        id: e.id,
        name: e.name,
        isPlayer: e.isPlayer,
        element: e.element,
        spd: e.temp.spd,
        ap: e.ap,
        simAp: e.ap,
      }));
    let queue = [];
    let loopLimit = 0;
    if (this.currentEntity && !this.currentEntity.isFainted)
      queue.push({
        id: this.currentEntity.id,
        name: this.currentEntity.name,
        isPlayer: this.currentEntity.isPlayer,
        element: this.currentEntity.element,
        isCurrent: true,
      });
    while (queue.length < count && loopLimit < 5000) {
      loopLimit++;
      let ready = simEntities.filter((e) => e.simAp >= CONFIG.BASE_AP_GOAL);
      if (ready.length > 0) {
        ready.sort((a, b) => b.simAp - a.simAp);
        for (let e of ready) {
          if (queue.length >= count) break;
          queue.push(e);
          e.simAp -= CONFIG.BASE_AP_GOAL;
        }
      } else simEntities.forEach((e) => (e.simAp += e.spd));
    }
    return queue;
  }

  async gameLoop() {
    while (this.isBattleActive) {
      if (SettingsManager.isPaused) {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      if (this.checkEndCondition()) break;
      if (this.turnQueue.length === 0) this.tickTime();
      if (this.turnQueue.length > 0) {
        const entity = this.turnQueue.shift();
        this.currentEntity = entity;
        UIManager.highlightTurn(entity);
        UIManager.updateCharacterPositions(entity, [
          ...this.playerTeam,
          ...this.enemyTeam,
        ]);
        let order = this.predictActionOrder(8);
        UIManager.updateActionOrder(order, false);
        if (entity.isFainted) continue;
        if (entity.isPlayer) {
          BoardSystem.prepareBoardForCharacter(entity);
          await this.waitForPlayerInput();
        } else await this.executeAI(entity);

        if (!this.isBattleActive) break;

        entity.ap -= CONFIG.BASE_AP_GOAL;
        entity.resetTurn();
        BoardSystem.isLocked = true;
        let nextOrder = this.predictActionOrder(8);
        UIManager.updateActionOrder(nextOrder, true);
        await new Promise((r) => setTimeout(r, 600));
        BoardSystem.isLocked = false;
      }
    }
  }

  tickTime() {
    let loops = 0;
    while (this.turnQueue.length === 0 && loops < 10000) {
      let anyoneReady = false;
      [...this.playerTeam, ...this.enemyTeam].forEach((entity) => {
        if (entity.isFainted) return;
        entity.ap += entity.temp.spd;
        if (entity.ap >= CONFIG.BASE_AP_GOAL) {
          this.turnQueue.push(entity);
          anyoneReady = true;
        }
      });
      if (anyoneReady) {
        this.turnQueue.sort((a, b) => b.ap - a.ap);
      }
      loops++;
    }
  }

  waitForPlayerInput() {
    return new Promise((resolve) => {
      this.resolveTurnInput = resolve;
    });
  }

  executePlayerSkill(charEntity, actionId, count, isTriple) {
    SoundManager.playAttack();
    UIManager.playAttackAnim(charEntity);
    const skillData = charEntity.actions[actionId];
    if (!skillData) {
      this.resolveTurnInput();
      return;
    }
    const target =
      this.enemyTeam.find((e) => !e.isFainted) || this.enemyTeam[0];
    let dmgMult = isTriple ? 2 : 1;
    if (count > 3) dmgMult += (count - 3) * 0.5;
    setTimeout(() => {
      const descStr = skillData.desc.en || skillData.desc;
      if (descStr.includes("Dmg") || descStr.includes("伤")) {
        const dmgInfo = Utils.calcDamage(
          charEntity,
          target,
          charEntity.temp.atk * dmgMult,
          skillData.type,
          descStr.includes("True") || descStr.includes("真实"),
          false,
        );
        target.takeDamage(dmgInfo.hpDmg, dmgInfo.shieldDmg);
        this.triggerBreak(target, skillData.type);
      } else if (descStr.includes("Shield") || descStr.includes("盾"))
        charEntity.addShield(5 * dmgMult);
      if (this.resolveTurnInput) {
        this.resolveTurnInput();
        this.resolveTurnInput = null;
      }
    }, 300);
  }

  async executeAI(enemy) {
    await new Promise((r) => setTimeout(r, 800));
    while (SettingsManager.isPaused)
      await new Promise((r) => setTimeout(r, 200));

    if (!this.isBattleActive) return;

    const alivePlayers = this.playerTeam.filter((p) => !p.isFainted);
    if (alivePlayers.length > 0) {
      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const dmg = Utils.calcDamage(
        enemy,
        target,
        enemy.temp.atk,
        enemy.element,
        false,
        false,
      );
      UIManager.playAttackAnim(enemy);
      SoundManager.playAttack();
      setTimeout(() => {
        if (this.isBattleActive) {
          target.takeDamage(dmg.hpDmg, dmg.shieldDmg);
          UIManager.showFloatText(0, false, Utils.getText("attack"), "#f0f");
        }
      }, 300);
    }
  }

  triggerBreak(target, elementType) {
    if (!target.breaks[elementType]) return;
    target.breaks[elementType].count -= 1;
    UIManager.showFloatText(
      target.position,
      target.isPlayer,
      `Break -1 (${elementType})`,
      "#ffa",
    );
    if (target.breaks[elementType].count <= 0) {
      let breakDmg = target.breaks[elementType].dmg;
      target.takeDamage(breakDmg, 0, true);
      target.breaks[elementType].count = 10;
      UIManager.showFloatText(
        target.position,
        target.isPlayer,
        Utils.getText("break_trigger"),
        "gold",
      );
    }
  }

  checkEndCondition() {
    const playerAlive = this.playerTeam.some((p) => !p.isFainted);
    const enemyAlive = this.enemyTeam.some((e) => !e.isFainted);
    if (!playerAlive) {
      SoundManager.stopBGM();
      UIManager.showToast(Utils.getText("defeat"), true);
      SoundManager.playDefeat();
      this.isBattleActive = false;
      setTimeout(() => {
        document.getElementById("battle-scene").classList.remove("active");
        document.getElementById("level-select-scene").classList.add("active");
        SettingsManager.toggle(false);
      }, 2000);
      return true;
    }
    if (!enemyAlive) {
      SoundManager.stopBGM();
      UIManager.showToast(Utils.getText("victory"), true);
      SoundManager.playWin();
      this.isBattleActive = false;
      setTimeout(() => {
        document.getElementById("battle-scene").classList.remove("active");
        document.getElementById("level-select-scene").classList.add("active");
        SettingsManager.toggle(false);
      }, 2000);
      return true;
    }
    return false;
  }
}
