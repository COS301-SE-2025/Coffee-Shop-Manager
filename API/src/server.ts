import app from './app';

const DEFAULT_PORT = 5000;

const port = process.env.API_PORT ?? DEFAULT_PORT;

if (!process.env.PORT) {
  console.log(`PORT not found in .env, defaulting to ${DEFAULT_PORT}`);
}

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
