import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '@/config/constants';
import { TodayScreen } from '@/features/home/screens/TodayScreen';
import { EditWorkoutScreen } from '@/features/workout-log/screens/EditWorkoutScreen';
import { LogWorkoutScreen } from '@/features/workout-log/screens/LogWorkoutScreen';
import { WorkoutDetailScreen } from '@/features/workout-log/screens/WorkoutDetailScreen';
import type { LogStackParamList } from '@/navigation/routeTypes';
import { LOG_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { withOpacity } from '@/theme/colorUtils';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const Stack = createNativeStackNavigator<LogStackParamList>();

function HomeStackHeader(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView edges={['top']} style={styles.homeHeaderSafeArea}>
      <View style={styles.homeHeader}>
        <View style={[styles.homeHeaderGlow, styles.homeHeaderGlowPrimary]} />
        <View style={[styles.homeHeaderGlow, styles.homeHeaderGlowSecondary]} />

        <View style={styles.homeHeaderContent}>
          <View style={styles.homeHeaderTopRow}>
            <View style={styles.homeHeaderPill}>
              <View style={styles.homeHeaderDot} />
              <Text style={styles.homeHeaderPillText}>Local-first fitness</Text>
            </View>

            <View style={styles.homeHeaderBadge}>
              <MaterialIcons
                name="lock-outline"
                size={14}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.homeHeaderBadgeText}>On-device</Text>
            </View>
          </View>

          <View style={styles.homeHeaderTitleRow}>
            <Text style={styles.homeHeaderTitle}>{APP_NAME}</Text>
            <View style={styles.homeHeaderAccent} />
          </View>

          <Text style={styles.homeHeaderSubtitle}>
            Calm workout tracking and treadmill scans without the usual dashboard clutter.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function LogStack(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName={LOG_ROUTES.TODAY_HOME}
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
      <Stack.Screen
        name={LOG_ROUTES.TODAY_HOME}
        component={TodayScreen}
        options={{
          header: () => <HomeStackHeader />,
        }}
      />
      <Stack.Screen
        name={LOG_ROUTES.LOG_WORKOUT}
        component={LogWorkoutScreen}
        options={{ title: 'Log Workout' }}
      />
      <Stack.Screen
        name={LOG_ROUTES.WORKOUT_DETAIL}
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <Stack.Screen
        name={LOG_ROUTES.EDIT_WORKOUT}
        component={EditWorkoutScreen}
        options={{ title: 'Edit Workout' }}
      />
    </Stack.Navigator>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    homeHeaderSafeArea: {
      backgroundColor: theme.colors.surface,
    },
    homeHeader: {
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: withOpacity(theme.colors.border, 0.9),
    },
    homeHeaderGlow: {
      position: 'absolute',
      borderRadius: radius.pill,
    },
    homeHeaderGlowPrimary: {
      width: 180,
      height: 180,
      top: -88,
      right: -56,
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.18 : 0.1),
    },
    homeHeaderGlowSecondary: {
      width: 140,
      height: 140,
      bottom: -84,
      left: -64,
      backgroundColor: withOpacity(theme.colors.textPrimary, theme.isDark ? 0.06 : 0.035),
    },
    homeHeaderContent: {
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
    homeHeaderTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    homeHeaderPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.68 : 0.86),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.85),
    },
    homeHeaderDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    homeHeaderPillText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontWeight: '700',
    },
    homeHeaderBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.16 : 0.09),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.accent, 0.2),
    },
    homeHeaderBadgeText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    homeHeaderTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    homeHeaderTitle: {
      ...typography.display,
      color: theme.colors.textPrimary,
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -0.6,
    },
    homeHeaderAccent: {
      width: 12,
      height: 12,
      marginBottom: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.accent,
    },
    homeHeaderSubtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      maxWidth: '88%',
      lineHeight: 23,
    },
  });
}
