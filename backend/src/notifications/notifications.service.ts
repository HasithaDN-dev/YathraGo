import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../common/services/firebase.service';
import {
  SendNotificationDto,
  GetNotificationsDto,
  MarkAsReadDto,
} from './dto/send-notification.dto';
import { UserTypes, NotificationTypes } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  /**
   * Send notification to a specific user
   */
  async sendNotification(dto: SendNotificationDto) {
    try {
      // Create notification in database
      const notification = await this.prisma.notification.create({
        data: {
          sender: dto.sender,
          message: dto.message,
          type: dto.type,
          receiver: dto.receiver,
          receiverId: dto.receiverId,
          isExpanded: dto.isExpanded || false,
        },
      });

      // Get FCM token based on user type
      const fcmToken = await this.getFcmToken(dto.receiver, dto.receiverId);

      // Send push notification if FCM token exists
      if (fcmToken) {
        await this.sendPushNotification({
          token: fcmToken,
          title: dto.sender,
          body: dto.message,
          data: {
            notificationId: notification.id.toString(),
            type: dto.type,
            receiverType: dto.receiver,
            receiverId: dto.receiverId.toString(),
            conversationId: dto.conversationId?.toString() || '',
          },
        });
      }

      return {
        success: true,
        notification,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send notification: ${message}`);
      throw error;
    }
  }

  /**
   * Get all notifications for a specific user
   */
  async getNotifications(dto: GetNotificationsDto) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          receiver: dto.userType,
          receiverId: dto.userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: notifications.length,
        notifications: notifications.map((n) => ({
          id: n.id,
          sender: n.sender,
          message: n.message,
          type: n.type,
          isExpanded: n.isExpanded,
          createdAt: n.createdAt,
          time: this.formatTime(n.createdAt),
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get notifications: ${message}`);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userType: UserTypes, userId: number) {
    try {
      const count = await this.prisma.notification.count({
        where: {
          receiver: userType,
          receiverId: userId,
          isExpanded: false,
        },
      });

      return {
        success: true,
        unreadCount: count,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get unread count: ${message}`);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(dto: MarkAsReadDto) {
    try {
      // Verify ownership
      const notification = await this.prisma.notification.findUnique({
        where: { id: dto.notificationId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (
        notification.receiver !== dto.userType ||
        notification.receiverId !== dto.userId
      ) {
        throw new ForbiddenException(
          'You do not have permission to mark this notification as read',
        );
      }

      const updated = await this.prisma.notification.update({
        where: { id: dto.notificationId },
        data: { isExpanded: true },
      });

      return {
        success: true,
        notification: updated,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to mark notification as read: ${message}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userType: UserTypes, userId: number) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          receiver: userType,
          receiverId: userId,
          isExpanded: false,
        },
        data: {
          isExpanded: true,
        },
      });

      return {
        success: true,
        updatedCount: result.count,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to mark all as read: ${message}`);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: number,
    userType: UserTypes,
    userId: number,
  ) {
    try {
      // Verify ownership
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (
        notification.receiver !== userType ||
        notification.receiverId !== userId
      ) {
        throw new ForbiddenException(
          'You do not have permission to delete this notification',
        );
      }

      await this.prisma.notification.delete({
        where: { id: notificationId },
      });

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete notification: ${message}`);
      throw error;
    }
  }

  /**
   * Update FCM token for a user
   */
  async updateFcmToken(userType: UserTypes, userId: number, fcmToken: string) {
    try {
      switch (userType) {
        case UserTypes.CUSTOMER:
          await this.prisma.customer.update({
            where: { customer_id: userId },
            data: { fcmToken },
          });
          break;

        case UserTypes.DRIVER:
          await this.prisma.driver.update({
            where: { driver_id: userId },
            data: { fcmToken },
          });
          break;

        case UserTypes.WEBUSER:
        case UserTypes.VEHICLEOWNER:
          await this.prisma.webuser.update({
            where: { id: userId },
            data: { fcmToken },
          });
          break;

        case UserTypes.BACKUPDRIVER:
          await this.prisma.backupDriver.update({
            where: { id: userId },
            data: { fcmToken },
          });
          break;

        case UserTypes.CHILD:
        case UserTypes.STAFF:
          this.logger.warn(
            `User type ${userType} does not support FCM tokens directly`,
          );
          throw new ForbiddenException(
            `User type ${userType} does not support FCM tokens`,
          );
      }

      return {
        success: true,
        message: 'FCM token updated successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update FCM token: ${message}`);
      throw error;
    }
  }

  /**
   * Send push notification for new chat message
   */
  async sendNewMessagePush(params: {
    senderName: string;
    messageText: string;
    receiverType: UserTypes;
    receiverId: number;
    conversationId: number;
  }): Promise<boolean> {
    const {
      senderName,
      messageText,
      receiverType,
      receiverId,
      conversationId,
    } = params;

    try {
      // Create notification
      await this.sendNotification({
        sender: senderName,
        message: messageText,
        type: NotificationTypes.Chat,
        receiver: receiverType,
        receiverId,
        conversationId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send message push:', error);
      return false;
    }
  }

  /**
   * Get FCM token based on user type
   */
  private async getFcmToken(
    userType: UserTypes,
    userId: number,
  ): Promise<string | null> {
    try {
      switch (userType) {
        case UserTypes.CUSTOMER: {
          const customer = await this.prisma.customer.findUnique({
            where: { customer_id: userId },
            select: { fcmToken: true },
          });
          return customer?.fcmToken || null;
        }

        case UserTypes.DRIVER: {
          const driver = await this.prisma.driver.findUnique({
            where: { driver_id: userId },
            select: { fcmToken: true },
          });
          return driver?.fcmToken || null;
        }

        case UserTypes.WEBUSER:
        case UserTypes.VEHICLEOWNER: {
          const webuser = await this.prisma.webuser.findUnique({
            where: { id: userId },
            select: { fcmToken: true },
          });
          return webuser?.fcmToken || null;
        }

        case UserTypes.BACKUPDRIVER: {
          const backupDriver = await this.prisma.backupDriver.findUnique({
            where: { id: userId },
            select: { fcmToken: true },
          });
          return backupDriver?.fcmToken || null;
        }

        case UserTypes.CHILD:
        case UserTypes.STAFF: {
          // Children and staff don't have FCM tokens, notifications go to their parent customer
          this.logger.warn(
            `User type ${userType} does not support direct FCM tokens`,
          );
          return null;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get FCM token for ${userType}:${userId}: ${message}`,
      );
      return null;
    }
  }

  /**
   * Send push notification via Firebase
   */
  private async sendPushNotification(payload: {
    token: string;
    title: string;
    body: string;
    data?: { [key: string]: string };
  }) {
    try {
      await this.firebase.sendToDevice(
        payload.token,
        payload.title,
        payload.body,
        payload.data || {},
      );
      this.logger.log(
        `Successfully sent push notification to token: ${payload.token.substring(0, 10)}...`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send push notification: ${message}`);
      throw error;
    }
  }

  /**
   * Format time to human-readable string
   */
  private formatTime(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
