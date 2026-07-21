import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EpaycoConfig } from '../../config';

@Injectable()
export class EpaycoService {
  constructor(private readonly configService: ConfigService) {}

  get config(): EpaycoConfig {
    return {
      publicKey: this.configService.get<string>('epayco.publicKey') ?? '',
      privateKey: this.configService.get<string>('epayco.privateKey') ?? '',
      apiUrl:
        this.configService.get<string>('epayco.apiUrl') ??
        'https://api-secure.epayco.co',
      checkoutUrl:
        this.configService.get<string>('epayco.checkoutUrl') ??
        'https://secure.payco.co/checkout.js',
      test: this.configService.get<boolean>('epayco.test') ?? true,
    };
  }

  getPublicConfig() {
    if (!this.config.publicKey) {
      throw new BadRequestException('ePayco public key no configurada');
    }

    return {
      publicKey: this.config.publicKey,
      checkoutUrl: this.config.checkoutUrl,
      test: this.config.test,
    };
  }

  async createCardToken(params: {
    cardNumber: string;
    expYear: string;
    expMonth: string;
    cvc: string;
    cardHolder: string;
  }) {
    if (!this.config.publicKey || !this.config.privateKey) {
      throw new BadRequestException('ePayco no está configurado correctamente');
    }

    const response = await fetch(`${this.config.apiUrl}/v1/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        public_key: this.config.publicKey,
        private_key: this.config.privateKey,
      },
      body: JSON.stringify({
        card: [
          params.cardNumber,
          params.expYear,
          params.expMonth,
          params.cvc,
          params.cardHolder,
        ],
      }),
    });

    const json = await response.json();

    if (!response.ok || json?.status === false) {
      throw new BadRequestException(
        json?.message ?? 'No se pudo tokenizar la tarjeta con ePayco',
      );
    }

    const data = json?.data ?? json;

    return {
      id: data?.token ?? data?.id,
      last4: data?.mask?.slice(-4) ?? params.cardNumber.slice(-4),
      brand:
        data?.franchise ?? data?.card_type ?? data?.bin ?? 'card',
      raw: data,
    };
  }

  async createCardCharge(params: {
    tokenCard: string;
    customerEmail: string;
    amount: number;
    tax: number;
    taxBase: number;
    description: string;
    invoice: string;
    installments: number;
    name: string;
    lastName?: string;
    address: string;
    phone: string;
    docType?: string;
    docNumber?: string;
    city: string;
  }) {
    if (!this.config.publicKey || !this.config.privateKey) {
      throw new BadRequestException('ePayco no está configurado correctamente');
    }

    const response = await fetch(`${this.config.apiUrl}/payment/v1/charge/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        public_key: this.config.publicKey,
        private_key: this.config.privateKey,
      },
      body: JSON.stringify({
        token_card: params.tokenCard,
        customer_email: params.customerEmail,
        doc_type: params.docType ?? 'CC',
        doc_number: params.docNumber ?? '2222222222',
        name: params.name,
        last_name: params.lastName ?? '',
        phone: params.phone,
        cell_phone: params.phone,
        bill: params.invoice,
        description: params.description,
        value: params.amount.toFixed(2),
        tax: params.tax.toFixed(2),
        tax_base: params.taxBase.toFixed(2),
        currency: 'cop',
        dues: String(params.installments),
        address: params.address,
        city: params.city,
        country: 'CO',
        test: this.config.test,
      }),
    });

    const json = await response.json();

    if (!response.ok || json?.status === false) {
      throw new BadRequestException(
        json?.message ?? json?.data?.respuesta ?? 'No se pudo crear el cobro con ePayco',
      );
    }

    return json?.data ?? json;
  }
}
