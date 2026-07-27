import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

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
    file: Express.Multer.File,
    productCode: string,
  ): Promise<string> {
    try {
      if (!cloudinary.config().cloud_name) {
        throw new Error('Cloudinary no configurado');
      }

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `products/${productCode}`,
            public_id: `${productCode}_${Date.now()}`,
            use_filename: true,
            unique_filename: false,
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
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

        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      });

      const secureUrl = result.secure_url;
      this.logger.log(`Imagen subida a Cloudinary: ${secureUrl}`);
      return secureUrl;
    } catch (error) {
      this.logger.error('Error subiendo a Cloudinary:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Error al subir imagen: ${message}`);
    }
  }
}
