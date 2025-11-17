import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme types
 */
export type Theme = 'dark' | 'light';

/**
 * Theme store state interface
 */
interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme store for managing application theme
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const initialTheme = useThemeStore.getState().theme;
  applyTheme(initialTheme);
}
