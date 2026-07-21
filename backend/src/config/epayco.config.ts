import { registerAs } from '@nestjs/config';

export default registerAs('epayco', () => ({
  publicKey: process.env.EPAYCO_PUBLIC_KEY ?? '',
  privateKey: process.env.EPAYCO_PRIVATE_KEY ?? '',
  apiUrl: process.env.EPAYCO_API_URL ?? 'https://api-secure.epayco.co',
  checkoutUrl:
    process.env.EPAYCO_CHECKOUT_URL ?? 'https://secure.payco.co/checkout.js',
  test: (process.env.EPAYCO_TEST ?? 'true').toLowerCase() === 'true',
}));
