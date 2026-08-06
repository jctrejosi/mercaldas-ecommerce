import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary credentials not configured.');
      throw new Error('Cloudinary credentials are required');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.logger.log('Cloudinary service initialized successfully');
  }

  async uploadImage(
    file: any,
    productCode: string,
    options?: { trim?: boolean; removeBg?: boolean },
  ): Promise<{ url: string; mediaType: string }> {
    try {
      if (!cloudinary.config().cloud_name) {
        throw new Error('Cloudinary no configurado');
      }

      let buffer: Buffer = file.buffer;

      // 1. Quitar fondo (removeBg)
      if (options?.removeBg) {
        this.logger.log(`Quitando fondo de: ${file.originalname}`);
        const blob = await removeBackground(buffer, {
          model: 'medium',
          output: { format: 'image/png' },
        });
        buffer = Buffer.from(await blob.arrayBuffer());
        this.logger.log(`Fondo eliminado: ${file.originalname}`);
      }

      // 2. Auto-recortar (trim)
      if (options?.trim) {
        this.logger.log(`Recortando: ${file.originalname}`);
        buffer = await sharp(buffer)
          .trim({ threshold: 10 })
          .toBuffer();
        this.logger.log(`Imagen recortada: ${file.originalname}`);
      }

      // 3. Convertir a WebP sin pérdida de calidad
      const webpBuffer = await sharp(buffer)
        .webp({ lossless: true })
        .toBuffer();

      this.logger.log(
        `Imagen convertida a WebP: ${file.originalname} (${file.buffer.length} → ${webpBuffer.length} bytes)`,
      );

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `products/${productCode}`,
            public_id: `${productCode}_${Date.now()}`,
            use_filename: true,
            unique_filename: false,
            resource_type: 'image',
            format: 'webp',
            transformation: [{ quality: 'auto:good' }],
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            if (!result) {
              reject(new Error('Cloudinary no devolvió un resultado.'));
              return;
            }
            resolve(result);
          },
        );

        const stream = Readable.from(webpBuffer);
        stream.pipe(uploadStream);
      });

      const secureUrl = result.secure_url;
      this.logger.log(`Imagen WebP subida a Cloudinary: ${secureUrl}`);
      return { url: secureUrl, mediaType: 'image/webp' };
    } catch (error) {
      this.logger.error('Error subiendo a Cloudinary:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Error al subir imagen: ${message}`);
    }
  }
}
