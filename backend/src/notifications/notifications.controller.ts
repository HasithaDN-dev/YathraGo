import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  ParseEnumPipe,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  SendNotificationDto,
  MarkAsReadDto,
} from './dto/send-notification.dto';
import { UserTypes } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Get()
  async getNotifications(
    @Query('userType', new ParseEnumPipe(UserTypes)) userType: UserTypes,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationsService.getNotifications({ userType, userId });
  }

  @Get('unread-count')
  async getUnreadCount(
    @Query('userType', new ParseEnumPipe(UserTypes)) userType: UserTypes,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationsService.getUnreadCount(userType, userId);
  }

  @Patch('mark-as-read')
  async markAsRead(@Body() dto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(dto);
  }

  @Patch('mark-all-as-read')
  async markAllAsRead(
    @Body('userType', new ParseEnumPipe(UserTypes)) userType: UserTypes,
    @Body('userId') userId: number,
  ) {
    return this.notificationsService.markAllAsRead(userType, userId);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Query('userType', new ParseEnumPipe(UserTypes)) userType: UserTypes,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationsService.deleteNotification(id, userType, userId);
  }

  @Patch('fcm-token')
  async updateFcmToken(
    @Body('userType', new ParseEnumPipe(UserTypes)) userType: UserTypes,
    @Body('userId') userId: number,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.notificationsService.updateFcmToken(userType, userId, fcmToken);
  }

  @Get()
	async findAll() {
		return this.service.findAll();
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const n = await this.service.findOne(id);
		if (!n) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return n;
	}

	@Post()
	async create(@Body() body: any) {
		// expect { sender, message, type, receiver?, receiverId? }
		if (!body?.sender || !body?.message) {
			throw new HttpException('Missing sender or message', HttpStatus.BAD_REQUEST);
		}
		return this.service.create(body);
	}

	@Put(':id')
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
		const updated = await this.service.update(id, body);
		if (!updated) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return updated;
	}

	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number) {
		const ok = await this.service.remove(id);
		if (!ok) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return { success: true };
	}
}
