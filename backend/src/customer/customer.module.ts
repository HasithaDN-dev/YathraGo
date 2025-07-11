import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [CustomerService, PrismaService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
