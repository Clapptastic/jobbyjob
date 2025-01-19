import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      style: {
        background: 'var(--color-cyber-light)',
        color: '#fff',
        border: '1px solid var(--color-neon-cyan)'
      },
      iconTheme: {
        primary: 'var(--color-neon-cyan)',
        secondary: '#fff'
      }
    });
  },
  error: (message: string) => {
    hotToast.error(message, {
      style: {
        background: 'var(--color-cyber-light)',
        color: '#fff',
        border: '1px solid var(--color-neon-pink)'
      },
      iconTheme: {
        primary: 'var(--color-neon-pink)',
        secondary: '#fff'
      }
    });
  }
};