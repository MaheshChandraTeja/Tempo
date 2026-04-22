export type PipelineStageName =
  | 'capture'
  | 'ocr'
  | 'parse'
  | 'score'
  | 'total';

export type PipelineStageMetric = Readonly<{
  stage: PipelineStageName;
  startedAtMs: number;
  endedAtMs: number;
  durationMs: number;
}>;

export type PipelineMetrics = Readonly<{
  startedAtMs: number;
  endedAtMs: number;
  totalDurationMs: number;
  stages: PipelineStageMetric[];
}>;

type MutableStage = {
  stage: PipelineStageName;
  startedAtMs: number;
  endedAtMs?: number;
};

export type PipelineMetricsTracker = Readonly<{
  start: (stage: PipelineStageName) => void;
  end: (stage: PipelineStageName) => void;
  finalize: () => PipelineMetrics;
}>;

export function createPipelineMetricsTracker(
  now: () => number = () => Date.now(),
): PipelineMetricsTracker {
  const runStartedAt = now();
  const activeStages = new Map<PipelineStageName, MutableStage>();
  const completedStages: PipelineStageMetric[] = [];

  function start(stage: PipelineStageName): void {
    if (activeStages.has(stage)) {
      return;
    }

    activeStages.set(stage, {
      stage,
      startedAtMs: now(),
    });
  }

  function end(stage: PipelineStageName): void {
    const active = activeStages.get(stage);

    if (!active) {
      return;
    }

    const endedAtMs = now();

    completedStages.push({
      stage,
      startedAtMs: active.startedAtMs,
      endedAtMs,
      durationMs: Math.max(endedAtMs - active.startedAtMs, 0),
    });

    activeStages.delete(stage);
  }

  function finalize(): PipelineMetrics {
    const endedAtMs = now();

    return {
      startedAtMs: runStartedAt,
      endedAtMs,
      totalDurationMs: Math.max(endedAtMs - runStartedAt, 0),
      stages: [...completedStages].sort(
        (left, right) => left.startedAtMs - right.startedAtMs,
      ),
    };
  }

  return Object.freeze({
    start,
    end,
    finalize,
  });
}