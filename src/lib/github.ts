import { createLogger } from './debugUtils';

const logger = createLogger('GitHub');

interface GitHubSecret {
  name: string;
  value: string;
}

export const github = {
  async verifyCredentials(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to verify GitHub credentials:', error);
      return false;
    }
  },

  async addSecret(
    username: string,
    repo: string,
    secret: GitHubSecret,
    token: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/actions/secrets/${secret.name}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            encrypted_value: btoa(secret.value),
            key_id: process.env.GITHUB_KEY_ID
          })
        }
      );

      return response.ok;
    } catch (error) {
      logger.error(`Failed to add secret ${secret.name}:`, error);
      return false;
    }
  },

  async getPublicKey(
    username: string,
    repo: string,
    token: string
  ): Promise<{ key_id: string; key: string } | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/actions/secrets/public-key`,
        {
          headers: {
            Authorization: `token ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get public key');
      }

      return response.json();
    } catch (error) {
      logger.error('Failed to get public key:', error);
      return null;
    }
  }
};