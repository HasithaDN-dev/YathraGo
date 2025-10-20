import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ProfileModule, UsersModule],
  exports: [ProfileModule, UsersModule],
})
export class AdminModule {}
