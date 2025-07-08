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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
