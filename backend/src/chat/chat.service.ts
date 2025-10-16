import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserTypes } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

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
        messages: { take: 1, orderBy: { id: 'desc' } },
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

        return {
          ...c,
          otherParticipant: { id: otherId, type: otherType, name, phone },
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

    return msg;
  }

  async markSeen(messageId: number) {
    const updated = await this.prisma.chat.update({
      where: { id: messageId },
      data: { seen: true, status: 'SEEN' },
    });
    return updated;
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
