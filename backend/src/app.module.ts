import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [AuthModule, UserModule, DriverModule, VehicleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
