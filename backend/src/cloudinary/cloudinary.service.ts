import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const cloud_name = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = config.get<string>('CLOUDINARY_API_KEY');
    const api_secret = config.get<string>('CLOUDINARY_API_SECRET');

    this.configured = Boolean(cloud_name && api_key && api_secret);
    if (this.configured) {
      cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'Media uploads are not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET',
      );
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'fulltiime', resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'));
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  }
}
