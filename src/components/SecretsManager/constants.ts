import { Secret } from './types';

export const REQUIRED_SECRETS: Secret[] = [
  {
    name: 'Supabase URL',
    value: '',
    required: true,
    envKey: 'VITE_SUPABASE_URL',
    description: 'Your Supabase project URL',
    instructions: [
      'Go to Supabase Dashboard',
      'Select your project',
      'Go to Project Settings > API',
      'Copy Project URL'
    ],
    visible: false,
    validate: (value) => {
      try {
        const url = new URL(value);
        if (!url.protocol.startsWith('https:') || !url.hostname.endsWith('.supabase.co')) {
          return 'Must be a valid Supabase project URL';
        }
      } catch {
        return 'Must be a valid URL';
      }
    }
  },
  {
    name: 'Service Role Key',
    value: '',
    required: true,
    envKey: 'VITE_SUPABASE_SERVICE_ROLE_KEY',
    description: 'Admin API key for initial setup and database configuration',
    instructions: [
      'Go to Supabase Dashboard',
      'Select your project',
      'Go to Project Settings > API',
      'Copy service_role key',
      'Warning: Keep this key secure!'
    ],
    visible: false,
    validate: (value) => {
      if (!value.startsWith('eyJ')) {
        return 'Must be a valid Supabase service role key';
      }
    }
  },
  {
    name: 'Supabase Anon Key',
    value: '',
    required: true,
    envKey: 'VITE_SUPABASE_ANON_KEY',
    description: 'Public API key for client-side requests',
    instructions: [
      'Go to Supabase Dashboard',
      'Select your project',
      'Go to Project Settings > API',
      'Copy anon/public key'
    ],
    visible: false,
    validate: (value) => {
      if (!value.startsWith('eyJ')) {
        return 'Must be a valid Supabase anon key';
      }
    }
  },
  {
    name: 'OpenAI API Key',
    value: '',
    required: true,
    envKey: 'VITE_OPENAI_API_KEY',
    description: 'API key for AI-powered features like resume parsing and job matching',
    instructions: [
      'Go to OpenAI Dashboard',
      'Navigate to API Keys',
      'Create new secret key',
      'Copy the key (starts with sk-)'
    ],
    visible: false,
    validate: (value) => {
      if (!value.startsWith('sk-')) {
        return 'Must be a valid OpenAI API key';
      }
    }
  },
  {
    name: 'Admin Email',
    value: '',
    required: true,
    envKey: 'VITE_ADMIN_EMAIL',
    description: 'Email address for admin notifications and system alerts',
    instructions: [
      'Enter the email address that will receive:',
      '- Access request notifications',
      '- Error reports',
      '- System alerts'
    ],
    visible: true,
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Must be a valid email address';
      }
    }
  },
  {
    name: 'Email Provider',
    value: 'sendgrid',
    required: false,
    envKey: 'VITE_EMAIL_PROVIDER',
    description: 'Email service provider for sending notifications',
    instructions: [
      'Choose your preferred email provider:',
      '- SendGrid (recommended for high volume)',
      '- Mandrill (Mailchimp\'s transactional service)',
      '- Supabase (basic email functionality)'
    ],
    visible: true
  },
  {
    name: 'SendGrid API Key',
    value: '',
    required: false,
    envKey: 'VITE_SENDGRID_API_KEY',
    description: 'API key for SendGrid email service',
    instructions: [
      'Go to SendGrid Dashboard',
      'Navigate to Settings > API Keys',
      'Create new API key',
      'Copy the key (starts with SG.)'
    ],
    visible: false,
    validate: (value) => {
      if (value && !value.startsWith('SG.')) {
        return 'Must be a valid SendGrid API key';
      }
    }
  },
  {
    name: 'Mandrill API Key',
    value: '',
    required: false,
    envKey: 'VITE_MANDRILL_API_KEY',
    description: 'API key for Mandrill email service',
    instructions: [
      'Go to Mailchimp Dashboard',
      'Navigate to Transactional > Settings',
      'Create new API key',
      'Copy the key (starts with md-)'
    ],
    visible: false,
    validate: (value) => {
      if (value && !value.startsWith('md-')) {
        return 'Must be a valid Mandrill API key';
      }
    }
  }
];