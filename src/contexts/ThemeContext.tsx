import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Theme, ThemeColors, defaultThemeColors } from '../types';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
  updateColors: (newColors: ThemeColors) => Promise<void>;
  resetColors: () => Promise<void>;
  isLoadingColors: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [colors, setColors] = useState<ThemeColors>(defaultThemeColors);
  const [isLoadingColors, setIsLoadingColors] = useState(true);

  // Subscribe to theme colors from Firestore
  useEffect(() => {
    const themeDocRef = doc(db, 'admin', 'theme');

    const unsubscribe = onSnapshot(
      themeDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data?.colors) {
            setColors(data.colors as ThemeColors);
          }
        }
        setIsLoadingColors(false);
      },
      (error) => {
        console.error('Error fetching theme colors:', error);
        setIsLoadingColors(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Apply CSS variables whenever colors change
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS variables for theme colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-gold', colors.gold);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-light', colors.textLight);

    // Generate lighter and darker variants
    root.style.setProperty('--color-primary-light', adjustColor(colors.primary, 40));
    root.style.setProperty('--color-primary-dark', adjustColor(colors.primary, -20));
    root.style.setProperty('--color-secondary-light', adjustColor(colors.secondary, 40));
    root.style.setProperty('--color-secondary-dark', adjustColor(colors.secondary, -20));
  }, [colors]);

  // Handle light/dark mode
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (newTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      setActualTheme(newTheme);
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [actualTheme, setTheme]);

  const updateColors = useCallback(async (newColors: ThemeColors) => {
    try {
      const themeDocRef = doc(db, 'admin', 'theme');
      await setDoc(themeDocRef, { colors: newColors }, { merge: true });
    } catch (error) {
      console.error('Error updating theme colors:', error);
      throw error;
    }
  }, []);

  const resetColors = useCallback(async () => {
    try {
      await updateColors(defaultThemeColors);
    } catch (error) {
      console.error('Error resetting theme colors:', error);
      throw error;
    }
  }, [updateColors]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        actualTheme,
        setTheme,
        toggleTheme,
        colors,
        updateColors,
        resetColors,
        isLoadingColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to lighten or darken a color
function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Adjust each channel
  const adjustChannel = (channel: number) => {
    const adjusted = Math.round(channel + (255 - channel) * (percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  const newR = percent > 0 ? adjustChannel(r) : Math.max(0, r + Math.round(r * percent / 100));
  const newG = percent > 0 ? adjustChannel(g) : Math.max(0, g + Math.round(g * percent / 100));
  const newB = percent > 0 ? adjustChannel(b) : Math.max(0, b + Math.round(b * percent / 100));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
