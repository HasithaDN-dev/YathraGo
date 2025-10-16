import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Get()
  getNotifications(
    @Query('receiver')
    receiver:
      | 'CUSTOMER'
      | 'DRIVER'
      | 'WEBUSER'
      | 'VEHICLEOWNER'
      | 'BACKUPDRIVER',
    @Query('receiverId') receiverId: string,
    @Query('duration') duration?: string,
  ) {
    return this.notificationsService.getNotifications(
      receiver,
      parseInt(receiverId, 10),
      duration ? parseInt(duration, 10) : undefined,
    );
  }
}
