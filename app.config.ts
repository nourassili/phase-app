import type { ExpoConfig, ConfigContext } from 'expo/config';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Phase AI',
  slug: 'Thread',
  version: '1.0.0',
  scheme: 'phase',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.nourassili.phase',
  },
  android: {
    package: 'com.nourassili.phase',
    adaptiveIcon: {
      backgroundColor: '#120d14',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    apiUrl: API_URL,
    eas: {
      projectId: '65a00a1b-2870-4fbc-a6ce-0cbc578c2666',
    },
  },
});
