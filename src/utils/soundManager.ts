import { Audio } from 'expo-av';

type SoundKey = 'intro' | 'lose' | 'click' | 'correct' | 'incorrect' | 'timeout' | 'finish';

const SOURCES: Partial<Record<SoundKey, number>> = {
  intro:     require('../../assets/mixkit-intro-transition-1146.wav'),
  lose:      require('../../assets/mixkit-retro-game-notification-212.wav'),
  click:     require('../../assets/button-click.wav'),
};

class SoundManager {
  private sounds: Partial<Record<SoundKey, Audio.Sound>> = {};
  private ready = false;

  async init() {
    if (this.ready) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      await Promise.all(
        (Object.entries(SOURCES) as [SoundKey, number][]).map(async ([key, src]) => {
          try {
            const { sound } = await Audio.Sound.createAsync(src, { shouldPlay: false });
            this.sounds[key] = sound;
          } catch {}
        })
      );
    } catch {}
    this.ready = true;
  }

  async play(key: SoundKey, enabled = true) {
    if (!enabled || !this.ready) return;
    try {
      await this.sounds[key]?.replayAsync();
    } catch {}
  }
}

export const soundManager = new SoundManager();
