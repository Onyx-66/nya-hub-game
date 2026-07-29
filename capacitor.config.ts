import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nyahub.app",
  appName: "Nya Hub",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;