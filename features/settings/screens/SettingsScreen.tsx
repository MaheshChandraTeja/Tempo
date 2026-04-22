import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { Screen } from '@/components/common/Screen';
import { CameraPermissionRow } from '@/features/settings/components/CameraPermissionRow';
import { DataExportRow } from '@/features/settings/components/DataExportRow';
import { PrivacyCard } from '@/features/settings/components/PrivacyCard';
import {
  settingsStore,
  useSettingsState,
} from '@/features/settings/state/settings.store';
import { useWorkoutSelector, workoutActions } from '@/features/workout-log/state/workout.runtime';
import { selectAllWorkouts } from '@/features/workout-log/state/workout.selectors';
import { createBackupBundle } from '@/modules/export/backupBundle';
import {
  describeLocalOnlyBehavior,
  getLocalDataPolicySummary,
} from '@/modules/privacy/localDataPolicy';
import {
  auditPermissions,
  summarizePermissionAudit,
} from '@/modules/privacy/permissionAudit';
import {
  secureDeleteLocalData,
  summarizeSecureDeleteResult,
} from '@/modules/privacy/secureDelete';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { getScansRepository } from '@/storage/db/repositories/scans.repository';
import { getSummariesRepository } from '@/storage/db/repositories/summaries.repository';
import { PREFERENCE_KEYS, getPreferenceBoolean, setPreferenceBoolean } from '@/storage/kv/preferences';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function SettingsScreen(): React.JSX.Element {
  const { theme, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const settings = useSettingsState();
  const workouts = useWorkoutSelector(selectAllWorkouts);

  const [permissionAuditText, setPermissionAuditText] = useState<string>('Auditing permissions...');
  const policySummary = useMemo(() => getLocalDataPolicySummary(), []);

  const refreshPermissionAudit = useCallback(async () => {
    const audit = await auditPermissions();
    setPermissionAuditText(summarizePermissionAudit(audit));
  }, []);

  useEffect(() => {
    void (async () => {
      const enabled = await getPreferenceBoolean(PREFERENCE_KEYS.debugModeEnabled);

      if (enabled != null) {
        settingsStore.setDebugModeEnabled(enabled);
      }
    })();

    void refreshPermissionAudit();
  }, [refreshPermissionAudit]);

  const handleExport = async () => {
    settingsStore.startExport();

    try {
      const [summaries, scans] = await Promise.all([
        getSummariesRepository().listRecent(365),
        getScansRepository().listRecent(200),
      ]);

      const bundle = await createBackupBundle({
        workouts,
        summaries,
        scans,
        includeScans: true,
      });

      settingsStore.finishExport();

      Alert.alert(
        'Backup bundle created',
        `Backup directory created at:\n${bundle.directoryPath}`,
      );
    } catch (error) {
      settingsStore.failExport(
        error instanceof Error ? error.message : 'Failed to export local data.',
      );
    }
  };

  const handleClearLocalData = () => {
    Alert.alert(
      'Clear local data?',
      'This will remove local workouts, summaries, scans, cached images, debug artifacts, and preferences. This action is destructive and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            settingsStore.startClearLocalData();

            try {
              const result = await secureDeleteLocalData('all-local-data');

              workoutActions.resetState();
              settingsStore.finishClearLocalData();

              Alert.alert(
                result.ok ? 'Local data cleared' : 'Clear completed with warnings',
                summarizeSecureDeleteResult(result),
              );
            } catch (error) {
              settingsStore.failClearLocalData(
                error instanceof Error ? error.message : 'Failed to clear local data.',
              );
            }
          },
        },
      ],
    );
  };

  const handleDebugToggle = async (value: boolean) => {
    settingsStore.setDebugModeEnabled(value);
    await setPreferenceBoolean(PREFERENCE_KEYS.debugModeEnabled, value);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setMode(value ? 'dark' : 'light');
  };

  return (
    <Screen scrollable>
      <AppHeader
        title="Settings"
        subtitle="Privacy, permissions, local data controls, and export access."
      />

      <PrivacyCard />

      <AppCard>
        <Text style={styles.title}>{policySummary.title}</Text>
        <Text style={styles.description}>{describeLocalOnlyBehavior()}</Text>
      </AppCard>

      <CameraPermissionRow onChanged={refreshPermissionAudit} />

      <AppCard>
        <Text style={styles.title}>Permission Audit</Text>
        <Text style={styles.description}>{permissionAuditText}</Text>
      </AppCard>

      <DataExportRow
        isExporting={settings.isExporting}
        lastExportedAt={settings.lastExportedAt}
        onExportPress={handleExport}
      />

      <AppCard>
        <View style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.title}>Dark Mode</Text>
            <Text style={styles.description}>
              Switch the app between light and dark appearance for a calmer low-glare interface.
            </Text>
          </View>

          <Switch
            onValueChange={handleDarkModeToggle}
            value={theme.isDark}
          />
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.title}>Debug Mode</Text>
            <Text style={styles.description}>
              Enables additional local diagnostics for troubleshooting scan and storage issues.
            </Text>
          </View>

          <Switch
            onValueChange={handleDebugToggle}
            value={settings.debugModeEnabled}
          />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.title}>Local Data Governance</Text>
        <Text style={styles.description}>
          Tempo keeps user exercise data local by default. Sensitive scan metadata and cached images can be removed through explicit destructive flows.
        </Text>

        <View style={styles.actions}>
          <AppButton
            label="Clear Local Data"
            variant="danger"
            loading={settings.isClearingLocalData}
            onPress={handleClearLocalData}
            fullWidth
          />
        </View>
      </AppCard>

      {settings.error ? (
        <Text style={styles.errorText}>{settings.error}</Text>
      ) : null}
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    textWrap: {
      flex: 1,
      gap: spacing.xxs,
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    description: {
      ...typography.body,
      color: theme.colors.textSecondary,
    },
    actions: {
      marginTop: spacing.md,
    },
    errorText: {
      ...typography.caption,
      color: theme.colors.danger,
    },
  });
}
