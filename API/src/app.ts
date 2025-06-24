import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// ✅ CORS config to allow frontend access with cookies
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend domain
  credentials: true                // Allow cookies to be sent
}));

app.use(express.json());

app.use(routes);

export default app;
