import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsGateway } from '../interfaces/sms-gateway.interface';
import { TwilioSmsGateway } from './twilio-sms-gateway.service';
import { DummySmsGateway } from './dummy-sms-gateway.service';

@Injectable()
export class SmsService {
  private gateway: SmsGateway;

  constructor(
    private configService: ConfigService,
    private twilioGateway: TwilioSmsGateway,
    private dummyGateway: DummySmsGateway,
  ) {
    // Determine which gateway to use based on configuration
    const provider = this.configService.get<string>('SMS_PROVIDER', 'dummy');

    switch (provider.toLowerCase()) {
      case 'twilio':
        this.gateway = this.twilioGateway;
        break;
      case 'dummy':
      default:
        this.gateway = this.dummyGateway;
        break;
    }
  }

  async sendOtp(
    phone: string,
    otp: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `Your YathraGo verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    return this.gateway.sendSms(phone, message);
  }

  async sendSms(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.gateway.sendSms(phone, message);
  }
}
