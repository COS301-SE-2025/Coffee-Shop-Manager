import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import * as dotenv from 'dotenv';
import path from 'path';

const app = express();

// Load environment variables based on NODE_ENV or default to development
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
dotenv.config({
  path: path.resolve(__dirname, `../../${envFile}`)
});

const origins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow no origins
        return callback(null, true);
      } else if (origins.includes(origin)) {
        // Allowed origins
        callback(null, true);
      } else {
        // Deny origin
        console.warn(`CORS denied for origin: ${origin}`);
        callback(new Error("Denied by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(routes);

export default app;
