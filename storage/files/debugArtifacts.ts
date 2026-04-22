import * as FileSystem from 'expo-file-system/legacy';

const DEBUG_DIR = `${FileSystem.documentDirectory}tempo/debug/`;

async function ensureDirectory(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

export async function writeDebugArtifact(
  fileName: string,
  content: string | object,
): Promise<string> {
  await ensureDirectory(DEBUG_DIR);

  const targetPath = `${DEBUG_DIR}${fileName}`;
  const body =
    typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  await FileSystem.writeAsStringAsync(targetPath, body, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return targetPath;
}

export async function listDebugArtifacts(): Promise<string[]> {
  await ensureDirectory(DEBUG_DIR);
  const files = await FileSystem.readDirectoryAsync(DEBUG_DIR);

  return files.map(file => `${DEBUG_DIR}${file}`);
}

export async function clearDebugArtifacts(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DEBUG_DIR);

  if (!info.exists) {
    return;
  }

  await FileSystem.deleteAsync(DEBUG_DIR, { idempotent: true });
}