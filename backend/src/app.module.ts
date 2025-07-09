import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { AuthWebModule } from './auth-web/auth-web.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { StaffPassengerModule } from './staff-passenger/staff-passenger.module';
import { ChildModule } from './child/child.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    PrismaModule,
    AuthModule,
    UserModule,
    DriverModule,
    VehicleModule,
    AuthWebModule,
    CustomerModule,
    StaffPassengerModule,
    ChildModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
