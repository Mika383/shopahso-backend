import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

type UploadInput = {
  buffer: Buffer;
  folder: string;
  publicId: string;
  overwrite?: boolean;
};

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadBuffer(input: UploadInput) {
    return new Promise<{ secureUrl: string; publicId: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: input.folder,
            public_id: input.publicId,
            overwrite: input.overwrite ?? false,
            resource_type: 'image',
            format: 'webp',
          },
          (error, result) => {
            if (error || !result) {
              reject(
                new InternalServerErrorException('Cloudinary upload failed'),
              );
              return;
            }

            resolve({
              secureUrl: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        stream.end(input.buffer);
      },
    );
  }

  async destroy(publicId: string) {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    return result.result === 'ok' || result.result === 'not found';
  }
}
