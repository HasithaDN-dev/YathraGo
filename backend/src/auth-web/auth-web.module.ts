import { Module } from '@nestjs/common';
import { AuthWebService } from './auth-web.service';
import { AuthWebController } from './auth-web.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';


@Module({
  imports:[JwtModule.register({})],
  providers: [AuthWebService,JwtStrategy],
  controllers: [AuthWebController]
})
export class AuthWebModule {}
