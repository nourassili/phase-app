import type { ExpoConfig, ConfigContext } from 'expo/config';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Thread',
  slug: 'Thread',
  version: '1.0.0',
  scheme: 'thread',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.thread.nucleus',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.thread.nucleus',
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
      projectId: '4b32ae84-c681-4e8c-b9a7-196babed7464',
    },
  },
});
