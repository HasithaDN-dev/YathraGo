import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from './sms.service';
import { UserType, OtpPurpose } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_MINUTES = 1;

  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async generateAndSendOtp(
    phone: string,
    userType: UserType,
    purpose: OtpPurpose = OtpPurpose.PHONE_VERIFICATION,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if there's a recent OTP request (cooldown period)
      const recentOtp = await this.prisma.otpCode.findFirst({
        where: {
          phone,
          userType,
          purpose,
          createdAt: {
            gte: new Date(
              Date.now() - this.RESEND_COOLDOWN_MINUTES * 60 * 1000,
            ),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentOtp && !recentOtp.isUsed) {
        const timeLeft = Math.ceil(
          (recentOtp.createdAt.getTime() +
            this.RESEND_COOLDOWN_MINUTES * 60 * 1000 -
            Date.now()) /
            1000,
        );
        if (timeLeft > 0) {
          return {
            success: false,
            error: `Please wait ${timeLeft} seconds before requesting a new OTP`,
          };
        }
      }

      // Invalidate any existing unused OTPs for this phone and purpose
      await this.prisma.otpCode.updateMany({
        where: {
          phone,
          userType,
          purpose,
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      });

      // Generate new 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
      );

      // --- Hashing OTP ---
      // For production, the OTP is hashed before storing.
      // For testing without a working SMS, you can comment out the hashing
      // and store the plain 'code' in the database.
      const hashedCode = await argon2.hash(code);

      // Store hashed OTP in database
      await this.prisma.otpCode.create({
        data: {
          phone,
          code: hashedCode, // For testing, change this value to 'code'
          userType,
          purpose,
          expiresAt,
        },
      });

      // Send OTP via SMS
      const smsResult = await this.smsService.sendOtp(phone, code);

      if (!smsResult.success) {
        this.logger.error(`Failed to send OTP to ${phone}: ${smsResult.error}`);
        return {
          success: false,
          error: 'Failed to send OTP. Please try again.',
        };
      }

      this.logger.log(
        `OTP sent successfully to ${phone} for ${userType} ${purpose}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(`Error generating OTP for ${phone}:`, error);
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      };
    }
  }

  async verifyOtp(
    phone: string,
    code: string,
    userType: UserType,
    purpose: OtpPurpose = OtpPurpose.PHONE_VERIFICATION,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // --- Verifying Hashed OTP ---
      // For production, we find all active OTPs and verify the hash.
      // For testing, you can replace this block with a direct database lookup
      // for the plain text 'code'.

      // Find all active OTPs for this phone/userType/purpose
      const otpRecords = await this.prisma.otpCode.findMany({
        where: {
          phone,
          userType,
          purpose,
          isUsed: false,
          expiresAt: {
            gt: new Date(), // Only get non-expired OTPs
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (otpRecords.length === 0) {
        return {
          success: false,
          error: 'Invalid or expired OTP code',
        };
      }

      // Try to verify the provided code against each stored hash
      let matchedOtpRecord: (typeof otpRecords)[0] | null = null;
      for (const otpRecord of otpRecords) {
        try {
          const isValid = await argon2.verify(otpRecord.code, code);
          if (isValid) {
            matchedOtpRecord = otpRecord;
            break;
          }
        } catch (verifyError) {
          // Continue to next record if hash verification fails
          this.logger.warn(
            `Hash verification failed for OTP record ${otpRecord.id}`,
          );
          continue;
        }
      }

      if (!matchedOtpRecord) {
        // Increment failed attempt count for security monitoring
        await this.incrementFailedAttempts(phone, userType, purpose);
        return {
          success: false,
          error: 'Invalid OTP code',
        };
      }

      // Check attempts limit
      if (matchedOtpRecord.attempts >= this.MAX_ATTEMPTS) {
        await this.prisma.otpCode.update({
          where: { id: matchedOtpRecord.id },
          data: { isUsed: true },
        });
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.',
        };
      }

      // Mark OTP as used (successful verification)
      await this.prisma.otpCode.update({
        where: { id: matchedOtpRecord.id },
        data: { isUsed: true },
      });

      this.logger.log(`OTP verified successfully for ${phone}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error verifying OTP for ${phone}:`, error);
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      };
    }
  }

  private async incrementFailedAttempts(
    phone: string,
    userType: UserType,
    purpose: OtpPurpose,
  ): Promise<void> {
    try {
      // Find the most recent unused OTP for this phone/userType/purpose
      const recentOtp = await this.prisma.otpCode.findFirst({
        where: {
          phone,
          userType,
          purpose,
          isUsed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentOtp) {
        await this.prisma.otpCode.update({
          where: { id: recentOtp.id },
          data: { attempts: recentOtp.attempts + 1 },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to increment attempts for ${phone}:`, error);
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    try {
      const result = await this.prisma.otpCode.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      this.logger.log(`Cleaned up ${result.count} expired OTP codes`);
    } catch (error) {
      this.logger.error('Error cleaning up expired OTPs:', error);
    }
  }
}
