import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsGateway } from '../interfaces/sms-gateway.interface';
import Client from 'android-sms-gateway';

@Injectable()
export class SmsGateSmsGateway implements SmsGateway {
  private readonly logger = new Logger(SmsGateSmsGateway.name);
  private smsGateClient: Client;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const smsProvider = this.configService.get<string>('SMS_PROVIDER', 'dummy');

    // Only initialize SMS-Gate if it's the selected provider
    if (smsProvider.toLowerCase() === 'smsgate') {
      const baseUrl = this.configService.get<string>('SMSGATE_BASE_URL');
      const username = this.configService.get<string>('SMSGATE_USERNAME');
      const password = this.configService.get<string>('SMSGATE_PASSWORD');

      if (!baseUrl || !username || !password) {
        this.logger.warn('SMS-Gate credentials not configured properly');
        this.logger.warn(
          'Required environment variables: SMSGATE_BASE_URL, SMSGATE_USERNAME, SMSGATE_PASSWORD',
        );
        return;
      }

      try {
        // Create a simple HTTP client for the official package
        const httpClient = this.createHttpClient();

        this.smsGateClient = new Client(
          username,
          password,
          httpClient,
          baseUrl,
        );
        this.isConfigured = true;
        this.logger.log('SMS-Gate client initialized successfully');

        // Test connection on startup
        this.testConnection().catch(() => {
          // Silent fail - health check issues don't affect SMS functionality
        });
      } catch (error) {
        this.logger.error('Failed to initialize SMS-Gate client:', error);
      }
    } else {
      // SMS-Gate not selected as provider - no logging needed
    }
  }

  private createHttpClient() {
    const makeRequest = async (url: string, options: RequestInit) => {
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    };

    return {
      async get(url: string, headers?: Record<string, string>) {
        return makeRequest(url, { method: 'GET', headers });
      },
      async post(url: string, body: any, headers?: Record<string, string>) {
        return makeRequest(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        });
      },
      async put(url: string, body: any, headers?: Record<string, string>) {
        return makeRequest(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        });
      },
      async patch(url: string, body: any, headers?: Record<string, string>) {
        return makeRequest(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        });
      },
      async delete(url: string, headers?: Record<string, string>) {
        return makeRequest(url, { method: 'DELETE', headers });
      },
    };
  }

  private async testConnection(): Promise<void> {
    try {
      if (!this.smsGateClient) return;
      
      const health = await this.smsGateClient.getHealth();
      if (!health?.status) return;

      if (health.status === 'pass') {
        this.logger.log('SMS-Gate connection test successful');
      } else if (health.status === 'fail') {
        const checks = health.checks || {};
        const cellular = checks['connection:cellular']?.status === 'pass';
        const messages = checks['messages:failed']?.status === 'pass';
        
        if (cellular && messages) {
          this.logger.log('SMS-Gate connected (cellular ready)');
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('HTTP 500') && error?.message?.includes('connection:status')) {
        this.logger.log('SMS-Gate connected (cellular ready)');
      }
      // Silent fail for other errors
    }
  }

  async sendSms(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.isConfigured || !this.smsGateClient) {
        throw new Error('SMS-Gate client not initialized - check credentials');
      }

      // Get SIM number configuration (1 or 2 for dual SIM devices)
      const simNumber = this.configService.get<number>('SMSGATE_SIM_NUMBER');
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // Prepare message payload
      const messagePayload = {
        message,
        phoneNumbers: [formattedPhone],
        ...(simNumber && { simNumber }),
      };

      // Send SMS using SMS-Gate API
      const response = await this.smsGateClient.send(messagePayload);

      if (response?.id) {
        this.logger.log(`SMS sent successfully to ${phone}, Message ID: ${response.id}`);
        return { success: true, messageId: response.id };
      } else {
        this.logger.error(`SMS failed to send to ${phone}`);
        return { success: false, error: 'Invalid response from SMS-Gate' };
      }
    } catch (error: any) {
      this.logger.error(`SMS send failed to ${phone}: ${error.message}`);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  private getErrorMessage(error: any): string {
    const msg = error.message || '';
    
    if (msg.includes('fetch') || msg.includes('ECONNREFUSED')) {
      return 'Network error: Unable to connect to SMS-Gate server';
    }
    if (msg.includes('401') || msg.includes('unauthorized')) {
      return 'Authentication failed: Check SMS-Gate credentials';
    }
    if (msg.includes('HTTP 400')) {
      return 'Bad request: Check phone number or message format';
    }
    if (msg.includes('HTTP 404')) {
      return 'SMS-Gate API endpoint not found';
    }
    if (msg.includes('HTTP 500')) {
      return 'SMS-Gate server error';
    }
    
    return msg || 'Failed to send SMS via SMS-Gate';
  }
}
