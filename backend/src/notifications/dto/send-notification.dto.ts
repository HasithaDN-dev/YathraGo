import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum InputNotificationType {
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
  OTHER = 'OTHER',
  CHAT = 'CHAT',
}

export enum InputReceiverType {
  CUSTOMER = 'CUSTOMER',
  CHILD = 'CHILD',
  STAFF = 'STAFF',
  DRIVER = 'DRIVER',
  WEBUSER = 'WEBUSER',
  VEHICLEOWNER = 'VEHICLEOWNER',
  BACKUPDRIVER = 'BACKUPDRIVER',
}

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  sender!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(InputNotificationType)
  type!: InputNotificationType;

  @IsEnum(InputReceiverType)
  receiver!: InputReceiverType;

  @IsInt()
  receiverId!: number;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
