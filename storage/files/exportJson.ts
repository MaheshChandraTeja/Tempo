import * as FileSystem from 'expo-file-system/legacy';

const EXPORT_DIR = `${FileSystem.documentDirectory}tempo/exports/`;

async function ensureDirectory(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

function buildTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export async function exportJsonBundle<TData>(
  payload: TData,
  prefix = 'tempo-export',
): Promise<string> {
  await ensureDirectory(EXPORT_DIR);

  const path = `${EXPORT_DIR}${prefix}-${buildTimestamp()}.json`;

  await FileSystem.writeAsStringAsync(
    path,
    JSON.stringify(payload, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 },
  );

  return path;
}