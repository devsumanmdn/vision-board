import { useSettingsStore } from "@/store/settingsStore";
import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ColorScheme = "light" | "dark";

interface ThemeContextType {
  colorScheme: ColorScheme;
  isDark: boolean;
  isUsingSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: "light",
  isDark: false,
  isUsingSystemTheme: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);

  const value = useMemo(() => {
    let colorScheme: ColorScheme;

    if (themeMode === "system") {
      colorScheme = systemColorScheme ?? "light";
    } else {
      colorScheme = themeMode;
    }

    return {
      colorScheme,
      isDark: colorScheme === "dark",
      isUsingSystemTheme: themeMode === "system",
    };
  }, [themeMode, systemColorScheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Override the default useColorScheme to use our theme context
export function useColorScheme(): ColorScheme {
  const { colorScheme } = useTheme();
  return colorScheme;
}
