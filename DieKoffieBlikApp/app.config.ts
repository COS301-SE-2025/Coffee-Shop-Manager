import 'dotenv/config';

export default {
  expo: {
    name: 'MyApp',
    slug: 'my-app',
    version: '1.0.0',
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      ANON_KEY: process.env.ANON_KEY,
    },
  },
};
