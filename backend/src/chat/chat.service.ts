import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserTypes } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async upsertConversation(
    aId: number,
    aType: UserTypes,
    bId: number,
    bType: UserTypes,
  ) {
    // Ensure a deterministic ordering to satisfy the unique constraint regardless of call order
    const [participantAId, participantAType, participantBId, participantBType] =
      aId < bId ? [aId, aType, bId, bType] : [bId, bType, aId, aType];

    const conv = await this.prisma.conversation.upsert({
      where: {
        participantAId_participantAType_participantBId_participantBType: {
          participantAId,
          participantAType,
          participantBId,
          participantBType,
        },
      },
      update: {},
      create: {
        participantAId,
        participantAType,
        participantBId,
        participantBType,
      },
      include: { messages: { take: 1, orderBy: { id: 'desc' } } },
    });
    return conv;
  }

  async listConversations(forUserId: number, forUserType: UserTypes) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participantAId: forUserId, participantAType: forUserType },
          { participantBId: forUserId, participantBType: forUserType },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { id: 'desc' },
          select: {
            id: true,
            message: true,
            timestamp: true,
            seen: true,
            senderId: true,
            senderType: true,
          },
        },
      },
    });

    // Hydrate basic counterpart profile info (name/phone) when possible
    const enriched = await Promise.all(
      conversations.map(async (c) => {
        const isA =
          c.participantAId === forUserId && c.participantAType === forUserType;
        const otherId = isA ? c.participantBId : c.participantAId;
        const otherType = isA ? c.participantBType : c.participantAType;

        let name: string | null = null;
        let phone: string | null = null;
        if (otherType === 'CUSTOMER') {
          const rec = await this.prisma.customer.findUnique({
            where: { customer_id: otherId },
            select: { firstName: true, lastName: true, phone: true },
          });
          if (rec) {
            name = `${rec.firstName} ${rec.lastName}`.trim();
            phone = rec.phone;
          }
        } else if (otherType === 'DRIVER') {
          const rec = await this.prisma.driver.findUnique({
            where: { driver_id: otherId },
            select: { name: true, phone: true },
          });
          if (rec) {
            name = rec.name;
            phone = rec.phone;
          }
        } else if (otherType === 'WEBUSER' || otherType === 'VEHICLEOWNER') {
          // VehicleOwner's PK is same as related Webuser id in current schema
          const rec = await this.prisma.webuser.findUnique({
            where: { id: otherId },
            select: { username: true, email: true },
          });
          if (rec) {
            name = rec.username ?? rec.email;
          }
        }

        // determine avatar path depending on type
        let avatarPath: string | null = null;
        if (otherType === 'CUSTOMER') {
          const rec = await this.prisma.customer.findUnique({
            where: { customer_id: otherId },
            select: { profileImageUrl: true },
          });
          if (rec?.profileImageUrl) avatarPath = rec.profileImageUrl;
        } else if (otherType === 'DRIVER') {
          const rec = await this.prisma.driver.findUnique({
            where: { driver_id: otherId },
            select: { profile_picture_url: true },
          });
          if (rec?.profile_picture_url) avatarPath = rec.profile_picture_url;
        }

        // Normalize to absolute URL if backend base URL provided
        const base = (process.env.SERVER_BASE_URL || '').replace(/\/$/, '');
        const avatarUrl = avatarPath
          ? avatarPath.startsWith('http')
            ? avatarPath
            : base
              ? `${base}/uploads/${avatarPath.replace(/^\/+/, '')}`
              : avatarPath
          : null;

        return {
          ...c,
          otherParticipant: {
            id: otherId,
            type: otherType,
            name,
            phone,
            avatarUrl,
          },
          lastMessage: c.messages?.[0] ?? null,
        };
      }),
    );
    return enriched;
  }

  async listMessages(conversationId: number, take = 50, cursor?: number) {
    const where: Prisma.ChatWhereInput = { conversationId };
    const orderBy: Prisma.ChatOrderByWithRelationInput = { id: 'asc' };
    const messages = await this.prisma.chat.findMany({
      where,
      orderBy,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    return messages;
  }

  async sendMessage(params: {
    conversationId: number;
    senderId: number;
    senderType: UserTypes;
    message?: string | null;
    imageUrl?: string | null;
  }) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: params.conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');

    const msg = await this.prisma.chat.create({
      data: {
        conversationId: params.conversationId,
        senderId: params.senderId,
        senderType: params.senderType,
        message: params.message ?? null,
        imageUrl: params.imageUrl ?? null,
      },
    });

    await this.prisma.conversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    });

    // Determine receiver profile to notify
    const isA =
      convo.participantAId === params.senderId &&
      convo.participantAType === params.senderType;
    const receiverId = isA ? convo.participantBId : convo.participantAId;
    const receiverType = isA ? convo.participantBType : convo.participantAType;

    // Also detect if this conversation involves a CHILD participant so we can
    // show the child's name to drivers when notifying them.
    const childParticipantId =
      convo.participantAType === 'CHILD'
        ? convo.participantAId
        : convo.participantBType === 'CHILD'
        ? convo.participantBId
        : null;

    // Resolve sender's display name
    let senderName = 'User';
    if (params.senderType === 'CUSTOMER') {
      const c = await this.prisma.customer.findUnique({
        where: { customer_id: params.senderId },
        select: { firstName: true, lastName: true },
      });
      if (c) senderName = `${c.firstName} ${c.lastName}`.trim();
    } else if (params.senderType === 'DRIVER') {
      const d = await this.prisma.driver.findUnique({
        where: { driver_id: params.senderId },
        select: { name: true },
      });
      if (d?.name) senderName = d.name;
    } else if (params.senderType === 'CHILD') {
      // If a child sent the message, use the child's name for sender display (helps driver notifications)
      const ch = await this.prisma.child.findUnique({
        where: { child_id: params.senderId },
        select: { childFirstName: true, childLastName: true },
      });
      if (ch)
        senderName = `${ch.childFirstName || ''} ${ch.childLastName || ''}`.trim() || 'User';
    } else if (params.senderType === 'WEBUSER') {
      const w = await this.prisma.webuser.findUnique({
        where: { id: params.senderId },
        select: { username: true, email: true },
      });
      if (w) senderName = w.username ?? w.email ?? 'User';
    }

    // Build a more descriptive notification sender label depending on the
    // receiver: drivers should see the passenger label, children should see
    // the driver label.
    let notificationSenderName = senderName;

    // Resolve participant ids for convenience
    const driverParticipantId =
      convo.participantAType === 'DRIVER'
        ? convo.participantAId
        : convo.participantBType === 'DRIVER'
        ? convo.participantBId
        : null;

    const customerParticipantId =
      convo.participantAType === 'CUSTOMER'
        ? convo.participantAId
        : convo.participantBType === 'CUSTOMER'
        ? convo.participantBId
        : null;

    // Try to get passenger name (prefer child name when available)
    let passengerName: string | null = null;
    if (childParticipantId) {
      try {
        const ch = await this.prisma.child.findUnique({
          where: { child_id: childParticipantId },
          select: { childFirstName: true, childLastName: true },
        });
        if (ch)
          passengerName =
            `${ch.childFirstName || ''} ${ch.childLastName || ''}`.trim();
      } catch {
        // ignore
      }
    }
    if (!passengerName && customerParticipantId) {
      try {
        const cust = await this.prisma.customer.findUnique({
          where: { customer_id: customerParticipantId },
          select: { firstName: true, lastName: true },
        });
        if (cust)
          passengerName =
            `${cust.firstName || ''} ${cust.lastName || ''}`.trim();
      } catch {
        // ignore
      }
    }

    // Try to get driver name if needed
    let driverName: string | null = null;
    if (driverParticipantId) {
      try {
        const drv = await this.prisma.driver.findUnique({
          where: { driver_id: driverParticipantId },
          select: { name: true },
        });
        if (drv?.name) driverName = drv.name;
      } catch {
        // ignore
      }
    }

    if (receiverType === 'DRIVER' && passengerName) {
      notificationSenderName = `Passenger : ${passengerName}`;
    } else if (receiverType === 'CHILD' && driverName) {
      notificationSenderName = `Driver : ${driverName}`;
    }

    // Fire push + store notification as Others
    await this.notifications.sendNewMessagePush({
      senderName: notificationSenderName,
      messageText:
        params.message ??
        (params.imageUrl ? '📷 Sent an image' : 'New message'),
      receiverType,
      receiverId,
      conversationId: params.conversationId,
    });

    return msg;
  }

  async markSeen(messageId: number) {
    const updated = await this.prisma.chat.update({
      where: { id: messageId },
      data: { seen: true, status: 'SEEN' },
    });
    return updated;
  }

  async markConversationMessagesAsSeen(
    conversationId: number,
    forUserId: number,
    forUserType: UserTypes,
  ) {
    // Mark all messages in this conversation that were NOT sent by the current user as seen
    const result = await this.prisma.chat.updateMany({
      where: {
        conversationId,
        seen: false,
        NOT: {
          senderId: forUserId,
          senderType: forUserType,
        },
      },
      data: {
        seen: true,
        status: 'SEEN',
      },
    });
    return result;
  }

  handleImageUpload(file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    // Validate mimetype
    if (!file.mimetype.startsWith('image/')) {
      return { success: false, message: 'Only image files are allowed!' };
    }
    // Multer diskStorage already saves the file with a unique name in the correct folder
    if (!file.filename) {
      return {
        success: false,
        message: 'File upload failed: filename missing.',
      };
    }
    return {
      success: true,
      filename: file.filename,
      imageUrl: `uploads/chat/${file.filename}`,
    };
  }
}
