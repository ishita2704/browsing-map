import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import visitsRouter from './routes/visits.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
//setup express app, entry point , server config
const app = express();
const PORT = process.env.PORT || 3001; //port for the server
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({
  origin: [CORS_ORIGIN, /^chrome-extension:\/\//],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
}));
app.use(express.json({ limit: '16kb' })); //since the req payload small we can use 16kb limit ( urls only) 

const visitLimiter = rateLimit({ //rate limiting 
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many visit requests, please slow down' },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/visits', visitLimiter, visitsRouter); //routes protection 

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
}); //404 error handling

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}); 

app.listen(PORT, () => {
  console.log(`Browsing Map API running on http://localhost:${PORT}`);
}); 
