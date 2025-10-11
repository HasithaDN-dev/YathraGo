import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserTypes } from '@prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // Create or get a conversation between two participants
  @Post('conversations')
  createConversation(
    @Body()
    body: {
      participantAId: number;
      participantAType:
        | 'CUSTOMER'
        | 'WEBUSER'
        | 'BACKUPDRIVER'
        | 'DRIVER'
        | 'VEHICLEOWNER';
      participantBType:
        | 'CUSTOMER'
        | 'WEBUSER'
        | 'BACKUPDRIVER'
        | 'DRIVER'
        | 'VEHICLEOWNER';
    },
  ) {
    return this.chat.upsertConversation(
      Number(body.participantAId),
      body.participantAType,
      Number(body.participantBId),
      body.participantBType,
    );
  }

  // List conversations for a user+type
  @Get('conversations')
  listConversations(
    @Query('userId') userId: string,
    @Query('userType')
    userType:
      | 'CUSTOMER'
      | 'WEBUSER'
      | 'BACKUPDRIVER'
      | 'DRIVER'
      | 'VEHICLEOWNER',
  ) {
    return this.chat.listConversations(Number(userId), userType);
  }

  // Get messages for a conversation with basic cursor pagination
  @Get('conversations/:id/messages')
  listMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.chat.listMessages(
      id,
      take ? Number(take) : 50,
      cursor ? Number(cursor) : undefined,
    );
  }

  // Send a message (text or image)
  @Post('messages')
  sendMessage(
    @Body()
    body: {
      conversationId: number;
      senderId: number;
      senderType: UserTypes;
      message?: string | null;
      imageUrl?: string | null;
    },
  ) {
    return this.chat.sendMessage({
      conversationId: Number(body.conversationId),
      senderId: Number(body.senderId),
      senderType: body.senderType,
      message: body.message ?? null,
      imageUrl: body.imageUrl ?? null,
    });
  }

  // Mark message as seen
  @Post('messages/:id/seen')
  markSeen(@Param('id', ParseIntPipe) id: number) {
    return this.chat.markSeen(id);
  }
}
