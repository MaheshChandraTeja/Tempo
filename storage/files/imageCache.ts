import * as FileSystem from 'expo-file-system/legacy';

const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}tempo/images/`;

async function ensureDirectory(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

function buildImagePath(fileName: string): string {
  return `${IMAGE_CACHE_DIR}${fileName}`;
}

export async function ensureImageCacheDir(): Promise<string> {
  await ensureDirectory(IMAGE_CACHE_DIR);
  return IMAGE_CACHE_DIR;
}

export async function cacheImageFromUri(
  sourceUri: string,
  fileName: string,
): Promise<string> {
  await ensureImageCacheDir();

  const destination = buildImagePath(fileName);

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  return destination;
}

export async function listCachedImages(): Promise<string[]> {
  await ensureImageCacheDir();

  const items = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);
  return items.map(item => buildImagePath(item));
}

export async function clearImageCache(): Promise<void> {
  const info = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);

  if (!info.exists) {
    return;
  }

  await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
}