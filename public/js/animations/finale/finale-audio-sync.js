import { cl, ez } from '../../utils.js';

/**
 * Silent rhythmic intensity & lighting envelope curves synchronized to the 270s timeline.
 * Provides consistent beats and swells without requiring audio playback.
 */
export const finaleAudioSync = {
  getIntensity(t) {
    if (t < 20) return 0.22 + 0.25 * ez(cl((t - 6) / 10));
    if (t < 45) return 0.48 + 0.22 * ez(cl((t - 20) / 20));
    if (t < 70) return 0.72 + 0.14 * Math.sin((t - 45) * 0.9);
    if (t < 90) return 0.58 + 0.16 * ez(cl((t - 75) / 10));
    if (t < 115) return 0.74;
    if (t < 140) return 0.82;
    if (t < 165) return 0.52;
    if (t < 185) return 0.78 + 0.12 * ez(cl((t - 165) / 12));
    if (t < 210) return 0.92 + 0.08 * ez(cl((t - 185) / 20));
    if (t < 235) return 0.95 - 0.1 * ez(cl((t - 228) / 7));
    if (t < 255) return 0.45;
    return 0.35 * (1 - ez(cl((t - 266) / 4)));
  },

  getBeatPulse(t, tempoHz = 1.35) {
    const phase = (t * tempoHz) % 1;
    return Math.pow(Math.max(0, 1 - phase * 2.2), 2);
  }
};
