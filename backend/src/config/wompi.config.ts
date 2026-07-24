import { registerAs } from '@nestjs/config';

export default registerAs('wompi', () => {
  const publicKey = process.env.WOMPI_PUBLIC_KEY ?? '';
  const isSandbox = publicKey.startsWith('pub_stag_');

  return {
    publicKey,
    privateKey: process.env.WOMPI_PRIVATE_KEY ?? '',
    integrityKey: process.env.WOMPI_INTEGRITY_KEY ?? '',
    apiUrl: process.env.WOMPI_API_URL ?? (isSandbox ? 'https://sandbox.wompi.co/v1' : 'https://api.wompi.co/v1'),
    redirectUrl: process.env.WOMPI_REDIRECT_URL ?? '',
  };
});
