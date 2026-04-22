export type RealtimeAssistState =
  | 'idle'
  | 'starting'
  | 'running'
  | 'stopped'
  | 'error';

export type RealtimeAssistResult = Readonly<{
  state: RealtimeAssistState;
  message: string;
}>;

export type RealtimeAssistPipeline = Readonly<{
  start: () => Promise<RealtimeAssistResult>;
  stop: () => Promise<RealtimeAssistResult>;
  processNextFrame: () => Promise<RealtimeAssistResult>;
}>;

export function createRealtimeAssistPipeline(): RealtimeAssistPipeline {
  let currentState: RealtimeAssistState = 'idle';

  return Object.freeze({
    async start(): Promise<RealtimeAssistResult> {
      currentState = 'starting';

      currentState = 'running';

      return {
        state: currentState,
        message:
          'Realtime assist pipeline is reserved for a later module. Single-capture flow is active in v1.',
      };
    },

    async stop(): Promise<RealtimeAssistResult> {
      currentState = 'stopped';

      return {
        state: currentState,
        message: 'Realtime assist pipeline has been stopped.',
      };
    },

    async processNextFrame(): Promise<RealtimeAssistResult> {
      return {
        state: currentState,
        message:
          'Realtime frame assist is not implemented yet. Use the single-capture workflow.',
      };
    },
  });
}