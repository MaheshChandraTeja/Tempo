import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Screen } from '@/components/common/Screen';
import { selectCurrentScanSession, selectScanDebugEnabled } from '@/features/scan/state/scan.selectors';
import { useScanSelector } from '@/features/scan/state/scan.store';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function ScanDebugScreen(): React.JSX.Element {
  const session = useScanSelector(selectCurrentScanSession);
  const debugEnabled = useScanSelector(selectScanDebugEnabled);

  if (!debugEnabled) {
    return (
      <Screen scrollable>
        <AppHeader
          title="Scan Debug"
          subtitle="Debug information is disabled."
        />
        <EmptyState
          title="Debug disabled"
          description="Enable debug mode in settings to inspect scan details."
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Scan Debug"
        subtitle="Pipeline diagnostics and raw session details."
      />

      <AppCard>
        <Text style={styles.sectionTitle}>Session</Text>
        <Text style={styles.codeBlock}>{JSON.stringify(session, null, 2)}</Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  codeBlock: {
    ...typography.caption,
  },
});