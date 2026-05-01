import { create } from 'zustand';

const getInitialTheme = () => {
  const stored = localStorage.getItem('ims-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  // Respect system preference
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ims-theme', theme);
};

// Apply on load immediately
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return { theme: next };
    });
  },
}));

export default useThemeStore;
