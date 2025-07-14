import 'dotenv/config';

export default {
  expo: {
    name: "DieKoffieBlikApp",
    slug: "diekoffieblikapp",
    version: "1.0.0",
    scheme: "diekoffieblik",
    extra: {
      SUPABASE_ONLINE_URL: process.env.SUPABASE_ONLINE_URL,
      ONLINE_ANON_KEY: process.env.ONLINE_ANON_KEY,
    },
  },
};
