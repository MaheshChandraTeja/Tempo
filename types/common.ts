export type ISODateString = string;
export type ISODateTimeString = string;
export type EntityId = string;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type ValueOf<T> = T[keyof T];

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type AsyncState<TData, TError = string> = Readonly<{
  status: AsyncStatus;
  data: TData | null;
  error: TError | null;
}>;

export type Result<TData, TError = string> =
  | Readonly<{ ok: true; data: TData }>
  | Readonly<{ ok: false; error: TError }>;

export type PermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export type CameraPermissionState = Readonly<{
  status: PermissionStatus;
  canAskAgain: boolean;
  isGranted: boolean;
  isDenied: boolean;
  isBlocked: boolean;
  isUnavailable: boolean;
}>;

export type WorkoutKind =
  | 'treadmill'
  | 'cycling'
  | 'elliptical'
  | 'strength'
  | 'walking'
  | 'running'
  | 'other';

export type WorkoutDraft = Readonly<{
  id: EntityId;
  kind: WorkoutKind;
  title: string;
  durationSeconds: number | null;
  calories: number | null;
  distanceKm: number | null;
  incline: number | null;
  speedKph: number | null;
  notes: string | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}>;

export type WorkoutEntry = WorkoutDraft &
  Readonly<{
    loggedAt: ISODateTimeString;
  }>;

export type TodaySummary = Readonly<{
  date: ISODateString;
  totalWorkouts: number;
  totalDurationSeconds: number;
  totalCalories: number;
  totalDistanceKm: number;
}>;

export type ScanMetricKey =
  | 'time'
  | 'distance'
  | 'calories'
  | 'speed'
  | 'incline'
  | 'heartRate';

export type ParsedScanMetric = Readonly<{
  key: ScanMetricKey;
  label: string;
  value: number | string;
  unit?: string;
}>;

export type TreadmillScanResult = Readonly<{
  id: EntityId;
  rawText: string;
  normalizedText: string;
  metrics: ParsedScanMetric[];
  capturedAt: ISODateTimeString;
}>;

export type TreadmillScanStatus =
  | 'idle'
  | 'preparing'
  | 'scanning'
  | 'success'
  | 'error';

export type WorkoutActionState = Readonly<{
  isSaving: boolean;
  isDeleting: boolean;
  isResetting: boolean;
  error: string | null;
}>;