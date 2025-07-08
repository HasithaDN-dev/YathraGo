import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';

import { AuthWebModule } from './auth-web/auth-web.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, }), // Makes the configuration available globally
    AuthModule, UserModule, DriverModule, VehicleModule, AuthWebModule, PrismaModule],

import { StaffPassengerModule } from './staff-passenger/staff-passenger.module';
import { ChildModule } from './child/child.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Add PrismaModule here
    AuthModule,
    UserModule,
    DriverModule,
    VehicleModule,
    StaffPassengerModule,
    ChildModule,
  ],

  controllers: [AppController],
  providers: [AppService], // Remove PrismaService from here
})
export class AppModule {}
