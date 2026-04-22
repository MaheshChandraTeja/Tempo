import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';

type HistoryCalendarDay = Readonly<{
  date: string;
  totalWorkouts: number;
}>;

type HistoryCalendarProps = Readonly<{
  days: HistoryCalendarDay[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}>;

export function HistoryCalendar({
  days,
  selectedDate,
  onSelectDate,
}: HistoryCalendarProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (days.length === 0) {
    return (
      <AppCard>
        <Text style={styles.title}>History Dates</Text>
        <Text style={styles.emptyText}>No workout dates available yet.</Text>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <Text style={styles.title}>History Dates</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map(day => {
          const isSelected = day.date === selectedDate;

          return (
            <Pressable
              key={day.date}
              accessibilityRole="button"
              onPress={() => onSelectDate(day.date)}
              style={({ pressed }) => [
                styles.dayChip,
                isSelected && styles.dayChipSelected,
                pressed && styles.dayChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {formatDate(day.date, { preset: 'month-day' })}
              </Text>
              <Text
                style={[
                  styles.dayMeta,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {day.totalWorkouts} workout{day.totalWorkouts === 1 ? '' : 's'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.md,
    },
    emptyText: {
      ...typography.body,
      color: theme.colors.textSecondary,
    },
    scrollContent: {
      gap: spacing.sm,
      paddingRight: spacing.md,
    },
    dayChip: {
      minWidth: 108,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.xxs,
    },
    dayChipSelected: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    dayChipPressed: {
      opacity: 0.85,
    },
    dayLabel: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
    },
    dayMeta: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    dayLabelSelected: {
      color: '#FFFFFF',
    },
  });
}