"use client";

import { ThemeProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/** Platform theme boundary — session preference, not feature/global app state. */
export function AppThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
