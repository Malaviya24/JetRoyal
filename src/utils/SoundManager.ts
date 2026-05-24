// Sound Manager - handles all game audio
class SoundManager {
  private bgMusic: HTMLAudioElement | null = null;
  private takeoffSound: HTMLAudioElement | null = null;
  private crashSound: HTMLAudioElement | null = null;
  private cashoutSound: HTMLAudioElement | null = null;
  private initialized: boolean = false;

  init() {
    if (this.initialized) return;

    this.bgMusic = new Audio("/sounds/Background Music.mp3");
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.7;
    this.bgMusic.preload = "auto";

    this.takeoffSound = new Audio("/sounds/Plane start sound.mp3");
    this.takeoffSound.volume = 1.0;
    this.takeoffSound.preload = "auto";

    this.crashSound = new Audio("/sounds/Plane Crash Sound.mp3");
    this.crashSound.volume = 1.0;
    this.crashSound.preload = "auto";

    this.cashoutSound = new Audio("/sounds/ka-ching.mp3");
    this.cashoutSound.volume = 1.0;
    this.cashoutSound.preload = "auto";

    this.initialized = true;
  }

  // Start background music — always tries to play (idempotent)
  playBackground() {
    if (!this.initialized) this.init();
    if (!this.bgMusic) return;
    // If already playing, do nothing
    if (!this.bgMusic.paused) return;
    this.bgMusic.play().catch(() => {});
  }

  // Force restart background music (called on page mount/refresh)
  ensureBackground() {
    if (!this.initialized) this.init();
    if (!this.bgMusic) return;
    // Reset to start if it was stuck
    if (this.bgMusic.paused) {
      this.bgMusic.play().catch(() => {});
    }
  }

  playTakeoff() {
    if (!this.initialized) this.init();
    if (!this.takeoffSound) return;
    this.takeoffSound.currentTime = 0;
    this.takeoffSound.play().catch(() => {});
  }

  playCrash() {
    if (!this.initialized) this.init();
    if (!this.crashSound) return;
    this.crashSound.currentTime = 0;
    this.crashSound.play().catch(() => {});
    if (this.takeoffSound) {
      this.takeoffSound.pause();
      this.takeoffSound.currentTime = 0;
    }
  }

  playCashout() {
    if (!this.initialized) this.init();
    // Use a fresh Audio instance for cashout to allow rapid overlapping plays
    const sound = new Audio("/sounds/ka-ching.mp3");
    sound.volume = 1.0;
    sound.play().catch(() => {});
  }

  stopTakeoff() {
    if (this.takeoffSound) {
      this.takeoffSound.pause();
      this.takeoffSound.currentTime = 0;
    }
  }

  setMuted(muted: boolean) {
    if (this.bgMusic) this.bgMusic.muted = muted;
    if (this.takeoffSound) this.takeoffSound.muted = muted;
    if (this.crashSound) this.crashSound.muted = muted;
    if (this.cashoutSound) this.cashoutSound.muted = muted;
  }

  setBgVolume(vol: number) {
    if (this.bgMusic) this.bgMusic.volume = vol;
  }
}

const soundManager = new SoundManager();
export default soundManager;
