import type {
    HistoryStackParamList,
    LogStackParamList,
    MainTabParamList,
    RootStackParamList,
    ScanStackParamList,
    SettingsStackParamList,
} from '@/navigation/routeTypes';

export type AppRootParamList = RootStackParamList;
export type AppTabParamList = MainTabParamList;
export type AppLogParamList = LogStackParamList;
export type AppScanParamList = ScanStackParamList;
export type AppHistoryParamList = HistoryStackParamList;
export type AppSettingsParamList = SettingsStackParamList;

export type RouteName<TParamList> = Extract<keyof TParamList, string>;

export type RouteParams<
  TParamList,
  TRouteName extends keyof TParamList,
> = TParamList[TRouteName];

export type NavigationIntent<
  TParamList,
  TRouteName extends keyof TParamList,
> = Readonly<{
  name: TRouteName;
  params: TParamList[TRouteName];
}>;

export type RootNavigationIntent<
  TRouteName extends keyof AppRootParamList,
> = NavigationIntent<AppRootParamList, TRouteName>;

export type TabNavigationIntent<
  TRouteName extends keyof AppTabParamList,
> = NavigationIntent<AppTabParamList, TRouteName>;