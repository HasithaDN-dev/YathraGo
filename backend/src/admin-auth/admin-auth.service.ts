import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto, AdminRegisterDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AdminLoginDto, ipAddress?: string, userAgent?: string) {
    // Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // Verify password
    const passwordMatches = await argon.verify(admin.password, dto.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.signToken(admin.id, admin.email);

    // Create admin session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours

    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token: token.access_token,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    // Log admin activity
    await this.prisma.adminActivity.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        module: 'AUTH',
        ipAddress,
        userAgent,
        success: true,
      },
    });

    return {
      access_token: token.access_token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        permissions: admin.permissions,
      },
    };
  }

  async register(dto: AdminRegisterDto) {
    // Hash password
    const hashedPassword = await argon.hash(dto.password);

    try {
      // Create admin
      const admin = await this.prisma.admin.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          permissions: dto.permissions || [],
        },
      });

      return {
        message: 'Admin created successfully',
        id: admin.id,
        email: admin.email,
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
  }

  async logout(adminId: number, token: string) {
    // Deactivate session
    await this.prisma.adminSession.updateMany({
      where: {
        adminId,
        token,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Log activity
    await this.prisma.adminActivity.create({
      data: {
        adminId,
        action: 'LOGOUT',
        module: 'AUTH',
        success: true,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async getMe(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return admin;
  }

  async getSessions(adminId: number) {
    const sessions = await this.prisma.adminSession.findMany({
      where: {
        adminId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  }

  async revokeSession(adminId: number, sessionId: number) {
    await this.prisma.adminSession.updateMany({
      where: {
        id: sessionId,
        adminId, // Ensure admin can only revoke their own sessions
      },
      data: {
        isActive: false,
      },
    });

    return { message: 'Session revoked successfully' };
  }

  private async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role: 'ADMIN',
    };

    const jwtSecret =
      this.config.get<string>('ADMIN_JWT_SECRET') ||
      this.config.get<string>('WEB_JWT_SECRET') ||
      'fallback-secret';

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '8h',
      secret: jwtSecret,
    });

    return {
      access_token: token,
    };
  }
}
