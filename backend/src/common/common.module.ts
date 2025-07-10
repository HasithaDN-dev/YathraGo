import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './services/sms.service';
import { TwilioSmsGateway } from './services/twilio-sms-gateway.service';
import { DummySmsGateway } from './services/dummy-sms-gateway.service';
import { OtpService } from './services/otp.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    SmsService,
    TwilioSmsGateway,
    DummySmsGateway,
    OtpService,
  ],
  exports: [PrismaService, SmsService, OtpService],
})
export class CommonModule {}
