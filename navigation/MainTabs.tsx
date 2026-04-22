import { icons } from '@/config/iconRegistry';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { HistoryStack } from '@/navigation/HistoryStack';
import { LogStack } from '@/navigation/LogStack';
import { ScanStack } from '@/navigation/ScanStack';
import {
  SETTINGS_ROUTES,
  TAB_ROUTES,
  type MainTabParamList,
  type SettingsStackParamList,
} from '@/navigation/routeTypes';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const Tabs = createBottomTabNavigator<MainTabParamList>();
const SettingsNativeStack = createNativeStackNavigator<SettingsStackParamList>();

function renderTabIcon(
  source: (typeof icons)[keyof typeof icons],
  size: number,
  color: string,
): React.JSX.Element {
  return (
    <Image
      source={source}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
}

function AppPreferencesScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>App Preferences</Text>
      <Text style={styles.subtitle}>
        Additional preferences can be wired here later.
      </Text>
    </View>
  );
}

function PermissionsCenterScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Permissions Center</Text>
      <Text style={styles.subtitle}>
        Extended permission controls can be wired here later.
      </Text>
    </View>
  );
}

function SettingsStack(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <SettingsNativeStack.Navigator
      initialRouteName={SETTINGS_ROUTES.SETTINGS_HOME}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <SettingsNativeStack.Screen
        name={SETTINGS_ROUTES.SETTINGS_HOME}
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsNativeStack.Screen
        name={SETTINGS_ROUTES.APP_PREFERENCES}
        component={AppPreferencesScreen}
        options={{ title: 'App Preferences' }}
      />
      <SettingsNativeStack.Screen
        name={SETTINGS_ROUTES.PERMISSIONS_CENTER}
        component={PermissionsCenterScreen}
        options={{ title: 'Permissions Center' }}
      />
    </SettingsNativeStack.Navigator>
  );
}

export function MainTabs(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Tabs.Navigator
      initialRouteName={TAB_ROUTES.LOG_STACK}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name={TAB_ROUTES.LOG_STACK}
        component={LogStack}
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color }) =>
            renderTabIcon(icons.tabToday, size, color),
        }}
      />
      <Tabs.Screen
        name={TAB_ROUTES.SCAN_STACK}
        component={ScanStack}
        options={{
          title: 'Scan',
          tabBarIcon: ({ size, color }) =>
            renderTabIcon(icons.tabScan, size, color),
        }}
      />
      <Tabs.Screen
        name={TAB_ROUTES.HISTORY_STACK}
        component={HistoryStack}
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) =>
            renderTabIcon(icons.tabHistory, size, color),
        }}
      />
      <Tabs.Screen
        name={TAB_ROUTES.SETTINGS_STACK}
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) =>
            renderTabIcon(icons.tabSettings, size, color),
        }}
      />
    </Tabs.Navigator>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 24,
      gap: 12,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textSecondary,
    },
  });
}
