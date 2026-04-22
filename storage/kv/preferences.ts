import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCE_PREFIX = 'tempo:pref:';

export const PREFERENCE_KEYS = Object.freeze({
  calorieGoalKcal: 'calorieGoalKcal',
  debugModeEnabled: 'debugModeEnabled',
} as const);

function key(name: string): string {
  return `${PREFERENCE_PREFIX}${name}`;
}

export async function getPreferenceString(name: string): Promise<string | null> {
  return AsyncStorage.getItem(key(name));
}

export async function setPreferenceString(
  name: string,
  value: string,
): Promise<void> {
  await AsyncStorage.setItem(key(name), value);
}

export async function getPreferenceBoolean(name: string): Promise<boolean | null> {
  const value = await getPreferenceString(name);

  if (value == null) {
    return null;
  }

  return value === 'true';
}

export async function setPreferenceBoolean(
  name: string,
  value: boolean,
): Promise<void> {
  await setPreferenceString(name, String(value));
}

export async function getPreferenceNumber(name: string): Promise<number | null> {
  const value = await getPreferenceString(name);

  if (value == null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setPreferenceNumber(
  name: string,
  value: number,
): Promise<void> {
  await setPreferenceString(name, String(value));
}

export async function clearPreferences(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const matchingKeys = keys.filter(item => item.startsWith(PREFERENCE_PREFIX));

  if (matchingKeys.length > 0) {
    await AsyncStorage.multiRemove(matchingKeys);
  }
}