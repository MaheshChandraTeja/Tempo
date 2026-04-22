import { getScansRepository } from '@/storage/db/repositories/scans.repository';
import { getSettingsRepository } from '@/storage/db/repositories/settings.repository';
import { getSummariesRepository } from '@/storage/db/repositories/summaries.repository';
import { getWorkoutsRepository } from '@/storage/db/repositories/workouts.repository';
import { clearDebugArtifacts } from '@/storage/files/debugArtifacts';
import { clearImageCache } from '@/storage/files/imageCache';
import { clearPreferences } from '@/storage/kv/preferences';
import { clearRuntimeFlags } from '@/storage/kv/runtimeFlags';

export type SecureDeleteScope =
  | 'all-local-data'
  | 'scan-data-only'
  | 'debug-only'
  | 'preferences-only';

export type SecureDeleteStep = Readonly<{
  name: string;
  ok: boolean;
  message: string;
}>;

export type SecureDeleteResult = Readonly<{
  ok: boolean;
  scope: SecureDeleteScope;
  startedAt: string;
  finishedAt: string;
  steps: SecureDeleteStep[];
}>;

async function runStep(
  name: string,
  action: () => Promise<void>,
): Promise<SecureDeleteStep> {
  try {
    await action();

    return {
      name,
      ok: true,
      message: `${name} cleared successfully.`,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      message:
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : `${name} failed to clear.`,
    };
  }
}

export async function secureDeleteLocalData(
  scope: SecureDeleteScope,
): Promise<SecureDeleteResult> {
  const startedAt = new Date().toISOString();
  const steps: SecureDeleteStep[] = [];

  if (scope === 'all-local-data') {
    steps.push(await runStep('workouts', () => getWorkoutsRepository().clear()));
    steps.push(await runStep('daily summaries', () => getSummariesRepository().clear()));
    steps.push(await runStep('scan sessions', () => getScansRepository().clear()));
    steps.push(await runStep('settings table', () => getSettingsRepository().clear()));
    steps.push(await runStep('scan image cache', clearImageCache));
    steps.push(await runStep('debug artifacts', clearDebugArtifacts));
    steps.push(await runStep('preferences', clearPreferences));
    steps.push(await runStep('runtime flags', clearRuntimeFlags));
  }

  if (scope === 'scan-data-only') {
    steps.push(await runStep('scan sessions', () => getScansRepository().clear()));
    steps.push(await runStep('scan image cache', clearImageCache));
  }

  if (scope === 'debug-only') {
    steps.push(await runStep('debug artifacts', clearDebugArtifacts));
  }

  if (scope === 'preferences-only') {
    steps.push(await runStep('preferences', clearPreferences));
    steps.push(await runStep('runtime flags', clearRuntimeFlags));
    steps.push(await runStep('settings table', () => getSettingsRepository().clear()));
  }

  const finishedAt = new Date().toISOString();

  return {
    ok: steps.every(step => step.ok),
    scope,
    startedAt,
    finishedAt,
    steps,
  };
}

export function summarizeSecureDeleteResult(
  result: SecureDeleteResult,
): string {
  const failedSteps = result.steps.filter(step => !step.ok);

  if (failedSteps.length === 0) {
    return `Secure delete completed for scope "${result.scope}".`;
  }

  return `Secure delete completed with failures in: ${failedSteps
    .map(step => step.name)
    .join(', ')}.`;
}