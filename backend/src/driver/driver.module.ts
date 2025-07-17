// src/driver/driver.module.ts
import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming PrismaService is in PrismaModule
import { AuthModule } from '../auth/auth.module'; // Ensure AuthModule is imported for JwtAuthGuard

@Module({
  imports: [
    PrismaModule,
    AuthModule, // Necessary for JwtAuthGuard
  ],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService], // Export DriverService if other modules need to inject it
})
export class DriverModule {}
