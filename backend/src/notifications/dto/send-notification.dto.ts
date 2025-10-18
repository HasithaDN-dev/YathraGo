import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { UserTypes, NotificationTypes } from '@prisma/client';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  sender!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(NotificationTypes)
  @IsNotEmpty()
  type!: NotificationTypes;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  receiver!: UserTypes;

  @IsInt()
  @IsNotEmpty()
  receiverId!: number;

  @IsOptional()
  @IsInt()
  conversationId?: number;

  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;
}

export class GetNotificationsDto {
  @IsEnum(UserTypes)
  @IsNotEmpty()
  userType!: UserTypes;

  @IsInt()
  @IsNotEmpty()
  userId!: number;
}

export class MarkAsReadDto {
  @IsInt()
  @IsNotEmpty()
  notificationId!: number;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  userType!: UserTypes;

  @IsInt()
  @IsNotEmpty()
  userId!: number;
}
