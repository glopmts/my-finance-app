import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Surface colors
  surface: string;
  surfaceSecondary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  borderSecondary: string;
  borderDashed: string;

  // Brand colors
  primary: string;
  primaryHover: string;

  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Interactive colors
  interactive: string;
  interactiveHover: string;
}

const lightTheme: ThemeColors = {
  background: "#ffffff",
  backgroundSecondary: "#f4f4f5", // zinc-100
  backgroundTertiary: "#e4e4e7", // zinc-200

  surface: "#ffffff",
  surfaceSecondary: "#fafafa", // zinc-50

  text: "#18181b", // zinc-900
  textSecondary: "#52525b", // zinc-600
  textTertiary: "#71717a", // zinc-500

  border: "#d4d4d8", // zinc-300
  borderSecondary: "#e4e4e7", // zinc-200
  borderDashed: "#a1a1aa", // zinc-400

  primary: "#3b82f6", // blue-500
  primaryHover: "#2563eb", // blue-600

  success: "#22c55e", // green-500
  error: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  info: "#06b6d4", // cyan-500

  interactive: "#3b82f6",
  interactiveHover: "#2563eb",
};

const darkTheme: ThemeColors = {
  background: "#18181b", // zinc-950
  backgroundSecondary: "#18181b", // zinc-900
  backgroundTertiary: "#27272a", // zinc-800

  surface: "#18181b", // zinc-900
  surfaceSecondary: "#27272a", // zinc-800

  text: "#fafafa", // zinc-50
  textSecondary: "#a1a1aa", // zinc-400
  textTertiary: "#71717a", // zinc-500

  border: "#3f3f46", // zinc-700
  borderSecondary: "#52525b", // zinc-600
  borderDashed: "#71717a", // zinc-500

  primary: "#3b82f6", // blue-500
  primaryHover: "#60a5fa", // blue-400

  success: "#22c55e", // green-500
  error: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  info: "#06b6d4", // cyan-500

  interactive: "#3b82f6",
  interactiveHover: "#60a5fa",
};

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const isDark = React.useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    return systemColorScheme === "dark";
  }, [themeMode, systemColorScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
