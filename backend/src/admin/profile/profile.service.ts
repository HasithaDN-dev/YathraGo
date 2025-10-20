import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(adminId: number) {
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
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async updateProfile(adminId: number, dto: UpdateProfileDto) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        permissions: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log activity
    await this.prisma.adminActivity.create({
      data: {
        adminId,
        action: 'UPDATE_PROFILE',
        module: 'PROFILE',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        details: {
          changes: dto,
        } as any,
        success: true,
      },
    });

    return admin;
  }

  async changePassword(adminId: number, dto: ChangePasswordDto) {
    // Get current admin with password
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Verify current password
    const passwordMatches = await argon.verify(
      admin.password,
      dto.currentPassword,
    );

    if (!passwordMatches) {
      // Log failed attempt
      await this.prisma.adminActivity.create({
        data: {
          adminId,
          action: 'CHANGE_PASSWORD',
          module: 'PROFILE',
          success: false,
          errorMessage: 'Invalid current password',
        },
      });

      throw new ForbiddenException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await argon.hash(dto.newPassword);

    // Update password
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
      },
    });

    // Log successful password change
    await this.prisma.adminActivity.create({
      data: {
        adminId,
        action: 'CHANGE_PASSWORD',
        module: 'PROFILE',
        success: true,
      },
    });

    // Optionally: Invalidate all sessions except current one
    // This forces admin to re-login on other devices
    await this.prisma.adminSession.updateMany({
      where: {
        adminId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return {
      message:
        'Password changed successfully. Please login again on all devices.',
    };
  }

  async getActivity(adminId: number, limit = 50) {
    const activities = await this.prisma.adminActivity.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        module: true,
        details: true,
        ipAddress: true,
        userAgent: true,
        success: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return activities;
  }
}
