import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export const ROOT_ROUTES = {
  MAIN_TABS: 'MainTabs',
} as const;

export const TAB_ROUTES = {
  LOG_STACK: 'LogStack',
  SCAN_STACK: 'ScanStack',
  HISTORY_STACK: 'HistoryStack',
  SETTINGS_STACK: 'SettingsStack',
} as const;

export const LOG_ROUTES = {
  TODAY_HOME: 'TodayHome',
  LOG_WORKOUT: 'LogWorkout',
  WORKOUT_DETAIL: 'WorkoutDetail',
  EDIT_WORKOUT: 'EditWorkout',
} as const;

export const SCAN_ROUTES = {
  SCAN_HOME: 'ScanHome',
  TREADMILL_SCAN: 'TreadmillScan',
  SCAN_REVIEW: 'ScanReview',
  SCAN_DEBUG: 'ScanDebug',
} as const;

export const HISTORY_ROUTES = {
  HISTORY_HOME: 'HistoryHome',
  DAY_LOG: 'DayLog',
  TRENDS: 'Trends',
  WORKOUT_DETAIL: 'WorkoutDetail',
} as const;

export const SETTINGS_ROUTES = {
  SETTINGS_HOME: 'SettingsHome',
  APP_PREFERENCES: 'AppPreferences',
  PERMISSIONS_CENTER: 'PermissionsCenter',
} as const;

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  LogStack: NavigatorScreenParams<LogStackParamList>;
  ScanStack: NavigatorScreenParams<ScanStackParamList>;
  HistoryStack: NavigatorScreenParams<HistoryStackParamList>;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
};

export type LogStackParamList = {
  TodayHome: undefined;
  LogWorkout: {
    dateISO?: string;
  } | undefined;
  WorkoutDetail: {
    workoutId: string;
  };
  EditWorkout: {
    workoutId: string;
  };
};

export type ScanStackParamList = {
  ScanHome: undefined;
  TreadmillScan: {
    sessionId?: string;
  } | undefined;
  ScanReview: {
    scanId: string;
  };
  ScanDebug: undefined;
};

export type HistoryStackParamList = {
  HistoryHome: undefined;
  DayLog: {
    date: string;
  };
  Trends: undefined;
  WorkoutDetail: {
    workoutId: string;
  };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AppPreferences: undefined;
  PermissionsCenter: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type LogStackScreenProps<T extends keyof LogStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<LogStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'LogStack'>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type ScanStackScreenProps<T extends keyof ScanStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ScanStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'ScanStack'>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type HistoryStackScreenProps<T extends keyof HistoryStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HistoryStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'HistoryStack'>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'SettingsStack'>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type LogRouteProp<T extends keyof LogStackParamList> = RouteProp<
  LogStackParamList,
  T
>;

export type ScanRouteProp<T extends keyof ScanStackParamList> = RouteProp<
  ScanStackParamList,
  T
>;

export type HistoryRouteProp<T extends keyof HistoryStackParamList> = RouteProp<
  HistoryStackParamList,
  T
>;

export type SettingsRouteProp<T extends keyof SettingsStackParamList> = RouteProp<
  SettingsStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}