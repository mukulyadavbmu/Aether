import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    textSecondary: string;
  };
}

const lightColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  border: '#E0E0E0',
  primary: '#00F2FF',
  secondary: '#00FF9D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  textSecondary: '#666666',
};

const darkColors = {
  background: '#000000',
  card: '#1a1a1a',
  text: '#FFFFFF',
  border: '#333333',
  primary: '#00F2FF',
  secondary: '#00FF9D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  textSecondary: '#888888',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Failed to load theme');
    }
  };

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.log('Failed to save theme');
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
