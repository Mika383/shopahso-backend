import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { StringValue } from 'ms';

@Injectable()
export class AuthConfigService {
  get accessSecret(): string {
    return this.readRequired('JWT_ACCESS_SECRET');
  }

  get refreshSecret(): string {
    return this.readRequired('JWT_REFRESH_SECRET');
  }

  get accessExpiresIn() {
    return (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as StringValue;
  }

  get refreshExpiresIn() {
    return (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue;
  }

  get bootstrapAdminKey(): string {
    return this.readRequired('BOOTSTRAP_ADMIN_KEY');
  }

  private readRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured`);
    }

    return value;
  }
}
