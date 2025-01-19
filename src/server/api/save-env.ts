import express from 'express';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import logger from '../../lib/logger.js';

const router = express.Router();
const log = logger('SaveEnv');

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

router.post('/save-env', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Missing content' });
    }

    // Write to .env file
    const envPath = join(process.cwd(), '.env');
    await writeFile(envPath, content, 'utf-8');
    log.info('Successfully wrote credentials to .env file');

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    log.error('Failed to save .env file:', error);
    return res.status(500).json({ error: 'Failed to save credentials' });
  }
});

export default router; 