import { Injectable, Logger } from '@nestjs/common';
import { SmsGateway } from '../interfaces/sms-gateway.interface';

@Injectable()
export class DummySmsGateway implements SmsGateway {
  private readonly logger = new Logger(DummySmsGateway.name);

  async sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Log the OTP instead of sending it for development/testing
    this.logger.log(`📱 SMS to ${phone}: ${message}`);
    this.logger.log(`🔢 OTP Code: ${this.extractOtpFromMessage(message)}`);
    
    // Simulate some delay like a real SMS service
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      messageId: `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private extractOtpFromMessage(message: string): string | null {
    // Extract OTP code from message (assuming it's a 6-digit number)
    const otpMatch = message.match(/\b\d{6}\b/);
    return otpMatch ? otpMatch[0] : null;
  }
}
