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
  };
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
    } else {
      // Update existing user as verified if needed
      user = await this.markUserAsVerified(
        user.customer_id || user.driver_id,
        userType,
      );
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.customer_id?.toString() || user.driver_id?.toString(),
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
  ): Promise<any> {
    if (userType === UserType.CUSTOMER) {
      return await this.prisma.customer.findFirst({
        where: { phone: phone },
      });
    } else if (userType === UserType.DRIVER) {
      return await this.prisma.driver.findFirst({
        where: { phone: phone },
      });
    }
    return null;
  }

  private async createCustomerUser(phone: string): Promise<any> {
    return await this.prisma.customer.create({
      data: {
        first_name: '', // Will be updated later
        last_name: '',
        email: '',
        phone: phone,
        otp: '',
        address: '',
        profileImageUrl: '',
        emergencyContact: '',
        status: 'ACTIVE',
      },
    });
  }

  private async createDriverUser(phone: string): Promise<any> {
    return await this.prisma.driver.create({
      data: {
        NIC: '',
        address: '',
        date_of_birth: new Date(),
        driver_license_back_url: '',
        driver_license_front_url: '',
        first_name: '',
        gender: '',
        last_name: '',
        nic_front_pic_url: '',
        nice_back_pic_url: '',
        phone: phone,
        profile_picture_url: '',
        second_phone: '',
        vehicle_Reg_No: '',
        email: '',
        status: 'ACTIVE',
      },
    });
  }

  private async markUserAsVerified(
    userId: number,
    userType: UserType,
  ): Promise<any> {
    if (userType === UserType.CUSTOMER) {
      return await this.prisma.customer.update({
        where: { customer_id: userId },
        data: { status: 'VERIFIED' },
      });
    } else if (userType === UserType.DRIVER) {
      return await this.prisma.driver.update({
        where: { driver_id: userId },
        data: { status: 'VERIFIED' },
      });
    }
    return null;
  }
}
