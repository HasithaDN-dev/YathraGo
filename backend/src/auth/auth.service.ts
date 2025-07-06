import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Twilio } from 'twilio';

@Injectable()
export class AuthService {
  private twilio = new Twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  constructor(private prisma: PrismaService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  }

  async requestOtp(phone: string) {
    const otp = this.generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Save OTP to DB
    await this.prisma.driver.updateMany({
      where: { phone },
      data: { otp, otpExpiresAt: expires },
    });

    // Send OTP via SMS
    await this.twilio.messages.create({
      body: `Your YathraGo OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return { message: 'OTP sent ✅' };
  }

  async verifyOtp(phone: string, otp: string) {
    const driver = await this.prisma.driver.findFirst({ where: { phone } });

    if (
      !driver ||
      driver.otp !== otp ||
      !driver.otpExpiresAt ||
      new Date() > driver.otpExpiresAt
    ) {
      throw new Error('Invalid or expired OTP 😢');
    }

    // Optional: Clear OTP after successful login
    await this.prisma.driver.updateMany({
      where: { phone },
      data: { otp: null, otpExpiresAt: null },
    });

    return { message: 'OTP verified ✅', driverId: driver.id };
  }
}
