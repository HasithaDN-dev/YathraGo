import { Body, Controller, Get, Post, Put, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Removed: Sending notification to CUSTOMER is not allowed. Only CHILD, STAFF, DRIVER can receive notifications.

  // Kept: Broadcast/family notification logic for children/staff is still allowed.

  @Get()
  getNotifications(
    @Query('receiver')
    receiver: 'CHILD' | 'STAFF' | 'DRIVER',
    @Query('receiverId') receiverId: string,
    @Query('duration') duration?: string,
  ) {
    return this.notificationsService.getNotifications(
      receiver,
      parseInt(receiverId, 10),
      duration ? parseInt(duration, 10) : undefined,
    );
  }
  // Update FCM token for a customer
  @Put('fcm-token/:customerId')
  async updateFcmToken(
    @Param('customerId') customerId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.notificationsService.updateCustomerFcmToken(
      parseInt(customerId, 10),
      fcmToken,
    );
  }
}
