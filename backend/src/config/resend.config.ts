import { registerAs } from '@nestjs/config';
import { ResendConfig } from './types';

export default registerAs(
  'resend',
  (): ResendConfig => ({
    apiKey: process.env.RESEND_API_KEY || '',
    senderEmail:
      process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev',
  }),
);
