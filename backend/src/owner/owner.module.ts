import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';

@Module({
  providers: [OwnerService],
  controllers: [OwnerController]
})
export class OwnerModule {}
