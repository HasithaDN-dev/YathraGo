import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../common/services/otp.service';
import { UserType, OtpPurpose, User, Customer } from '@prisma/client';
import { SendOtpDto, VerifyOtpDto } from '../common/dto/auth.dto';

export interface JwtPayload {
  sub: string; // user ID
  phone: string;
  userType: UserType;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    phone: string;
    userType: UserType;
    isVerified: boolean;
    isNewUser: boolean;
    registrationStatus?: string;
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


    let existingEntity;
    if (userType === UserType.CUSTOMER) {
      existingEntity = await this.prisma.customer.findUnique({ where: { phone } });
    } else if (userType === UserType.DRIVER) {
      existingEntity = await this.prisma.driver.findFirst({ where: { phone } });
    }

    const isNewUser = !existingEntity;

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


    // Always check for existing customer record
    let customer: Customer | null = await this.findEntityByPhone(phone, userType);
    const isNewUser: boolean = !customer;

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

    let entity: Customer | null = null;

    if (userType === UserType.CUSTOMER) {
      if (isNewUser) {
        // Create the customer record after OTP is verified
        customer = await this.createCustomer(phone);
        entity = customer;
      } else {
        entity = customer;
        if (customer && customer.registrationStatus === 'OTP_PENDING') {
          customer = await this.markCustomerAsVerified(customer.id);
          entity = customer;
        }
      }
    } else if (userType === UserType.DRIVER) {
      // For drivers, keep as any for now (or define a Driver type if you want)
      entity = await this.findEntityByPhone(phone, userType);
      // If you want to support driver creation, add logic here
    }

    if (!entity) {
      throw new UnauthorizedException('User not found or could not be created.');
    }

    const payload: JwtPayload = {
      sub: entity.id.toString(),
      phone: entity.phone,
      userType,
      isVerified: true,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: entity.id,
        phone: entity.phone,
        userType,
        isVerified: true,
        isNewUser,
        ...(customer && { registrationStatus: customer.registrationStatus }),
      },
    };
  }


  private async findEntityByPhone(
    phone: string,
    userType: UserType,
  ): Promise<any | null> {
    if (userType === UserType.CUSTOMER) {
      return this.prisma.customer.findUnique({ where: { phone } });
    } else if (userType === UserType.DRIVER) {
      return this.prisma.driver.findFirst({ where: { phone } });
    }
    return null;
  }

  private async createCustomer(phone: string): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        phone,
        name: '', // Will be updated later
        registrationStatus: 'OTP_VERIFIED',
      },
    });
  }

  // private async createCustomerWithUser(
  //   phone: string,
  // ): Promise<User & { customer: Customer | null }> {
  //   return this.prisma.user.create({
  //     data: {
  //       phone,
  //       customer: {
  //         create: {
  //           name: '', // Will be updated later
  //           registrationStatus: 'OTP_VERIFIED',
  //         },
  //       },
  //     },
  //     include: {
  //       customer: true,
  //     },
  //   });
  // }

  private async createDriverUser(phone: string): Promise<any> {
    return this.prisma.driver.create({
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
      },
    });
  }

  private async markCustomerAsVerified(customerId: number): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: { registrationStatus: 'OTP_VERIFIED' },
    });
  }
}
