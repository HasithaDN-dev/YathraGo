export interface SmsGateway {
  sendSms(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface SmsConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  provider: 'twilio' | 'dummy';
}
