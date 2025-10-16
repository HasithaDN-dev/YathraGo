import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../common/services/firebase.service';

type SendNotificationInput = {
  sender: string;
  message: string;
  type: 'SYSTEM' | 'ALERT' | 'OTHER';
  receiver: 'CUSTOMER' | 'DRIVER' | 'WEBUSER' | 'VEHICLEOWNER' | 'BACKUPDRIVER';
  receiverId: number;
  data?: Record<string, string>;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async sendNotification(dto: SendNotificationInput) {
    // Normalize enums to Prisma enum values
    const type = this.mapType(dto.type);
    const receiver = this.mapReceiver(dto.receiver);

    // 1) Save to DB
    const notification = await (this.prisma as any).notification.create({
      data: {
        sender: dto.sender,
        message: dto.message,
        type: this.mapType(dto.type),
        receiver: this.mapReceiver(dto.receiver),
        receiverId: dto.receiverId,
      },
    });

    // 2) Get receiver FCM token
    const fcmToken = await this.getReceiverToken(receiver, dto.receiverId);

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

  async getNotifications(
    receiver:
      | 'CUSTOMER'
      | 'DRIVER'
      | 'WEBUSER'
      | 'VEHICLEOWNER'
      | 'BACKUPDRIVER',
    receiverId: number,
    durationMinutes?: number,
  ) {
    const where: any = {
      receiver: this.mapReceiver(receiver),
      receiverId,
    };
    if (durationMinutes && durationMinutes > 0) {
      const since = new Date(Date.now() - durationMinutes * 60 * 1000);
      where.createdAt = { gte: since };
    }

    const notifications = await (this.prisma as any).notification.findMany({
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

  private async getReceiverToken(
    receiver:
      | 'CUSTOMER'
      | 'DRIVER'
      | 'WEBUSER'
      | 'VEHICLEOWNER'
      | 'BACKUPDRIVER',
    receiverId: number,
  ) {
    switch (receiver) {
      case 'WEBUSER': {
        const user = await (this.prisma as any).webuser.findUnique({
          where: { id: receiverId },
        });
        return user?.fcmToken ?? null;
      }
      case 'BACKUPDRIVER': {
        const b = await (this.prisma as any).backupDriver.findUnique({
          where: { id: receiverId },
        });
        return b?.fcmToken ?? null;
      }
      case 'DRIVER': {
        const d = await (this.prisma as any).driver.findUnique({
          where: { driver_id: receiverId },
        });
        return d?.fcmToken ?? null;
      }
      case 'CUSTOMER': {
        const c = await (this.prisma as any).customer.findUnique({
          where: { customer_id: receiverId },
        });
        return c?.fcmToken ?? null;
      }
      case 'VEHICLEOWNER': {
        // VehicleOwner.id == Webuser.id (relation). Token lives on Webuser
        const u = await (this.prisma as any).webuser.findUnique({
          where: { id: receiverId },
        });
        return u?.fcmToken ?? null;
      }
      default:
        return null;
    }
  }

  private mapType(input: string): 'System' | 'Alerts' | 'Others' {
    const key = input.trim().toUpperCase();
    switch (key) {
      case 'SYSTEM':
        return 'System';
      case 'ALERT':
        return 'Alerts';
      case 'OTHER':
      default:
        return 'Others';
    }
  }

  private mapReceiver(
    input: string,
  ): 'CUSTOMER' | 'DRIVER' | 'WEBUSER' | 'VEHICLEOWNER' | 'BACKUPDRIVER' {
    const key = input.trim().toUpperCase();
    switch (key) {
      case 'CUSTOMER':
        return 'CUSTOMER';
      case 'DRIVER':
        return 'DRIVER';
      case 'WEBUSER':
        return 'WEBUSER';
      case 'VEHICLEOWNER':
        return 'VEHICLEOWNER';
      case 'BACKUPDRIVER':
        return 'BACKUPDRIVER';
      default:
        return 'CUSTOMER';
    }
  }

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
