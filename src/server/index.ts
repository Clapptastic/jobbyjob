import express from 'express';
import cors from 'cors';
import { createLogger } from '../lib/logger.js';
import { saveEnvRouter } from './routes/env.js';

const log = createLogger('Server');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', saveEnvRouter);

// Error handling
app.use((err, _req, res, _next) => {
  log.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(port, () => {
  log.info(`Server running on port ${port}`);
});

export { app, server }; 