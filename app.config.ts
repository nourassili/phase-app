// app.config.ts

import 'dotenv/config';

export default () => ({
  expo: {
    name: "Phase",
    slug: "phase-app",
    scheme: process.env.EXPO_PUBLIC_SCHEME || "phaseapp",
    platforms: ["ios", "android"],
    ios: {
      bundleIdentifier: "com.nourassili.phaseapp",
    },
    android: {
      package: "com.nourassili.phaseapp",
    },
  },
});
