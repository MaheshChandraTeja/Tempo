import { APP_DISPLAY_NAME, APP_NAME, APP_VERSION, BUILD_CHANNEL } from './constants';
import { featureFlags, type FeatureFlags } from './featureFlags';

export type Environment = 'development' | 'production';

export type AppConfig = Readonly<{
  appName: string;
  displayName: string;
  version: string;
  buildChannel: string;
  environment: Environment;
  isDev: boolean;
  isProduction: boolean;
  featureFlags: FeatureFlags;
}>;

const environment: Environment = __DEV__ ? 'development' : 'production';

export const appConfig: AppConfig = Object.freeze({
  appName: APP_NAME,
  displayName: APP_DISPLAY_NAME,
  version: APP_VERSION,
  buildChannel: BUILD_CHANNEL,
  environment,
  isDev: __DEV__,
  isProduction: !__DEV__,
  featureFlags,
});