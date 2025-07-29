import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { UserType, OtpPurpose } from '@prisma/client';
import { SendOtpDto, VerifyOtpDto } from '../common/dto/auth.dto';

export interface JwtPayload {
  sub: string; // user ID or phone number
  phone: string;
  userType: UserType;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id?: number;
    phone: string;
    userType: UserType;
    isVerified: boolean;
    isNewUser: boolean;
    registrationStatus?: string;
  };
}

interface UserEntity {
  customer_id?: number;
  driver_id?: number;
  phone: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async sendGetStartedOtp(
    sendOtpDto: SendOtpDto,
  ): Promise<{ message: string; isNewUser: boolean }> {
    const { phone, userType } = sendOtpDto;

    // Check if user already exists
    const existingUser = await this.findUserByPhone(phone, userType);
    const isNewUser = !existingUser;

    const result = await this.otpService.generateAndSendOtp(
      phone,
      userType,
      isNewUser ? OtpPurpose.PHONE_VERIFICATION : OtpPurpose.LOGIN,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return {
      message: 'OTP sent successfully. Please check your phone.',
      isNewUser,
    };
  }

  async verifyGetStartedOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponse> {
    const { phone, otp, userType } = verifyOtpDto;

    // Check if user exists
    const existingUser = await this.findUserByPhone(phone, userType);
    const isNewUser = !existingUser;

    // Verify OTP with appropriate purpose
    const otpPurpose = isNewUser
      ? OtpPurpose.PHONE_VERIFICATION
      : OtpPurpose.LOGIN;
    const otpResult = await this.otpService.verifyOtp(
      phone,
      otp,
      userType,
      otpPurpose,
    );

    if (!otpResult.success) {
      throw new UnauthorizedException(otpResult.error);
    }

    let user = existingUser;

    if (isNewUser) {
      // Create new user
      if (userType === UserType.CUSTOMER) {
        user = await this.createCustomerUser(phone);
      } else if (userType === UserType.DRIVER) {
        user = await this.createDriverUser(phone);
      }
    }

    if (!user) {
      throw new UnauthorizedException('User creation failed');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: (user.customer_id || user.driver_id)?.toString() || '',
      phone: user.phone,
      userType,
      isVerified: true,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.customer_id || user.driver_id,
        phone: user.phone,
        userType,
        isVerified: true,
        isNewUser,
      },
    };
  }

  private async findUserByPhone(
    phone: string,
    userType: UserType,
  ): Promise<UserEntity | null> {
    if (userType === UserType.CUSTOMER) {
      return (await this.prisma.customer.findFirst({
        where: { phone: phone },
      })) as UserEntity | null;
    } else if (userType === UserType.DRIVER) {
      return (await this.prisma.driver.findFirst({
        where: { phone: phone },
      })) as UserEntity | null;
    }
    return null;
  }

  private async createCustomerUser(phone: string): Promise<UserEntity> {
    return (await this.prisma.customer.create({
      data: {
        firstName: '', // Will be updated later
        lastName: '',
        gender: 'Unspecified', // Default value
        phone: phone,
        status: 'ACTIVE',
        registrationStatus: 'OTP_VERIFIED',
      },
    })) as UserEntity;
  }

  private async createDriverUser(phone: string): Promise<UserEntity> {
    return (await this.prisma.driver.create({
      data: {
        name: '',
        phone: phone,
        status: 'ACTIVE',
        registrationStatus: 'OTP_VERIFIED',
        NIC: '',
        address: '',
        date_of_birth: new Date(),
        date_of_joining: new Date(),
        driver_license_back_url: '',
        driver_license_front_url: '',
        gender: '',
        nic_front_pic_url: '',
        nice_back_pic_url: '',
        profile_picture_url: '',
        second_phone: '',
        vehicle_Reg_No: '',
      },
    })) as UserEntity;
  }

  // Simple JWT utility methods (NestJS best practice)
  refreshToken(user: JwtPayload): { accessToken: string } {
    const payload: JwtPayload = {
      sub: user.sub,
      phone: user.phone,
      userType: user.userType,
      isVerified: user.isVerified,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Extended expiry for refresh
    });

    return { accessToken };
  }

  logout(user: JwtPayload): { message: string } {
    // Here you could implement token blacklisting if needed
    // For now, just return success since JWT tokens are stateless
    this.logger.log(`User ${user.phone} logged out`);

    return { message: 'Logged out successfully' };
  }
}
