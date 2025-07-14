import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected successfully');
  }

  enableShutdownHooks(app: INestApplication) {
    // Type assertion to avoid TS error for $on and ensure callback returns void
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    (this as any).$on?.('beforeExit', async () => {
      console.log('🔄 Graceful shutdown: Closing Prisma connections...');
      await this.$disconnect();
      // Use void to explicitly ignore the returned promise
      void app.close();
    });
  }
}
