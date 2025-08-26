import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [OwnerService],
  controllers: [OwnerController],
  imports: [JwtModule.register({})],
})
export class OwnerModule {}
