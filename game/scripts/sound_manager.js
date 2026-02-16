/**
 * Sound Manager
 * 游戏音效和音乐管理器
 */
class SoundManager {
  static ctx = null;
  static volume = 0.5;
  static bgmInterval = null;

  static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  static setVolume(val) {
    this.volume = val;
  }

  static playTone(freq, type, duration, volMod = 1) {
    if (!this.ctx || this.volume <= 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * volMod, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  static playNoise(duration, volMod = 1) {
    if (!this.ctx || this.volume <= 0) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * volMod, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  static startBGM() {
    if (!this.ctx) this.init();
    if (this.bgmInterval) return;
    this.playBGMLoop();
  }

  static stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  static playBGMLoop() {
    if (!this.ctx) return;
    const playNote = (time, freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.value = this.volume * 0.15;
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.2);
    };
    const pattern = [146.83, 0, 146.83, 174.61, 220.0, 174.61, 146.83, 110.0];
    let idx = 0;
    this.bgmInterval = setInterval(() => {
      if (this.volume <= 0) return;
      const freq = pattern[idx % pattern.length];
      if (freq > 0) playNote(this.ctx.currentTime, freq);
      idx++;
    }, 200);
  }

  static playClick() {
    this.playTone(800, "square", 0.05, 0.3);
  }

  static playSwap() {
    this.playTone(300, "triangle", 0.1, 0.5);
  }

  static playMatch() {
    this.playTone(600, "sine", 0.1, 0.6);
    setTimeout(() => this.playTone(900, "sine", 0.2, 0.6), 100);
  }

  static playAttack() {
    this.playNoise(0.2, 0.8);
  }

  static playWin() {
    this.playTone(440, "square", 0.2);
    setTimeout(() => this.playTone(554, "square", 0.2), 200);
    setTimeout(() => this.playTone(659, "square", 0.4), 400);
  }

  static playDefeat() {
    this.playTone(200, "sawtooth", 0.3);
    setTimeout(() => this.playTone(150, "sawtooth", 0.5), 300);
  }
}
