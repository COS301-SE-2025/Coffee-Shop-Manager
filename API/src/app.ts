import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(routes);

export default app;
