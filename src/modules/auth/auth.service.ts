import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthConfigService } from './auth-config.service';
import { JwtUserPayload } from './auth.types';

type RegisterUserInput = {
  fullName: string;
  dateOfBirth: Date;
  email: string;
  phoneNumber?: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async bootstrapAdmin(email: string, password: string, bootstrapKey: string) {
    this.assertBootstrapKey(bootstrapKey);

    const adminCount = await this.prisma.user.count({
      where: { role: AppRole.ADMIN },
    });

    if (adminCount > 0) {
      throw new ForbiddenException('Bootstrap admin is no longer available');
    }

    const normalizedEmail = this.normalizeEmail(email);
    const passwordHash = await this.hashSecret(password);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: AppRole.ADMIN,
        active: true,
      },
    });

    return this.issueAuthTokens(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthTokens(user.id, user.email, user.role, true);
  }

  async register(input: RegisterUserInput) {
    const normalizedEmail = this.normalizeEmail(input.email);
    const normalizedPhone = input.phoneNumber?.trim() || null;
    const passwordHash = await this.hashSecret(input.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        dateOfBirth: input.dateOfBirth,
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        passwordHash,
        role: AppRole.USER,
        active: true,
      },
    });

    return this.issueAuthTokens(user.id, user.email, user.role, true);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.active || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueAuthTokens(user.id, user.email, user.role, true);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
      },
    });

    return { success: true };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        email: true,
        phoneNumber: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async issueAuthTokens(
    userId: string,
    email: string,
    role: AppRole,
    updateLoginState = false,
  ) {
    const accessPayload: JwtUserPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    const refreshPayload: JwtUserPayload = {
      ...accessPayload,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.authConfigService.accessSecret,
        expiresIn: this.authConfigService.accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.authConfigService.refreshSecret,
        expiresIn: this.authConfigService.refreshExpiresIn,
      }),
    ]);

    const refreshTokenHash = await this.hashSecret(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash,
        ...(updateLoginState ? { lastLoginAt: new Date() } : {}),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
      },
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtUserPayload>(
        refreshToken,
        {
          secret: this.authConfigService.refreshSecret,
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async hashSecret(secret: string) {
    return argon2.hash(secret, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  private assertBootstrapKey(receivedKey: string) {
    const expected = Buffer.from(this.authConfigService.bootstrapAdminKey);
    const received = Buffer.from(receivedKey ?? '');

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new ForbiddenException('Invalid bootstrap key');
    }
  }
}
