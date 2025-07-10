import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsGateway } from '../interfaces/sms-gateway.interface';
import { TwilioSmsGateway } from './twilio-sms-gateway.service';
import { DummySmsGateway } from './dummy-sms-gateway.service';
import { SmsGateSmsGateway } from './smsgate-sms-gateway.service';

@Injectable()
export class SmsService {
  private gateway: SmsGateway;

  constructor(
    private configService: ConfigService,
    private twilioGateway: TwilioSmsGateway,
    private dummyGateway: DummySmsGateway,
    private smsGateGateway: SmsGateSmsGateway,
  ) {
    // Determine which gateway to use based on configuration
    const provider = this.configService.get<string>('SMS_PROVIDER', 'dummy');

    switch (provider.toLowerCase()) {
      case 'twilio':
        this.gateway = this.twilioGateway;
        break;
      case 'smsgate':
        this.gateway = this.smsGateGateway;
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
    // Format OTP with spaces between every 2 digits (e.g., "123456" becomes "12 34 56")
    const formattedOtp = otp.replace(/(.{2})/g, '$1 ').trim();
    const message = `Your YathraGo verification code: ${formattedOtp}. Expires in 10 min. Don't share.`;
    return this.gateway.sendSms(phone, message);
  }

  async sendSms(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.gateway.sendSms(phone, message);
  }
}
