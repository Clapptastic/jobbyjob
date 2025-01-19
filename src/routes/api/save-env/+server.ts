import { writeFile } from 'fs/promises';
import { join } from 'path';
import logger from '../../../lib/logger';
import type { RequestHandler } from '@sveltejs/kit';

const log = logger('SaveEnv');

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return new Response('Not allowed in production', { status: 403 });
    }

    const { content } = await request.json();
    if (!content) {
      return new Response('Missing content', { status: 400 });
    }

    // Write to .env file
    const envPath = join(process.cwd(), '.env');
    await writeFile(envPath, content, 'utf-8');
    log.info('Successfully wrote credentials to .env file');

    return new Response('OK', { status: 200 });
  } catch (error) {
    log.error('Failed to save .env file:', error);
    return new Response('Failed to save credentials', { status: 500 });
  }
}; 