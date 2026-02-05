/**
 * Theme Manager Module
 * Handles theme switching (dark/light/system)
 */

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupSystemThemeListener();
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    let actualTheme = theme;
    
    if (theme === 'system') {
      actualTheme = this.getSystemTheme();
    }
    
    document.documentElement.setAttribute('data-theme', actualTheme);
  }

  /**
   * Get system theme preference
   */
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Setup system theme change listener
   */
  setupSystemThemeListener() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.applyTheme('system');
      }
    });
  }

  /**
   * Save theme to localStorage
   */
  saveTheme(theme) {
    try {
      localStorage.setItem('imageEditor_theme', theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  /**
   * Load theme from localStorage
   */
  loadTheme() {
    try {
      return localStorage.getItem('imageEditor_theme') || 'dark';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'dark';
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}

export { ThemeManager };
