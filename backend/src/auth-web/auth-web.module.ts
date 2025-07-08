import { Module } from '@nestjs/common';
import { AuthWebService } from './auth-web.service';
import { AuthWebController } from './auth-web.controller';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports:[JwtModule.register({})],
  providers: [AuthWebService],
  controllers: [AuthWebController]
})
export class AuthWebModule {}
