export type FeatureFlags = Readonly<{
  enableExerciseLogging: boolean;
  enableCalorieTracking: boolean;
  enableTreadmillVisionScan: boolean;
  enableDeveloperDiagnostics: boolean;
}>;

export const featureFlags: FeatureFlags = Object.freeze({
  enableExerciseLogging: false,
  enableCalorieTracking: false,
  enableTreadmillVisionScan: false,
  enableDeveloperDiagnostics: __DEV__,
});