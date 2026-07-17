import { registerAs } from '@nestjs/config';

export default registerAs('wompi', () => ({
  publicKey: process.env.WOMPI_PUBLIC_KEY ?? '',
  privateKey: process.env.WOMPI_PRIVATE_KEY ?? '',
  integrityKey: process.env.WOMPI_INTEGRITY_KEY ?? '',
  apiUrl: process.env.WOMPI_API_URL ?? 'https://sandbox.wompi.co/v1',
  redirectUrl: process.env.WOMPI_REDIRECT_URL ?? '',
}));
