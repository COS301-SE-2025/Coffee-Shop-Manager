import 'dotenv/config';

export default {
  expo: {
    name: "your-app-name",
    slug: "your-app-slug",
    version: "1.0.0",
    extra: {
      SUPABASE_ONLINE_URL: process.env.SUPABASE_ONLINE_URL,
      ONLINE_ANON_KEY: process.env.ONLINE_ANON_KEY,
    },
  },
};
