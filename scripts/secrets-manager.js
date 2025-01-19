// @ts-check
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const SECRETS_DIR = join(process.cwd(), 'secrets');

export function initializeSecrets() {
  if (!existsSync(SECRETS_DIR)) {
    mkdirSync(SECRETS_DIR, { recursive: true });
  }
}

export function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export function saveSecret(name, value) {
  const path = join(SECRETS_DIR, name.toLowerCase());
  writeFileSync(path, value, { mode: 0o600 });
}

export function loadSecret(name) {
  const path = join(SECRETS_DIR, name.toLowerCase());
  if (existsSync(path)) {
    return readFileSync(path, 'utf8').trim();
  }
  return null;
}

export function rotateSecret(name, length = 32) {
  const newValue = generateSecret(length);
  saveSecret(name, newValue);
  return newValue;
}