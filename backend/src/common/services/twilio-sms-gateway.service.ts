import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SmsGateway } from '../interfaces/sms-gateway.interface';

@Injectable()
export class TwilioSmsGateway implements SmsGateway {
  private readonly logger = new Logger(TwilioSmsGateway.name);
  private twilioClient: Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const smsProvider = this.configService.get<string>('SMS_PROVIDER', 'dummy');

    // Only initialize Twilio if it's the selected provider
    if (smsProvider.toLowerCase() === 'twilio') {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      this.fromNumber =
        this.configService.get<string>('TWILIO_FROM_NUMBER') || '';

      if (!accountSid || !authToken || !this.fromNumber) {
        this.logger.warn('Twilio credentials not configured properly');
        return;
      }

      this.twilioClient = new Twilio(accountSid, authToken);
    } else {
      this.logger.log(
        'Twilio SMS Gateway initialized but not active (using different provider)',
      );
    }
  }

  async sendSms(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized - check credentials');
      }

      // Format phone number (ensure it starts with +)
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      const twilioMessage = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      this.logger.log(
        `SMS sent successfully to ${phone}, Message SID: ${twilioMessage.sid}`,
      );

      return {
        success: true,
        messageId: twilioMessage.sid,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}:`, error);

      // Handle specific Twilio trial account errors
      if (error.code === 21608) {
        return {
          success: false,
          error:
            'Trial account limitation: Phone number must be verified in Twilio console. Please verify your number at https://console.twilio.com/us1/develop/phone-numbers/manage/verified or use the dummy SMS provider for testing.',
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  }
}
