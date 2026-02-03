/**
 * Theme Manager - Handles dark mode with multiple strategies
 * 1. User preference (stored)
 * 2. System preference (prefers-color-scheme)
 * 3. Ambient light sensor (if available)
 * 4. Time-based (night shift hours)
 */

const DARK_THRESHOLD_LUX = 50; // Below this = dark mode
const NIGHT_START = 20; // 8 PM
const NIGHT_END = 6;    // 6 AM
const STORAGE_KEY = 'medward-theme-mode';

// Simple event emitter for theme events
const listeners = {};
function emit(event, data) {
  (listeners[event] || []).forEach(fn => fn(data));
}

export const Theme = {
  _mode: 'system', // 'light' | 'dark' | 'system' | 'auto'
  _sensor: null,

  async init() {
    // Load saved preference
    const saved = localStorage.getItem(STORAGE_KEY);
    this._mode = saved || 'system';

    // Apply initial theme
    this._apply();

    // Listen to system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this._mode === 'system') {
        this._apply();
      }
    });

    // Try to use ambient light sensor
    this._initAmbientSensor();
  },

  _initAmbientSensor() {
    if ('AmbientLightSensor' in window) {
      try {
        this._sensor = new AmbientLightSensor();
        this._sensor.addEventListener('reading', () => {
          if (this._mode === 'auto') {
            const shouldBeDark = this._sensor.illuminance < DARK_THRESHOLD_LUX;
            this._setDark(shouldBeDark);
          }
        });
        this._sensor.start();
      } catch (e) {
        console.log('[Theme] Ambient light sensor not available');
      }
    }
  },

  _apply() {
    let shouldBeDark = false;

    switch (this._mode) {
      case 'dark':
        shouldBeDark = true;
        break;
      case 'light':
        shouldBeDark = false;
        break;
      case 'system':
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        break;
      case 'auto':
        // Check time first, sensor will override if available
        const hour = new Date().getHours();
        shouldBeDark = hour >= NIGHT_START || hour < NIGHT_END;
        break;
    }

    this._setDark(shouldBeDark);
  },

  _setDark(isDark) {
    document.body.classList.toggle('dark-theme', isDark);

    // Also toggle Tailwind dark class on html element
    document.documentElement.classList.toggle('dark', isDark);

    // Update meta theme-color for browser chrome
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = isDark ? '#0f172a' : '#1d4ed8';
    }

    emit('theme:changed', { isDark });
  },

  /**
   * Set theme mode
   * @param {'light'|'dark'|'system'|'auto'} mode
   */
  async setMode(mode) {
    this._mode = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    this._apply();
  },

  getMode() {
    return this._mode;
  },

  isDark() {
    return document.body.classList.contains('dark-theme');
  },

  toggle() {
    const newMode = this.isDark() ? 'light' : 'dark';
    this.setMode(newMode);
  },

  /**
   * Subscribe to theme events
   */
  on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }
};
