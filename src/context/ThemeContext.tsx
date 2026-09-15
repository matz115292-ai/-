import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  toggleDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('barq_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('barq_dark_mode', String(darkMode));
    } catch {}

    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const setDarkMode = (val: boolean) => setDarkModeState(val);
  const toggleDarkMode = () => setDarkModeState(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
