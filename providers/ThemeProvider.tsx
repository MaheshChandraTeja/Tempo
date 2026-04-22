import { darkThemeColors, lightThemeColors } from '@/theme/colors';
import {
  PREFERENCE_KEYS,
  getPreferenceString,
  setPreferenceString,
} from '@/storage/kv/preferences';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
export type ThemeMode = 'system' | 'light' | 'dark';

export type AppThemeColors = Readonly<{
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}>;

export type AppTheme = Readonly<{
  isDark: boolean;
  mode: ThemeMode;
  systemScheme: Exclude<ColorSchemeName, null>;
  colors: AppThemeColors;
}>;

type ThemeContextValue = Readonly<{
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}>;

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: string): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function resolveSystemScheme(
  scheme: ColorSchemeName,
): Exclude<ColorSchemeName, null> {
  return scheme ?? 'light';
}

function createTheme(
  mode: ThemeMode,
  systemScheme: Exclude<ColorSchemeName, null>,
): AppTheme {
  const effectiveScheme = mode === 'system' ? systemScheme : mode;
  const isDark = effectiveScheme === 'dark';

  return Object.freeze({
    isDark,
    mode,
    systemScheme,
    colors: isDark ? darkThemeColors : lightThemeColors,
  });
}

export function ThemeProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const deviceScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [hasHydratedMode, setHasHydratedMode] = useState(false);
  const [systemScheme, setSystemScheme] = useState<
    Exclude<ColorSchemeName, null>
  >(resolveSystemScheme(deviceScheme));

  useEffect(() => {
    setSystemScheme(resolveSystemScheme(deviceScheme));
  }, [deviceScheme]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const storedMode = await getPreferenceString(PREFERENCE_KEYS.themeMode);

      if (isMounted && storedMode && isThemeMode(storedMode)) {
        setMode(storedMode);
      }

      if (isMounted) {
        setHasHydratedMode(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(resolveSystemScheme(colorScheme));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedMode) {
      return;
    }

    void setPreferenceString(PREFERENCE_KEYS.themeMode, mode);
  }, [hasHydratedMode, mode]);

  const toggleTheme = useCallback(() => {
    setMode(current => {
      const effective = current === 'system' ? systemScheme : current;
      return effective === 'dark' ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const theme = useMemo(() => createTheme(mode, systemScheme), [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () =>
      Object.freeze({
        theme,
        mode,
        setMode,
        toggleTheme,
      }),
    [theme, mode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider.');
  }

  return context;
}
