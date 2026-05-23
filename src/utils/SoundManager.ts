// Sound Manager - handles all game audio
class SoundManager {
  private bgMusic: HTMLAudioElement | null = null;
  private takeoffSound: HTMLAudioElement | null = null;
  private crashSound: HTMLAudioElement | null = null;
  private cashoutSound: HTMLAudioElement | null = null;
  private initialized: boolean = false;
  private bgMusicPlaying: boolean = false;

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

  // Start background music (call after user interaction)
  playBackground() {
    if (!this.bgMusic) this.init();
    if (this.bgMusicPlaying) return;

    this.bgMusic!.play().then(() => {
      this.bgMusicPlaying = true;
    }).catch(() => {
      this.bgMusicPlaying = false;
    });
  }

  // Play takeoff sound when plane starts flying
  playTakeoff() {
    if (!this.initialized) this.init();
    if (!this.takeoffSound) return;
    this.takeoffSound.currentTime = 0;
    this.takeoffSound.play().catch(() => {});
  }

  // Play crash sound when plane crashes
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

  // Play cashout win sound
  playCashout() {
    if (!this.initialized) this.init();
    if (!this.cashoutSound) return;
    // Create a new Audio instance each time to avoid overlap issues
    const sound = new Audio("/sounds/ka-ching.mp3");
    sound.volume = 1.0;
    sound.play().catch(() => {});
  }

  // Stop takeoff sound
  stopTakeoff() {
    if (this.takeoffSound) {
      this.takeoffSound.pause();
      this.takeoffSound.currentTime = 0;
    }
  }

  // Mute/unmute all
  setMuted(muted: boolean) {
    if (this.bgMusic) this.bgMusic.muted = muted;
    if (this.takeoffSound) this.takeoffSound.muted = muted;
    if (this.crashSound) this.crashSound.muted = muted;
    if (this.cashoutSound) this.cashoutSound.muted = muted;
  }

  // Set background volume (0-1)
  setBgVolume(vol: number) {
    if (this.bgMusic) this.bgMusic.volume = vol;
  }
}

// Singleton instance
const soundManager = new SoundManager();
export default soundManager;
