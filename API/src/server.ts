import app from './app';

// Logging for env vars
const requiredEnvVars = 
[
  'ALLOWED_ORIGINS',
  'NEXT_PUBLIC_API_URL',
  'SUPABASE_PUBLIC_URL',
  'SUPABASE_PRIVATE_KEY'
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`API: Environment variable ${key} not set!`);
  }
});

const DEFAULT_PORT = 5000;
const port = process.env.API_PORT ?? DEFAULT_PORT;

const host = process.env.PUBLIC_API_URL || `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`API running at ${host}`);
});
