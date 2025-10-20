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
import { TransactionsModule } from './transactions/transactions.module';
import { DriverRouteModule } from './driver-route/driver-route.module';
import { CityModule } from './city/city.module';
import { ChildRideRequestModule } from './child-ride-request/child-ride-request.module';
import { ChatModule } from './chat/chat.module';
import { FindVehicleModule } from './find-vehicle/find-vehicle.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { DriverRequestModule } from './driver-request/driver-request.module';
import { DriverLocationModule } from './driver-location/driver-location.module';

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
    TransactionsModule,
    ChildRideRequestModule,
    DriverRouteModule,
    CityModule,
    ChatModule,
    FindVehicleModule,
    SearchModule,
    NotificationsModule,
    DriverRequestModule,
    DriverLocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
