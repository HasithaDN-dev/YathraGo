import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../common/services/firebase.service';
import {
  NotificationTypes,
  UserTypes,
  Prisma,
  Notification as PrismaNotification,
} from '@prisma/client';

type SendNotificationInput = {
  sender: string;
  message: string;
  type: 'SYSTEM' | 'ALERT' | 'OTHER' | 'CHAT';
  receiver:
    | 'CUSTOMER'
    | 'CHILD'
    | 'STAFF'
    | 'DRIVER'
    | 'WEBUSER'
    | 'VEHICLEOWNER'
    | 'BACKUPDRIVER';
  receiverId: number;
  data?: Record<string, string>;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  // Store/update FCM token for customers
  async updateCustomerFcmToken(customerId: number, fcmToken: string) {
    try {
      await this.prisma.customer.update({
        where: { customer_id: customerId },
        data: { fcmToken },
      });
      return { success: true, message: 'FCM token updated successfully' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: 'Failed to update FCM token',
        error: errorMessage,
      };
    }
  }

  // Generic notification sender used elsewhere in the app
  async sendNotification(dto: SendNotificationInput) {
    // Only allow CHILD, STAFF, DRIVER as receiver
    const allowedTypes = ['CHILD', 'STAFF', 'DRIVER'];
    if (!allowedTypes.includes(dto.receiver)) {
      throw new Error(
        'Only CHILD, STAFF, and DRIVER can receive notifications.',
      );
    }
    const type = this.mapType(dto.type);
    const receiver = this.mapReceiver(dto.receiver);

    // 1) Save to DB
    const notification = await this.prisma.notification.create({
      data: {
        sender: dto.sender,
        message: dto.message,
        type,
        receiver,
        receiverId: dto.receiverId,
      },
    });

    // 2) Get receiver FCM token
    const fcmToken = await this.getReceiverToken(dto.receiver, dto.receiverId);

    // 3) Send Firebase push
    if (fcmToken) {
      await this.firebase.sendToDevice(fcmToken, dto.sender, dto.message, {
        type: String(type),
        id: String(notification.id),
        ...(dto.data ?? {}),
      });
    }

    return notification;
  }

  // Fetch notifications for a receiver (optionally within last X minutes)
  async getNotifications(
    receiver:
      | 'CUSTOMER'
      | 'CHILD'
      | 'STAFF'
      | 'DRIVER'
      | 'WEBUSER'
      | 'VEHICLEOWNER'
      | 'BACKUPDRIVER',
    receiverId: number,
    durationMinutes?: number,
  ) {
    const where: Prisma.NotificationWhereInput = {
      receiver: this.mapReceiver(receiver),
      receiverId,
    };
    if (durationMinutes && durationMinutes > 0) {
      const since = new Date(Date.now() - durationMinutes * 60 * 1000);
      where.createdAt = { gte: since };
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => ({
      id: n.id,
      sender: n.sender,
      message: n.message,
      type: String(n.type).toLowerCase(),
      isExpanded: n.isExpanded,
      time: this.formatTime(n.createdAt),
    }));
  }

  // Send notification to customer and all their profiles (children + staff)
  async sendNotificationToCustomerFamily(
    customerId: number,
    sender: string,
    message: string,
    type: 'SYSTEM' | 'ALERT' | 'OTHER' | 'CHAT',
  ) {
    // Explicitly type the notifications array
    const notifications: PrismaNotification[] = [];
    const notifType = this.mapType(type);

    // 1. Send to customer
    const customerNotification = await this.prisma.notification.create({
      data: {
        sender,
        message,
        type: notifType,
        receiver: UserTypes.CUSTOMER,
        receiverId: customerId,
      },
    });
    notifications.push(customerNotification);

    // Get customer's FCM token for push
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      select: { fcmToken: true },
    });
    if (customer?.fcmToken) {
      await this.firebase.sendToDevice(customer.fcmToken, sender, message, {
        type: String(notifType),
        id: String(customerNotification.id),
      });
    }

    // 2. Get all children of this customer
    const children = await this.prisma.child.findMany({
      where: { customerId },
      select: { child_id: true },
    });

    // Send to each child
    for (const child of children) {
      const childNotification = await this.prisma.notification.create({
        data: {
          sender,
          message,
          type: notifType,
          receiver: UserTypes.CHILD,
          receiverId: child.child_id,
        },
      });
      notifications.push(childNotification);

      // Use same FCM token as customer (same device)
      if (customer?.fcmToken) {
        await this.firebase.sendToDevice(customer.fcmToken, sender, message, {
          type: String(notifType),
          id: String(childNotification.id),
        });
      }
    }

    // 3. Get staff passenger if exists
    const staffPassenger = await this.prisma.staff_Passenger.findUnique({
      where: { customerId },
      select: { id: true },
    });

    if (staffPassenger) {
      const staffNotification = await this.prisma.notification.create({
        data: {
          sender,
          message,
          type: notifType,
          receiver: UserTypes.STAFF,
          receiverId: staffPassenger.id,
        },
      });
      notifications.push(staffNotification);

      // Use same FCM token as customer (same device)
      if (customer?.fcmToken) {
        await this.firebase.sendToDevice(customer.fcmToken, sender, message, {
          type: String(notifType),
          id: String(staffNotification.id),
        });
      }
    }

    return notifications;
  }

  // Send push for a new chat message and store it as a Notification (type Chat)
  async sendNewMessagePush(params: {
    senderName: string;
    messageText: string;
    receiverType:
      | 'CUSTOMER'
      | 'CHILD'
      | 'STAFF'
      | 'DRIVER'
      | 'WEBUSER'
      | 'VEHICLEOWNER'
      | 'BACKUPDRIVER';
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

    // Persist notification with type Chat and sender's name
    await this.prisma.notification.create({
      data: {
        sender: senderName,
        message: messageText,
        type: NotificationTypes.Chat,
        receiver: this.mapReceiver(receiverType),
        receiverId,
      },
    });

    // Look up token based on profile type
    const fcmToken = await this.getReceiverToken(receiverType, receiverId);
    if (!fcmToken) {
      this.logger.warn(`No FCM token for ${receiverType} ${receiverId}`);
      return false;
    }

    // Send push using existing FirebaseService
    try {
      await this.firebase.sendToDevice(
        fcmToken,
        `New message from ${senderName}`,
        messageText || 'New message',
        {
          type: 'chat_message',
          conversationId: String(conversationId),
        },
      );
      return true;
    } catch (err) {
      this.logger.error('Push notification failed:', err);
      return false;
    }
  }

  // Helper: get FCM token from respective profile table
  private async getReceiverToken(
    receiver:
      | 'CUSTOMER'
      | 'CHILD'
      | 'STAFF'
      | 'DRIVER'
      | 'WEBUSER'
      | 'VEHICLEOWNER'
      | 'BACKUPDRIVER',
    receiverId: number,
  ): Promise<string | null> {
    switch (receiver) {
      case 'CHILD': {
        // Children use customer's FCM token, but we need to fetch the customer first
        const child = await this.prisma.child.findUnique({
          where: { child_id: receiverId },
          select: { Customer: { select: { fcmToken: true } } },
        });
        return child?.Customer?.fcmToken ?? null;
      }
      case 'STAFF': {
        // Staff uses customer's FCM token (staff.id === customerId)
        const staff = await this.prisma.staff_Passenger.findUnique({
          where: { id: receiverId },
          select: { Customer: { select: { fcmToken: true } } },
        });
        return staff?.Customer?.fcmToken ?? null;
      }
      case 'WEBUSER': {
        const user = await this.prisma.webuser.findUnique({
          where: { id: receiverId },
          select: { fcmToken: true },
        });
        return user?.fcmToken ?? null;
      }
      case 'BACKUPDRIVER': {
        const b = await this.prisma.backupDriver.findUnique({
          where: { id: receiverId },
          select: { fcmToken: true },
        });
        return b?.fcmToken ?? null;
      }
      case 'DRIVER': {
        const d = await this.prisma.driver.findUnique({
          where: { driver_id: receiverId },
          select: { fcmToken: true },
        });
        return d?.fcmToken ?? null;
      }
      case 'CUSTOMER': {
        const c = await this.prisma.customer.findUnique({
          where: { customer_id: receiverId },
          select: { fcmToken: true },
        });
        return c?.fcmToken ?? null;
      }
      case 'VEHICLEOWNER': {
        // VehicleOwner.id == Webuser.id (relation). Token lives on Webuser
        const u = await this.prisma.webuser.findUnique({
          where: { id: receiverId },
          select: { fcmToken: true },
        });
        return u?.fcmToken ?? null;
      }
      default:
        return null;
    }
  }

  // Map incoming string type to Prisma enum
  private mapType(input: string): NotificationTypes {
    const key = input.trim().toUpperCase();
    switch (key) {
      case 'SYSTEM':
        return NotificationTypes.System;
      case 'ALERT':
        return NotificationTypes.Alert;
      case 'CHAT':
        return NotificationTypes.Chat;
      case 'OTHER':
      default:
        return NotificationTypes.Other;
    }
  }

  // Map incoming receiver to Prisma enum
  private mapReceiver(input: string): UserTypes {
    const key = input.trim().toUpperCase();
    switch (key) {
      case 'CUSTOMER':
        return UserTypes.CUSTOMER;
      case 'CHILD':
        return UserTypes.CHILD;
      case 'STAFF':
        return UserTypes.STAFF;
      case 'DRIVER':
        return UserTypes.DRIVER;
      case 'WEBUSER':
        return UserTypes.WEBUSER;
      case 'VEHICLEOWNER':
        return UserTypes.VEHICLEOWNER;
      case 'BACKUPDRIVER':
        return UserTypes.BACKUPDRIVER;
      default:
        return UserTypes.CUSTOMER;
    }
  }

  // Human-friendly time text
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
