// app.config.ts
import { ConfigContext, ExpoConfig } from "@expo/config";
import "dotenv/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Phase",
  slug: "phase-app",
  scheme: process.env.EXPO_PUBLIC_SCHEME || "phaseapp",

  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/phaselogo.png",

  userInterfaceStyle: "automatic", // light/dark mode
  platforms: ["ios", "android"],

  splash: {
    image: "./assets/images/phaselogo.png", // logo shown at launch
    resizeMode: "contain",                  // don't stretch the logo
    backgroundColor: "#FAFAFB",             // match your app background
  },

  ios: {
    bundleIdentifier: "com.nourassili.phaseapp",
    supportsTablet: true,
  },

  android: {
    package: "com.nourassili.phaseapp",
    adaptiveIcon: {
      foregroundImage: "./assets/images/phaselogo.png",
      backgroundColor: "#FAFAFB",
    },
  },

  extra: {
    // expose env vars here if you need them in the app
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
