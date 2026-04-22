import AsyncStorage from '@react-native-async-storage/async-storage';

const RUNTIME_FLAG_PREFIX = 'tempo:flag:';

export const RUNTIME_FLAG_KEYS = Object.freeze({
  seededDemoData: 'seededDemoData',
} as const);

function key(name: string): string {
  return `${RUNTIME_FLAG_PREFIX}${name}`;
}

export async function getRuntimeFlag(name: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(key(name));
  return value === 'true';
}

export async function setRuntimeFlag(name: string, enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(key(name), String(enabled));
}

export async function clearRuntimeFlags(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const matchingKeys = keys.filter(item => item.startsWith(RUNTIME_FLAG_PREFIX));

  if (matchingKeys.length > 0) {
    await AsyncStorage.multiRemove(matchingKeys);
  }
}