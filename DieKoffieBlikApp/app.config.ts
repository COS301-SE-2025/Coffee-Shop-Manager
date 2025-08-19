import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "DieKoffieBlikApp",
  slug: "diekoffieblikapp",
  version: "1.0.0",
  scheme: "diekoffieblik",
  extra: {
    SUPABASE_PUBLIC_URL:
      process.env.SUPABASE_PUBLIC_URL || process.env.SUPABASE_ONLINE_URL,
    SERVICE_ROLE_KEY: process.env.SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ||
      process.env.ONLINE_ANON_KEY ||
      process.env.ANON_KEY,
  },
  plugins: ["expo-router", "expo-web-browser"],
});
