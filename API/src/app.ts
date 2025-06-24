import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // ✅ Import this
import routes from './routes';

const app = express();

// ✅ CORS config to allow frontend access with cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser()); // ✅ Parse incoming cookies

app.use(express.json()); // ✅ Parse JSON bodies

app.use(routes); // ✅ Register routes

export default app;
