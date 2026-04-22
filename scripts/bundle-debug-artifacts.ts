import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    DEV_BUNDLES_DIR,
    DEV_DB_PATH,
    DEV_DEBUG_DIR,
} from './reset-local-db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function listFilesRecursive(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function copyIntoBundle(sourceFiles: string[], bundleDir: string, rootDir: string): string[] {
  const copied: string[] = [];

  for (const sourcePath of sourceFiles) {
    const relativePath = path.relative(rootDir, sourcePath);
    const targetPath = path.join(bundleDir, 'debug-artifacts', relativePath);

    ensureDir(path.dirname(targetPath));
    fs.copyFileSync(sourcePath, targetPath);
    copied.push(targetPath);
  }

  return copied;
}

function main(): void {
  ensureDir(DEV_BUNDLES_DIR);

  const timestamp = buildTimestamp();
  const bundleDir = path.join(DEV_BUNDLES_DIR, `debug-bundle-${timestamp}`);

  ensureDir(bundleDir);

  const debugFiles = listFilesRecursive(DEV_DEBUG_DIR);
  const copiedDebugFiles = copyIntoBundle(debugFiles, bundleDir, DEV_DEBUG_DIR);

  let includedDbSnapshot: string | null = null;

  if (fs.existsSync(DEV_DB_PATH)) {
    const dbTarget = path.join(bundleDir, 'tempo.dev.sqlite');
    fs.copyFileSync(DEV_DB_PATH, dbTarget);
    includedDbSnapshot = dbTarget;
  }

  const manifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    source: 'tempo-debug-bundle',
    includedDbSnapshot,
    debugFiles: copiedDebugFiles,
  };

  fs.writeFileSync(
    path.join(bundleDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  console.log(`[tempo] debug bundle created at ${bundleDir}`);
  console.log(`[tempo] copied ${copiedDebugFiles.length} debug artifact file(s)`);
  if (includedDbSnapshot) {
    console.log('[tempo] included dev DB snapshot');
  }
}

try {
  main();
} catch (error) {
  console.error('[tempo] bundle-debug-artifacts failed');
  console.error(error);
  process.exit(1);
}