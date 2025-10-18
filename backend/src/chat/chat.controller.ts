import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UserTypes } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // Create or get a conversation between two participants
  @Post('conversations')
  createConversation(
    @Body()
    body: {
      participantAId: number;
      participantBId: number;
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

  // Mark all unread messages in a conversation as seen
  @Post('conversations/:id/mark-seen')
  markConversationAsSeen(
    @Param('id', ParseIntPipe) conversationId: number,
    @Body() body: { userId: number; userType: UserTypes },
  ) {
    return this.chat.markConversationMessagesAsSeen(
      conversationId,
      Number(body.userId),
      body.userType,
    );
  }

  // Upload chat image
  @Post('upload-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, '../../uploads/chat'));
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const base = path.basename(file.originalname, ext);
          const uniqueName = `${base}_${Date.now()}${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadChatImage(@UploadedFile() file: Express.Multer.File) {
    return this.chat.handleImageUpload(file);
  }
}
