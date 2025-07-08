import { Module } from '@nestjs/common';
import { AuthWebService } from './auth-web.service';
import { AuthWebController } from './auth-web.controller';


@Module({
 
  providers: [AuthWebService],
  controllers: [AuthWebController]
})
export class AuthWebModule {}
