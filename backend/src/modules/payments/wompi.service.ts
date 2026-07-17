import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import type { WompiConfig } from '../../config';

interface WompiMerchantResponse {
  data?: {
    presigned_acceptance?: {
      acceptance_token?: string;
      permalink?: string;
    };
    presigned_personal_data_auth?: {
      acceptance_token?: string;
      permalink?: string;
    };
  };
}

@Injectable()
export class WompiService {
  constructor(private readonly configService: ConfigService) {}

  get config(): WompiConfig {
    return {
      publicKey: this.configService.get<string>('wompi.publicKey') ?? '',
      privateKey: this.configService.get<string>('wompi.privateKey') ?? '',
      integrityKey: this.configService.get<string>('wompi.integrityKey') ?? '',
      apiUrl: this.configService.get<string>('wompi.apiUrl') ?? 'https://sandbox.wompi.co/v1',
      redirectUrl: this.configService.get<string>('wompi.redirectUrl') ?? '',
    };
  }

  async getAcceptanceData() {
    if (!this.config.publicKey) {
      throw new BadRequestException('Wompi public key no configurada');
    }

    const response = await fetch(
      `${this.config.apiUrl}/merchants/${this.config.publicKey}`,
    );

    if (!response.ok) {
      throw new BadRequestException('No se pudo obtener la configuración de Wompi');
    }

    const json = (await response.json()) as WompiMerchantResponse;

    return {
      publicKey: this.config.publicKey,
      redirectUrl: this.config.redirectUrl,
      acceptanceToken:
        json.data?.presigned_acceptance?.acceptance_token ?? null,
      acceptancePermalink: json.data?.presigned_acceptance?.permalink ?? null,
      personalDataAuthToken:
        json.data?.presigned_personal_data_auth?.acceptance_token ?? null,
      personalDataAuthPermalink:
        json.data?.presigned_personal_data_auth?.permalink ?? null,
    };
  }

  generateIntegritySignature(reference: string, amountInCents: number, currency: string) {
    if (!this.config.integrityKey) {
      throw new BadRequestException('Wompi integrity key no configurada');
    }

    return createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${this.config.integrityKey}`)
      .digest('hex');
  }

  async createCardTransaction(params: {
    amountInCents: number;
    customerEmail: string;
    reference: string;
    acceptanceToken: string;
    acceptPersonalAuth: string;
    cardToken: string;
    installments: number;
    customerData?: {
      phone_number?: string;
      full_name?: string;
    };
    redirectUrl?: string;
  }) {
    if (!this.config.privateKey) {
      throw new BadRequestException('Wompi private key no configurada');
    }

    const signature = this.generateIntegritySignature(
      params.reference,
      params.amountInCents,
      'COP',
    );

    const response = await fetch(`${this.config.apiUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acceptance_token: params.acceptanceToken,
        accept_personal_auth: params.acceptPersonalAuth,
        amount_in_cents: params.amountInCents,
        currency: 'COP',
        customer_email: params.customerEmail,
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          token: params.cardToken,
          installments: params.installments,
        },
        reference: params.reference,
        signature,
        redirect_url: params.redirectUrl || this.config.redirectUrl || undefined,
        customer_data: params.customerData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException(
        data?.error?.reason ?? data?.error?.messages ?? 'No se pudo crear la transacción con Wompi',
      );
    }

    return data?.data;
  }
}
